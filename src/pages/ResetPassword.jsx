import { Description, Title } from "@/components/Title";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { resetPassword } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/services/supabaseClient";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be 6 digits"),
    confirmPassword: z.string().min(1, "Retype your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password must be match",
    path: ["confirmPassword"],
  });

export const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  const changePasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => resetPassword(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password updated.",
      });

      // Navigate to login after successful password reset
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: `Error updating password, ${error.message}`,
      });

      // If error is about expired token, mark token as invalid
      if (error.message?.toLowerCase().includes("expired")) {
        setIsTokenValid(false);
      }
    },
  });

  const onSubmit = (data) => {
    resetPasswordMutation.mutate({ password: data.password });
  };

  // Check if token is valid
  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsValidating(true);

        // When Supabase loads a reset password page with a token, it automatically
        // processes the token and updates the auth state
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Check the current auth state
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event) => {
            if (event === "PASSWORD_RECOVERY") {
              // This event means we have a valid recovery token
              setIsTokenValid(true);
            } else if (event === "USER_UPDATED") {
              // This happens after a successful password reset
              setIsTokenValid(true);
            }

            setIsValidating(false);
          }
        );

        // If we already have a recovery session when the page loads
        if (session?.user) {
          setIsTokenValid(true);
          setIsValidating(false);
        }

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("Error validating token:", error);
        setIsTokenValid(false);
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  // Show loading while validating token
  if (isValidating) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-gray-600 mt-4">Validating the link...</p>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isTokenValid) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center p-4 text-accent">
        <div>
          <div className="flex flex-col items-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <h1 className="mt-4 text-center text-2xl font-bold text-accent">
              Invalid or Expired Link
            </h1>
            <p className="text-gray-600 mt-2 text-center">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Button onClick={() => navigate("/")} className="mt-2">
              Back to Home page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full items-center justify-center">
      <div className="flex flex-col gap-y-2">
        <Title>Reset Password</Title>
        <Description>
          Change your password to regain access to your account.
        </Description>
        <Form {...changePasswordForm}>
          <form onSubmit={changePasswordForm.handleSubmit(onSubmit)}>
            <FormField
              control={changePasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={changePasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <Input
                type="checkbox"
                onClick={togglePasswordVisibility}
                className="h-4 w-4 cursor-pointer"
              />
              <p>Show Password</p>
            </div>
            <div className="flex items-center justify-end">
              <Button
                type="submit"
                className="mt-2"
                disabled={resetPasswordMutation.isLoading}
              >
                {resetPasswordMutation.isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Password"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
