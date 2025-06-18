import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useLicense from "@/hooks/useLicense";
import Loading from "../Loading";
import PropTypes from "prop-types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
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
import { sendLicenseSchema } from "@/zodSchema/Request/LicenseSchema";
import {
  activateLicense,
  deactivateLicense,
  removeLicense,
  resendLicense,
} from "@/services/userService";

const LicenseList = ({ status }) => {
  const { licenseQuery } = useLicense({ status });
  const { data, isError, error, isLoading } = licenseQuery;

  if (isLoading) return <Loading />;
  if (isError) return <div>Error loading licenses: {error.message}</div>;

  return (
    <Table>
      <TableHeader className="bg-primary">
        <TableRow>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Email</TableHead>
          <TableHead className="text-center">License Code</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="rounded-r-lg text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data?.length > 0 ? (
          data?.map((license, index) => {
            let statusLabel, statusClass;
            if (!license.is_token_used && !license.users?.is_license_verified) {
              statusLabel = "Pending";
              statusClass = "bg-orange-100 text-orange-800";
            } else if (
              license.is_token_used &&
              license.users?.is_license_verified
            ) {
              statusLabel = "Active";
              statusClass = "bg-green-100 text-green-800";
            } else if (
              license.is_token_used &&
              !license.users?.is_license_verified
            ) {
              statusLabel = "Inactive";
              statusClass = "bg-red-100 text-red-800";
            } else {
              statusLabel = "Unknown";
              statusClass = "bg-gray-100 text-gray-800";
            }

            return (
              <TableRow
                key={`${license.id}-${license.users?.id}`}
                className={
                  index % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
                }
              >
                <TableCell className="text-center">
                  {`${license.users?.first_name} ${license.users?.last_name}`}
                </TableCell>
                <TableCell className="text-center">
                  {license.users?.email}
                </TableCell>
                <TableCell className="text-center">
                  {license.license_code || "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`rounded px-2 py-1 text-sm ${statusClass}`}>
                    {statusLabel}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <ActionButton
                    license={license}
                    user={license.users}
                    statusLabel={statusLabel}
                  />
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="py-4 text-center">
              No licenses found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

const ActionButton = ({ license, user, statusLabel }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(sendLicenseSchema),
    defaultValues: {
      licenseCode: "",
    },
  });

  const deactivateLicenseMutation = useMutation({
    mutationFn: deactivateLicense,
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to deactivate license: ${error.message}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License deactivated successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-licenses", license.status]);
      setPopoverOpen(false);
      setOpenDialog(null);
    },
  });

  const handleResendEmailMutation = useMutation({
    mutationFn: (licenseId) => resendLicense(licenseId),
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to resend email: ${error.message}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email resent successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-licenses", license.status]);
      setPopoverOpen(false);
      setOpenDialog(null);
      form.reset();
    },
  });

  const handleRemoveLicenseMutation = useMutation({
    mutationFn: removeLicense,
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to remove license: ${error.message}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License removed successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-licenses", license.status]);
      setPopoverOpen(false);
      setOpenDialog(null);
      form.reset();
    },
  });

  const handleSendLicenseMutation = useMutation({
    // mutationFn: ,
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to send license: ${error.message}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License sent successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-licenses", license.status]);
      setPopoverOpen(false);
      setOpenDialog(null);
      form.reset();
    },
  });

  const activateLicenseMutation = useMutation({
    mutationFn: ({ licenseId, licenseCode }) =>
      activateLicense({ licenseId, licenseCode }),
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to activate license: ${error.message}`,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "License activated successfully.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-licenses", license.status]);
      setPopoverOpen(false);
      setOpenDialog(null);
    },
  });

  // Handle deactivating license
  const handleDeactivate = (licenseId) => {
    deactivateLicenseMutation.mutate(licenseId);
  };

  // Handle resending email
  const handleResendEmail = (licenseId) => {
    handleResendEmailMutation.mutate(licenseId);
  };

  // Handle removing license
  const handleRemoveLicense = (licenseId) => {
    handleRemoveLicenseMutation.mutate(licenseId);
  };
  // Handle sending license
  const handleSendLicense = (data) => {
    handleSendLicenseMutation.mutate({
      email: user?.email,
      licenseCode: data.licenseCode.trim(),
    });
  };

  // Handle activating license
  const handleActivateLicense = (data) => {
    activateLicenseMutation.mutate({
      licenseId: license.id,
      licenseCode: data?.licenseCode?.trim() || license.license_code,
    });
  };

  if (statusLabel === "Active") {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Icon icon={"mingcute:more-1-line"} className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0">
          <AlertDialog
            open={openDialog === "deactivate"}
            onOpenChange={(open) => !open && setOpenDialog(null)}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setOpenDialog("deactivate")}
              >
                Deactivate
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to deactivate the license for{" "}
                  {user?.first_name} {user?.last_name}?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setOpenDialog(null)}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  className="flex-1"
                  variant="destructive"
                  onClick={() => handleDeactivate(license.id)}
                  disabled={deactivateLicenseMutation.isPending}
                >
                  {deactivateLicenseMutation.isPending
                    ? "Deactivating..."
                    : "Deactivate"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </PopoverContent>
      </Popover>
    );
  }

  if (statusLabel === "Pending") {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Icon icon={"mingcute:more-1-line"} className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40 p-0">
          <div className="space-y-1">
            <AlertDialog
              open={openDialog === "resend"}
              onOpenChange={(open) => !open && setOpenDialog(null)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setOpenDialog("resend")}
                >
                  Resend Email
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Resend Email</AlertDialogTitle>
                  <AlertDialogDescription>
                    Resend the license email to {user?.email} with the group
                    code.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpenDialog(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="flex-1"
                    type="submit"
                    form="resend-email-form"
                    onClick={() => handleResendEmail(license.id)}
                    disabled={handleResendEmailMutation.isPending}
                  >
                    {handleResendEmailMutation.isPending
                      ? "Sending..."
                      : "Resend Email"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
              open={openDialog === "remove"}
              onOpenChange={(open) => !open && setOpenDialog(null)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setOpenDialog("remove")}
                >
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove License</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove the license for{" "}
                    {user?.first_name} {user?.last_name}?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpenDialog(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => handleRemoveLicense(license.id)}
                    disabled={handleRemoveLicenseMutation.isPending}
                  >
                    {handleRemoveLicenseMutation.isPending
                      ? "Removing..."
                      : "Remove License"}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Inactive status
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Icon icon={"mingcute:more-1-line"} className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <AlertDialog
          open={openDialog === "activate"}
          onOpenChange={(open) => {
            if (!open) {
              setOpenDialog(null);
            }
          }}
        >
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                form.reset({ licenseCode: license.license_code || "" });
                setOpenDialog("activate");
              }}
            >
              Activate
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activate License</AlertDialogTitle>
              <AlertDialogDescription>
                Activate License for {user?.first_name} {user?.last_name} (
                {user?.email})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Form {...form}>
                <form
                  id="send-license-form"
                  onSubmit={form.handleSubmit(handleSendLicense)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="licenseCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>License Code</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter license code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </AlertDialogBody>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenDialog(null)}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                className="flex-1"
                form="send-license-form"
                onClick={form.handleSubmit(handleActivateLicense)}
              >
                Activate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </PopoverContent>
    </Popover>
  );
};
ActionButton.propTypes = {
  license: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  statusLabel: PropTypes.string.isRequired,
};

LicenseList.propTypes = {
  status: PropTypes.string.isRequired,
};

export default LicenseList;
