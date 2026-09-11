import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { parishionerRegisterSchema } from "@/zodSchema/ParishionerRegisterSchema";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  resendSignUpOtp,
  signUp,
  verifySignUpOtp,
} from "@/services/authService";

const RESEND_COOLDOWN_SECONDS = 60;

const ParishionerRegister = ({ initializingUserRef }) => {
  const [step, setStep] = useState("details");
  const [isAgreed, setIsAgreed] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  // Form setup with react-hook-form and Zod validation
  const form = useForm({
    resolver: zodResolver(parishionerRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Count down the resend cooldown
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (_, values) => {
      setRegisteredEmail(values.email);
      setOtp("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep("verify");
      toast({
        title: "Check your email",
        description: `We sent a 6-digit code to ${values.email}.`,
      });
    },
    onError: (error) => {
      console.error("Error creating profile:", error);

      // Check for email already exists error
      if (
        error.message ===
        "Email already registered. Please use a different one."
      ) {
        toast({
          title: "Error",
          description:
            "This email is already registered. Please use a different one.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description:
            "There was an issue creating the profile. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, token }) => {
      // Keep Home's auth listener from redirecting before the profile exists
      if (initializingUserRef) initializingUserRef.current = true;
      return verifySignUpOtp(email, token);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created Successfully",
        description: "Welcome to the community!",
      });
      navigate("/announcements");
    },
    onError: (error) => {
      if (initializingUserRef) initializingUserRef.current = false;
      setOtp("");
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code.",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendSignUpOtp,
    onSuccess: () => {
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast({
        title: "Code Sent",
        description: `A new code has been sent to ${registeredEmail}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend the code.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values) => {
    signUpMutation.mutate(values);
  };

  const onVerify = () => {
    verifyMutation.mutate({ email: registeredEmail, token: otp });
  };

  // Reset form and states on dialog close
  const reset = () => {
    form.reset(); // Reset form fields
    setStep("details"); // Go back to the details step
    setShowPassword(false); // Reset password visibility
    setIsAgreed(false); // Reset agreement checkbox
    setRegisteredEmail("");
    setOtp("");
    setCooldown(0);
  };

  // Handle dialog close event
  const handleDialogClose = (isOpen) => {
    if (!isOpen) {
      reset();
    }
  };

  return (
    <Dialog onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="landingsecondary">Create Profile</Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "no-scrollbar h-[45rem] overflow-scroll sm:max-w-2xl md:h-auto",
          step === "verify" && "h-auto"
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "details" ? "Create New Profile" : "Verify your email"}
          </DialogTitle>
          <DialogDescription>
            {step === "details"
              ? "Create a new profile to join the platform."
              : `Enter the 6-digit code sent to ${registeredEmail}.`}
          </DialogDescription>
        </DialogHeader>
        {step === "details" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <div className="flex w-full flex-col gap-x-2 md:flex-row">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Tel No.</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+441172345678"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g john@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex w-full flex-col gap-x-2 md:flex-row">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-primary-text">
                <Checkbox
                  checked={showPassword}
                  onCheckedChange={(checked) => setShowPassword(checked)}
                />
                <p>Show Password</p>
              </div>
              <div className="text-gray-500 mt-2 flex gap-1 text-xs text-primary-text">
                <Checkbox
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(checked)}
                />
                I confirm that St Laurence&apos;s Parish may store the personal
                information provided here and may use this data to contact me
                (including by email) about Parish support, news, and activities.
                This data may be shared with Parish staff and volunteers
                administering the Parish database, and with volunteers who
                organise support or activities in which I expressed an interest.
                I understand that I can withdraw this consent any time by
                contacting the Parish Office.
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={signUpMutation.isPending || !isAgreed}
                >
                  {signUpMutation.isPending ? "Registering..." : "Register"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col gap-4">
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={otp}
              onChange={setOtp}
              disabled={verifyMutation.isPending}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="flex flex-col items-center gap-3 rounded-md border border-accent/30 bg-primary/50 p-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-accent">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={cooldown > 0 || resendMutation.isPending}
                onClick={() => resendMutation.mutate(registeredEmail)}
                className="w-full sm:w-auto"
              >
                {resendMutation.isPending
                  ? "Resending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Code"}
              </Button>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("details")}
                disabled={verifyMutation.isPending}
              >
                Back
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={onVerify}
                disabled={otp.length !== 6 || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? "Verifying..." : "Verify"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

ParishionerRegister.propTypes = {
  initializingUserRef: PropTypes.shape({ current: PropTypes.bool }),
};

export default ParishionerRegister;
