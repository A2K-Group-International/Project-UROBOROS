import { useState } from "react";
import { Title, Description } from "@/components/Title";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersList from "@/components/Request/UserList";
import CategoryList from "@/components/Request/CategoryList";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  // DialogClose,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import NewProfileForm from "@/components/NewProfileForm";
import { Icon } from "@iconify/react";
import LicenseList from "@/components/Request/LicenseList";
import AddLicenseForm from "@/components/Request/AddLicenseForm";
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
const Requests = () => {
  const [tab, setTab] = useState("users");
  const [role, setRole] = useState("parishioner");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("active");
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const onRowEdit = (row) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const onDialogStateChange = (state) => {
    setOpen(state);
    if (!state) {
      setSelectedRow(null);
    }
  };
  return (
    <div className="no-scrollbar flex h-full flex-col gap-7 overflow-y-auto">
      <div>
        <Title>Requests</Title>
        <Description>Manage your organisation&apos;s community.</Description>
      </div>
      <div className="flex gap-4">
        <Tabs onValueChange={(value) => setTab(value)} defaultValue={tab}>
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="licenses">Licenses</TabsTrigger>
          </TabsList>
        </Tabs>
        <Separator orientation="vertical" />
        {tab === "licenses" && (
          <div className="flex gap-4">
            <Select
              defaultValue={status}
              onValueChange={(value) => setStatus(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Separator orientation="vertical" />
            <AlertDialog open={licenseOpen} onOpenChange={setLicenseOpen}>
              <AlertDialogTrigger className="rounded-3xl" asChild>
                <Button>
                  <Icon
                    className="h-4 w-4 text-white"
                    icon="mingcute:IDcard-fill"
                  />
                  Assign New License
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Assign New License</AlertDialogTitle>
                  <AlertDialogDescription>
                    Assign a new license to a user profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogBody>
                  <AddLicenseForm />
                </AlertDialogBody>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <Button
                    className="flex-1"
                    type="submit"
                    form="add-license-form"
                  >
                    Send License Email
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        {tab === "users" && (
          <div className="flex gap-4">
            <Select
              defaultValue={role}
              onValueChange={(value) => setRole(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Roles</SelectLabel>
                  <SelectItem value="parishioner">Parishioners</SelectItem>
                  <SelectItem value="volunteer">Volunteers</SelectItem>
                  <SelectItem value="coordinator">Coordinators</SelectItem>
                  <SelectItem value="family">Families</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" />
            <Dialog open={open} onOpenChange={onDialogStateChange}>
              <DialogTrigger className="rounded-3xl" asChild>
                <Button>
                  <Icon
                    className="h-4 w-4 text-white"
                    icon="mingcute:user-add-fill"
                  ></Icon>
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {!selectedRow ? "Create New Profile" : "Update Profile"}
                  </DialogTitle>
                  <DialogDescription>
                    {!selectedRow
                      ? "Create a new user profile"
                      : "Update existing user profile"}
                  </DialogDescription>
                </DialogHeader>
                <NewProfileForm
                  user={selectedRow}
                  onClose={() => setOpen(false)}
                />
              </DialogContent>{" "}
            </Dialog>
          </div>
        )}
      </div>
      {tab === "users" && <UsersList role={role} onRowEdit={onRowEdit} />}
      {tab === "categories" && <CategoryList />}
      {tab === "licenses" && <LicenseList status={status} />}
    </div>
  );
};

export default Requests;
