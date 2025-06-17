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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
          <TableHead className="text-center">Code</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="rounded-r-lg text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data && data.length > 0 ? (
          data.map((license, index) => {
            let statusLabel, statusClass;
            if (license.licenses.length === 0) {
              if (license.is_license_verified) {
                statusLabel = "Verified";
                statusClass = "bg-green-100 text-green-800";
              } else {
                statusLabel = "Unverified";
                statusClass = "bg-red-100 text-red-800";
              }
            } else {
              statusLabel = "Pending";
              statusClass = "bg-orange-100 text-orange-800";
            }
            return (
              <TableRow
                key={license.id}
                className={
                  index % 2 !== 0 ? "bg-primary bg-opacity-35" : "bg-white"
                }
              >
                <TableCell className="text-center">
                  {`${license.first_name} ${license.last_name}`}
                </TableCell>
                <TableCell className="text-center">{license.email}</TableCell>
                <TableCell className="text-center">
                  {license.licenses?.[0]?.license_code || "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`rounded px-2 py-1 text-sm ${statusClass}`}>
                    {statusLabel}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <ActionButton license={license} statusLabel={statusLabel} />
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

const ActionButton = ({ license, statusLabel }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(null);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(sendLicenseSchema),
    defaultValues: {
      groupCode: "",
    },
  });

  const deactivateLicenseMutation = useMutation({
    // mutationFn: ,
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
    // mutationFn: ,
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
    // mutationFn: RemoveLicense,
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

  const handleDeactivate = () => {
    deactivateLicenseMutation.mutate({
      userId: license.id,
    });
  };

  const handleResendEmail = () => {
    handleResendEmailMutation.mutate(license.email);
  };

  const handleRemoveLicense = () => {
    handleRemoveLicenseMutation.mutate({
      userId: license.id,
      licenseId: license.licenses[0].id,
    });
  };

  const handleSendLicense = (data) => {
    handleSendLicenseMutation.mutate({
      email: license.email,
      groupCode: data.groupCode.trim(),
    });
  };

  if (statusLabel === "Verified") {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Icon icon={"more-1-line"} className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-40">
          <Dialog
            open={openDialog === "deactivate"}
            onOpenChange={(open) => !open && setOpenDialog(null)}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setOpenDialog("deactivate")}
              >
                Deactivate License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate License</DialogTitle>
                <DialogDescription>
                  Are you sure you want to deactivate the license for{" "}
                  {license.first_name} {license.last_name}?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeactivate}>
                  Continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
            <Dialog
              open={openDialog === "resend"}
              onOpenChange={(open) => !open && setOpenDialog(null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setOpenDialog("resend")}
                >
                  Resend Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Resend Email</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to resend the license email to{" "}
                    {license.email}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleResendEmail}>Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={openDialog === "remove"}
              onOpenChange={(open) => !open && setOpenDialog(null)}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => setOpenDialog("remove")}
                >
                  Remove License
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove License</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove the license for{" "}
                    {license.first_name} {license.last_name}?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenDialog(null)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleRemoveLicense}>
                    Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Inactive status
  return (
    <Dialog
      open={openDialog === "send"}
      onOpenChange={(open) => {
        if (!open) {
          setOpenDialog(null);
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenDialog("send")}
        >
          Send License
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send License</DialogTitle>
          <DialogDescription>
            Send a license to {license.first_name} {license.last_name} (
            {license.email})
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSendLicense)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="groupCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter group code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenDialog(null)}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSendLicense)}>
            Send License
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
ActionButton.propTypes = {
  license: PropTypes.object.isRequired,
  statusLabel: PropTypes.string.isRequired,
};

LicenseList.propTypes = {
  status: PropTypes.string.isRequired,
};

export default LicenseList;
