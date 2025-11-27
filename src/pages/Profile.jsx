import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import parishBanner from "../assets/images/SaintLaurence_bg.png";
import { useUser } from "@/context/useUser";
import { getInitial } from "@/lib/utils";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input, PasswordInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import useProfile from "@/hooks/useProfile";
import { Icon } from "@iconify/react";
import { Switch } from "@/components/ui/switch";
import ChangeProfile from "@/components/ChangeProfile";
import { Link } from "react-router-dom";

const nameSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const contactSchema = z.object({
  contactNumber: z
    .string()
    .trim()
    .refine(
      (value) => {
        // Remove all spaces, dashes, and parentheses
        const cleaned = value.replace(/[\s\-()]/g, "");

        // UK numbers can start with:
        // - 07 for mobile (followed by 9 digits)
        // - 01, 02, 03 for landlines (followed by 9 digits)
        // - +44 or 0044 international format (followed by 10 digits, removing the initial 0)

        // Check if it's a valid UK format
        const mobileRegex = /^07\d{9}$/; // Mobile: 07xxx xxx xxx
        const landlineRegex = /^0(1|2|3)\d{9}$/; // Landline: 01xxx xxx xxx, 02xxx xxx xxx, 03xxx xxx xxx
        const internationalRegex = /^(\+44|0044)\d{10}$/; // International: +44 xxxx xxx xxx or 0044 xxxx xxx xxx

        return (
          mobileRegex.test(cleaned) ||
          landlineRegex.test(cleaned) ||
          internationalRegex.test(cleaned)
        );
      },
      {
        message: "Please enter a valid contact number",
      }
    ),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "you must input your current password."),
    password: z.string().min(6, "Password must be 6 digits"),
    confirmPassword: z.string().min(1, "Retype your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password must be match",
    path: ["confirmPassword"],
  });

const Profile = () => {
  const { userData } = useUser();

  const { data, isLoading } = useProfile({
    user_id: userData?.id,
  });

  // Get the user's initials
  const initials = useMemo(() => {
    return `${getInitial(data?.first_name)}${getInitial(data?.last_name)}`;
  }, [data?.first_name, data?.last_name]);

  // Get the profile image URL
  const profileImageUrl = useMemo(() => {
    return userData?.profile_picture_url;
  }, [userData?.profile_picture_url]);

  if (isLoading || !userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-y-28 md:gap-y-40">
        {/* Banner */}
        <div
          className="relative h-32 w-full rounded-xl bg-cover bg-no-repeat md:h-60"
          style={{
            backgroundImage: `url(${parishBanner})`,
            backgroundPosition: "center 87%",
          }}
        >
          {/* Avatar */}
          <div className="absolute -bottom-14 left-3 flex items-center gap-x-2 md:-bottom-16 md:left-16 lg:-bottom-20 lg:left-24">
            <div className="relative flex h-24 w-24 cursor-auto items-center justify-center rounded-full border-[7px] border-white bg-accent text-2xl text-white md:h-32 md:w-32 md:text-4xl lg:h-40 lg:w-40">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile Picture"
                  className="h-full w-full overflow-hidden rounded-full object-cover"
                />
              ) : (
                <span>{`${initials}` || "?"}</span>
              )}
              <ChangeProfile
                userId={userData?.id}
                profileImageUrl={profileImageUrl}
              />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-4 md:mt-16 md:text-4xl lg:mt-20 lg:text-5xl">
              <p className="text-lg font-bold text-accent capitalize">{`${data?.first_name} ${data?.last_name}`}</p>
              <EditNameForm
                userId={data?.id}
                firstName={data?.first_name}
                lastName={data?.last_name}
              />
            </div>
          </div>
        </div>
        {/* Information */}
        <div className="md:px-32 lg:pl-48 lg:pr-72">
          <div className="flex flex-col gap-y-4">
            <Label className="text-sm font-bold text-accent/75">Email</Label>
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBFA] px-6 py-5 font-semibold text-accent">
              <p>{data?.email || "No email provided"}</p>
              <EditEmailForm userId={data?.id} />
            </div>
            <Label className="text-sm font-bold text-accent/75">Contact</Label>
            <div className="flex items-center justify-between rounded-xl bg-[#FDFBFA] px-6 py-5 font-semibold text-accent">
              <p>{data?.contact_number}</p>
              <ContactForm userId={data?.id} />
            </div>
            <Label className="text-sm font-bold text-accent/75">
              Notification
            </Label>
            <div className="rounded-xl bg-[#FDFBFA] px-6 py-5 font-semibold text-accent">
              <EmailNotification
                userId={data?.id}
                isEmailNotificationEnabled={data?.email_notifications_enabled}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <ChangePasswordButton userId={data?.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const EditNameForm = ({ userId, firstName, lastName }) => {
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
    },
  });

  // Get the mutation from your hook
  const { updateNameMutation } = useProfile({
    user_id: userId,
  });

  const onSubmit = (values) => {
    updateNameMutation.mutate(
      {
        user_id: userId,
        first_name: values.firstName,
        last_name: values.lastName,
      },
      {
        onSuccess: () => {
          setIsNameDialogOpen(false);
          form.reset();
        },
      }
    );
  };

  // This useEffect will update the form values when props change
  useEffect(() => {
    form.reset({
      firstName: firstName || "",
      lastName: lastName || "",
    });
  }, [firstName, lastName, form]);

  return (
    <AlertDialog
      open={isNameDialogOpen}
      onOpenChange={(open) => {
        setIsNameDialogOpen(open);

        if (!open) {
          form.reset();
        }
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-accent hover:text-accent"
          size="sm"
        >
          <Icon icon="mingcute:edit-2-line" height={20} width={20} />
          Edit
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update your name</AlertDialogTitle>
          <AlertDialogDescription>
            Change your name to keep your profile up to date.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form id="name-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button type="submit" form="name-form" className="flex-1">
            Update
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

EditNameForm.propTypes = {
  userId: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string,
};

const EditEmailForm = ({ userId }) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [lastEmail, setLastEmail] = useState("");

  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const { sendEmailLinkMutation } = useProfile({
    user_id: userId,
  });

  const onSubmit = (values) => {
    localStorage.setItem("newEmail", values.email);
    setLastEmail(values.email);
    setCooldownTime(60);
    sendEmailLinkMutation.mutate({
      email: values.email,
    });
  };

  // Resend handler
  const handleResend = () => {
    if (cooldownTime === 0 && lastEmail) {
      setCooldownTime(60); // Reset the cooldown
      sendEmailLinkMutation.mutate({ email: lastEmail });
    }
  };

  // Handle countdown timer
  useEffect(() => {
    let timer;
    if (cooldownTime > 0) {
      timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldownTime]);

  return (
    <AlertDialog
      open={isEmailDialogOpen}
      onOpenChange={(open) => {
        setIsEmailDialogOpen(open);
        // Reset form and cooldown when dialog is closed
        if (!open) {
          form.reset();
          setCooldownTime(0);
          setLastEmail("");
        }
      }}
    >
      <AlertDialogTrigger>Edit</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Your Email Address</AlertDialogTitle>
          <AlertDialogDescription>
            When you click &quot;Send Change Email Verification,&quot; an email
            will be sent to both your current and new email addresses. You must
            click the link in both emails to complete the change.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form id="email-form" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Email Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {cooldownTime > 0 || lastEmail ? (
            <Button
              type="button"
              onClick={handleResend}
              disabled={cooldownTime > 0 || sendEmailLinkMutation.isPending}
            >
              {sendEmailLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                `Resend Verification ${cooldownTime > 0 ? `(${cooldownTime})` : ""}`
              )}
            </Button>
          ) : (
            <Button
              type="submit"
              form="email-form"
              disabled={sendEmailLinkMutation.isPending}
            >
              {sendEmailLinkMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Change Email Verification"
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

EditEmailForm.propTypes = {
  userId: PropTypes.string,
};

const ContactForm = ({ userId }) => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  const { updateContactMutation } = useProfile({
    user_id: userId,
  });

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      contactNumber: "",
    },
  });

  const handleUpdateContact = (data) => {
    updateContactMutation.mutate(
      {
        userId,
        newContactNumber: data.contactNumber,
      },
      {
        onSuccess: () => {
          setIsContactDialogOpen(false);
        },
      }
    );
  };

  return (
    <AlertDialog
      open={isContactDialogOpen}
      onOpenChange={setIsContactDialogOpen}
    >
      <AlertDialogTrigger>Edit</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Your Contact Number</AlertDialogTitle>
          <AlertDialogDescription>
            When you click &quot;Update Contact Number,&quot; your contact
            number will be updated in our records.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Form {...form}>
            <form
              id="contact-form"
              onSubmit={form.handleSubmit(handleUpdateContact)}
            >
              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button type="submit" form="contact-form" className="flex-1">
            Update
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ContactForm.propTypes = {
  userId: PropTypes.string,
};

const EmailNotification = ({ userId, isEmailNotificationEnabled }) => {
  // Create local state to track the toggle value
  const [isEnabled, setIsEnabled] = useState(isEmailNotificationEnabled);

  const { toggleEmailNotificationMutation } = useProfile({ user_id: userId });

  // Update local state when prop changes (e.g., initial load)
  useEffect(() => {
    setIsEnabled(isEmailNotificationEnabled);
  }, [isEmailNotificationEnabled]);

  const toggleNotification = async (newValue) => {
    // Optimistically update the UI immediately
    setIsEnabled(newValue);

    // Send request to the server
    toggleEmailNotificationMutation.mutate(
      {
        userId,
        isReceivingNotification: newValue,
      },
      {
        // If the server request fails, revert the UI to the previous state
        onError: () => {
          setIsEnabled(!newValue);
        },
      }
    );
  };

  return (
    <div className="flex items-center justify-between">
      <p>Email Notification</p>
      <Switch checked={isEnabled} onCheckedChange={toggleNotification} />
    </div>
  );
};

EmailNotification.propTypes = {
  userId: PropTypes.string.isRequired,
  isEmailNotificationEnabled: PropTypes.bool.isRequired,
};

const ChangePasswordButton = ({ userId }) => {
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const form = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { updatePasswordMutation } = useProfile({
    user_id: userId,
  });

  const onSubmit = (values) => {
    updatePasswordMutation.mutate(
      {
        currentPassword: values.currentPassword,
        password: values.password,
      },
      {
        onSuccess: () => {
          setChangePasswordDialogOpen(false);
          form.reset();
        },
      }
    );
  };

  return (
    <div className="flex w-full justify-between">
      <Link to="/family">
        <Button>View Family Details</Button>
      </Link>
      <AlertDialog
        open={changePasswordDialogOpen}
        onOpenChange={(open) => {
          setChangePasswordDialogOpen(open);

          if (!open) {
            form.reset();
          }
        }}
      >
        <AlertDialogTrigger asChild>
          <Button>Update Password</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update your password</AlertDialogTitle>
            <AlertDialogDescription>
              Update your password to keep your account secure. Make sure to
              choose a strong password that you haven&apos;t used before.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Form {...form}>
              <form
                id="password-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          disabled={updatePasswordMutation.isPending}
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          disabled={updatePasswordMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          disabled={updatePasswordMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              form="password-form"
              disabled={updatePasswordMutation.isPending}
              className="flex-1"
            >
              {updatePasswordMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

ChangePasswordButton.propTypes = {
  userId: PropTypes.string,
};

export default Profile;
