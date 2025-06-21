import { useState } from "react";

import PropTypes from "prop-types";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "./ui/label";
import useManageUsers from "@/hooks/Request/useManageUser";
import { DialogClose, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

const NewProfileForm = ({ id = "new-user-form", user, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);

  const { form, onSubmit, isPending } = useManageUsers({
    user,
    onSuccessCallback: onClose,
  });

  return (
    <Form id={id} {...form}>
      <form
        id={id}
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="w-1/2">
              <FormLabel>User Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select a User Role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="parishioner">Parishioner</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem className="grow">
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="contact_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact Tel No.</FormLabel>
              <FormControl>
                <Input placeholder="+441172345678" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!user && (
          <FormField
            control={form.control}
            name="email"
            type="email"
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
        )}

        {!user && (
          <div className="flex gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem className="grow">
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {!user && (
          <div className="flex items-center justify-end gap-x-2">
            <Checkbox
              checked={showPassword}
              onCheckedChange={setShowPassword}
            />
            <Label>Show Password</Label>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Saving..."
              : !user
                ? "Create Profile"
                : "Update Profile"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

NewProfileForm.propTypes = {
  id: PropTypes.string,
  user: PropTypes.object,
  onClose: PropTypes.func,
};

export default NewProfileForm;
