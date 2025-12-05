import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { completeProfileSchema } from "@/zodSchema/CompleteProfileSchema";
import { useUser } from "@/context/useUser";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";

const CompleteProfile = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const { toast } = useToast();
  const { completeOAuthRegistration, loading } = useUser();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      email: "",
    },
  });

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        form.setValue("email", user.email);

        // Check if user already has a profile
        const { data: userProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (userProfile) {
          navigate("/announcements"); // Redirect if profile already exists
        }
      } else {
        navigate("/"); // Redirect if no user found
      }
    };
    getUser();
  }, [navigate, form]);

  const onSubmit = async (values) => {
    try {
      await completeOAuthRegistration(values);
      toast({
        title: "Profile Completed Successfully",
        description: "Welcome to the community!",
      });
      navigate("/announcements");
    } catch (error) {
      console.error("Error completing profile:", error);
      toast({
        title: "Error",
        description:
          error.message || "There was an issue completing your profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-y-auto bg-[#FFDECE] bg-[url('@/assets/svg/backdrop_clean.svg')] bg-right-bottom bg-no-repeat md:bg-bottom lg:bg-cover">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* St Laurence Statue */}
        <div className="absolute bottom-[5dvw] right-[8dvw] z-20 hidden h-[30dvw] w-[12dvw] bg-[url('@/assets/svg/st_laurence.svg')] bg-contain bg-center bg-no-repeat transition-all duration-500 hover:scale-105 lg:block">
          <a
            href="https://www.saintlaurence.org.uk/"
            className="absolute z-10 h-full w-full"
            target="_blank"
          ></a>
        </div>

        <div className="z-30 w-full max-w-xl rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-primary-text">
              Complete Your Profile
            </h2>
            <p className="mt-1 text-xs text-primary-text/80">
              Finalize your account details below.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-primary-text">
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John"
                          {...field}
                          className="h-9 bg-white text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-primary-text">
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          {...field}
                          className="h-9 bg-white text-sm"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-primary-text">
                      Contact Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+44 7123 456789"
                        {...field}
                        className="h-9 bg-white text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Hidden Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input {...field} type="hidden" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="border-gray-100 flex items-start space-x-2 rounded-lg border bg-white/50 p-3">
                <Checkbox
                  id="terms"
                  checked={isAgreed}
                  onCheckedChange={setIsAgreed}
                  className="mt-0.5 h-3.5 w-3.5 border-primary-text data-[state=checked]:bg-primary-text data-[state=checked]:text-white"
                />
                <label
                  htmlFor="terms"
                  className="text-[10px] leading-relaxed text-primary-text/80"
                >
                  I confirm that St Laurence&apos;s Parish may store the
                  personal information provided here and may use this data to
                  contact me (including by email) about Parish support, news,
                  and activities. This data may be shared with Parish staff and
                  volunteers administering the Parish database, and with
                  volunteers who organise support or activities in which I
                  expressed an interest. I understand that I can withdraw this
                  consent any time by contacting the Parish Office.
                </label>
              </div>

              <Button
                type="submit"
                className="h-9 w-full bg-[#663F30] text-sm hover:bg-[#5a3629]"
                disabled={loading || !isAgreed}
              >
                {loading ? "Completing Profile..." : "Complete Profile"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
