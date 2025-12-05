import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Icon } from "@iconify/react";
import { useUser } from "@/context/useUser";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/zodSchema/LoginSchema";
import { loginWithGoogle, loginWithMicrosoft } from "@/services/userService";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { login, loading } = useUser();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => {
    setPasswordVisible((prevState) => !prevState);
  };

  const handleLogin = async (data) => {
    try {
      await login(data);
      setIsDialogOpen(false);
      // navigate(loc?.state?.from || "/announcements", { replace: true });
      toast({
        title: "Login Successfully",
      });
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      await loginWithMicrosoft();
    } catch (error) {
      toast({
        title: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDialogReset = () => {
    setIsDialogOpen(false); // Close dialog
    form.reset(); // Reset form fields
    setPasswordVisible(false); // Reset password visibility state
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleDialogReset();
        } else {
          setIsDialogOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="login">Login</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="h-fit space-y-3">
          <DialogTitle className="text-center text-2xl font-semibold text-primary-text">
            Login
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm text-primary-text">
            Enter your account information to access your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="login"
            onSubmit={form.handleSubmit(handleLogin)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-primary-text">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm font-medium text-primary-text">
                      Password
                    </FormLabel>
                    <ForgotPassword />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? "text" : "password"}
                        className="w-full pr-10"
                        placeholder="Enter your password"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-muted-foreground hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <Icon
                          icon={passwordVisible ? "mdi:eye-off" : "mdi:eye"}
                          width="20"
                          height="20"
                          color="#663E2F"
                        />
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                form={"login"}
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        <div className="flex items-center justify-center gap-x-2">
          <div className="h-[1px] w-full bg-primary-outline"></div>
          <span className="text-primary-text">or</span>
          <div className="h-[1px] w-full bg-primary-outline"></div>
        </div>

        <div className="flex flex-col gap-y-2">
          <Button
            variant="outline"
            className="w-full text-primary-text"
            onClick={handleGoogleLogin}
          >
            <Icon icon="logos:google-icon" width="20" height="20" />
            Continue with Google
          </Button>
          <Button
            variant="outline"
            className="w-full text-primary-text"
            onClick={handleMicrosoftLogin}
          >
            <Icon icon="logos:microsoft-icon" width="20" height="20" />
            Continue with Microsoft
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Login;
