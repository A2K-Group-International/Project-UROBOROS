import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { z } from "zod";
import { forgotPassword } from "@/services/userService";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const emailSchema = z.object({
  forgotemail: z.string().email("You must input a valid email."),
});

const ForgotPassword = () => {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setButtonDisabled] = useState(false);

  const sendVerificationMutation = useMutation({
    mutationFn: async (data) => forgotPassword(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email Sent.",
      });

      // Disable the button and start the countdown
      setButtonDisabled(true);
      setCountdown(30);

      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            // Stop the timer when it reaches 0
            clearInterval(timer);
            setButtonDisabled(false);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    },
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      forgotemail: "",
    },
  });

  const onSubmit = (data) => {
    sendVerificationMutation.mutate(data.forgotemail);
  };

  return (
    <Dialog>
      <DialogTrigger className="text-xs text-primary-text">
        Forgot Password?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password?</DialogTitle>
          <DialogDescription>
            Enter your email for verification.
          </DialogDescription>
        </DialogHeader>
        <Form {...forgotPasswordForm}>
          <form onSubmit={forgotPasswordForm.handleSubmit(onSubmit)}>
            <FormField
              control={forgotPasswordForm.control}
              name="forgotemail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g johndoe@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isButtonDisabled || sendVerificationMutation.isPending}
              className="mt-2 w-full"
            >
              {isButtonDisabled
                ? `Resend in ${countdown}s`
                : sendVerificationMutation.isPending
                  ? "Sending Email Verification..."
                  : "Send Email Verification"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPassword;
