import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/context/useUser";
import { useToast } from "@/hooks/use-toast";
import { loginSchema } from "@/zodSchema/LoginSchema";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loc = useLocation();
  const navigate = useNavigate();
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
      await login(data); // Trigger login and get user data
      setIsDialogOpen(false); // Close dialog
      navigate(loc?.state?.from || "/announcements", { replace: true });
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
          <DialogTitle className="text-2xl font-semibold">Login</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
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
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type={passwordVisible ? "text" : "password"}
                      className="w-full"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="my-2 flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <input type="checkbox" onClick={togglePasswordVisibility} />
                <p>Show Password</p>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button form={"login"} type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <ForgotPassword />
      </DialogContent>
    </Dialog>
  );
};

export default Login;
