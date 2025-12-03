import Loading from "@/components/Loading";
import { Title } from "@/components/Title";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/useUser";
import {
  useGetUserCoordinator,
  useSubmitConfirmationForm,
  useUserMinistry,
} from "@/hooks/use-confirmation-form";
import { registrationSchema } from "@/zodSchema/ConfirmationFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CustomReactSelect from "@/components/CustomReactSelect";
import { useToast } from "@/hooks/use-toast";

const ConfirmationForm = () => {
  const [searchParams] = useSearchParams();
  const ministryId = searchParams.get("id");
  const { userData } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: hasAccess, isLoading } = useUserMinistry(
    userData?.id,
    ministryId
  );

  const { data: isCoordinator, isLoading: isLoadingCoordinator } =
    useGetUserCoordinator(userData?.id, ministryId);

  const { mutate: submitForm, isPending: isSubmitting } =
    useSubmitConfirmationForm(userData?.id);

  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      full_name: "",
      preferred_name: "",
      address: "",
      date_of_birth: null,
      mass_location: "",
      mass_location_other: "",
      baptism_date: null,
      baptism_place: "",
      baptism_church_address: "",
      medical_conditions: "",
      additional_needs: "",
      candidate_relationship: "",
      candidate_relationship_other: "",
      mobile_number: "",
      main_contact_name: "",
      sponsor_name: "",
      sponsor_email: "",
      sponsor_baptised: "",
      preferred_contact: [],
      permission_types: [],
    },
    mode: "onSubmit",
  });

  // Watch the mass_location field to show/hide the "other" input
  const massLocation = form.watch("mass_location");
  const candidateRelationship = form.watch("candidate_relationship");

  useEffect(() => {
    form.setValue("email", userData?.email || "");
  }, [form, userData]);

  if (isLoading || isLoadingCoordinator) {
    return <Loading />;
  }

  if (!isCoordinator && !hasAccess) {
    return (
      <div className="p-8">
        <Title>Access Denied</Title>
        <p className="mt-4 text-red-600">
          You do not have permission to access this form.
        </p>
      </div>
    );
  }

  const onSubmit = (data) => {
    submitForm(data, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "You successfully submitted the form.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  const handleViewResults = () => {
    navigate(`/confirmation-results?id=${ministryId}`);
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-4 pb-32 lg:pb-0">
      <div className="flex items-center gap-2">
        <Title className="text-center text-xl md:text-start">
          Saint Laurence Confirmation Form 2025 - 2026
        </Title>
        {isCoordinator && (
          <Button variant="outline" onClick={handleViewResults}>
            View Results
          </Button>
        )}
      </div>

      <div className="w-full max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Full name */}
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Candidate Details Full Name(include first and last names)
                    <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add candidate full name here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Preferred Name */}
            <FormField
              control={form.control}
              name="preferred_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name by which the candidate wishes to be known (if different
                    from above):
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Optional"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Address */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Address <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Your address"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* DATE OF BIRTH */}
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Date of Birth <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="w-full rounded-full border border-neutral-200 bg-primary p-2"
                    placeholderText="Select date of birth"
                    dateFormat="MMMM d, yyyy"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* CHURCH LOCATION */}
            <div
              className={
                massLocation === "Other" ? "flex items-center gap-2" : undefined
              }
            >
              <FormField
                control={form.control}
                name="mass_location"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Where do you normally attend Sunday Mass?
                      <span className="text-red-500">{" *"}</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="St. Laurence's">
                          St. Laurence&apos;s
                        </SelectItem>
                        <SelectItem value="St. Vincent de Paul">
                          St. Vincent de Paul&apos;s
                        </SelectItem>
                        <SelectItem value="St. Philip Howard">
                          St. Philip Howard
                        </SelectItem>
                        <SelectItem value="OLEM">OLEM</SelectItem>
                        <SelectItem value="Cambourne">Cambourne</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* If "Other" is selected, show this input */}
              {massLocation === "Other" && (
                <FormField
                  control={form.control}
                  name="mass_location_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify other location:</FormLabel>
                      <FormControl>
                        <div className="relative flex-1">
                          <Input
                            placeholder="Specify other location"
                            className="pr-14"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {/* Date of Baptism */}
            <FormField
              control={form.control}
              name="baptism_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Date of Baptism <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    className="w-full rounded-full border border-neutral-200 bg-primary p-2"
                    placeholderText="Select date of baptism"
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    dateFormat="MMMM d, yyyy"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* BAPTISMAL PLACE */}
            <FormField
              control={form.control}
              name="baptism_place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Place/Church of Baptism
                    <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter place/church of baptism"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* POSTAL ADDRESS OF CHURCH */}
            <FormField
              control={form.control}
              name="baptism_church_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Postal Address of Church (if not a local Cambridge Church):
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter postal address of church (optional)"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* MEDICAL CONDITIONS */}
            <FormField
              control={form.control}
              name="medical_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Do you have any medical conditions or allergies that we
                    should be aware of? If so, please give brief details.
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter details of medical conditions or allergies"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* MEDICAL CONDITIONS */}
            <FormField
              control={form.control}
              name="additional_needs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Do you have any additional needs or is there anything you
                    would like to make us aware of so that we can better support
                    you? If so, please give brief details.
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Enter details of additional needs"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* DIVIDER */}
            <div className="border-t border-neutral-200">
              <h2 className="pt-4 text-center font-medium text-primary-text">
                Main Contact (Parent/Guardian)
              </h2>
            </div>
            {/* Main Full Name */}
            <FormField
              control={form.control}
              name="main_contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Main Contact Name
                    <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add full name here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* RELATION TO CANDIDATE */}
            <div
              className={
                candidateRelationship === "Other"
                  ? "flex items-center gap-2"
                  : undefined
              }
            >
              <FormField
                control={form.control}
                name="candidate_relationship"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      Relationship to Candidate
                      <span className="text-red-500">{" *"}</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Guardian">Guardian</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* If "Other" is selected, show this input */}
              {candidateRelationship === "Other" && (
                <FormField
                  control={form.control}
                  name="candidate_relationship_other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Please specify other location:</FormLabel>
                      <FormControl>
                        <div className="relative flex-1">
                          <Input
                            placeholder="Specify other location"
                            className="pr-14"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add email here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobile_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mobile Number <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add mobile number here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* DIVIDER */}
            <div className="border-t border-neutral-200">
              <h2 className="pt-4 text-center font-medium text-primary-text">
                Sponsor
              </h2>
            </div>
            {/* Sponsor Full Name */}
            <FormField
              control={form.control}
              name="sponsor_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor&apos;s Name</FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add full name here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Sponsor Full Name */}
            <FormField
              control={form.control}
              name="sponsor_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sponsor&apos;s Email Address</FormLabel>
                  <FormControl>
                    <div className="relative flex-1">
                      <Input
                        placeholder="Add email here"
                        className="pr-14"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sponsor_baptised"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Relationship to Candidate</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Will find out and let you know (Please note that a Sponsor will have to be baptised and confirmed).">
                        Will find out and let you know (Please note that a
                        Sponsor will have to be baptised and confirmed).
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* PERMISSION */}
            <div className="border-t border-neutral-200">
              <h2 className="pt-4 text-center font-medium text-primary-text">
                Permissions
              </h2>
            </div>
            <FormField
              control={form.control}
              name="preferred_contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    I give permission for the Confirmation Leaders to contact
                    the Main Contact in the following ways:
                    <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <CustomReactSelect
                      isMulti={true}
                      options={[
                        { value: "Email", label: "Email" },
                        { value: "Telephone call", label: "Telephone call" },
                        { value: "WhatsApp group", label: "WhatsApp group" },
                        { value: "Text", label: "Text" },
                      ]}
                      value={
                        field.value?.map((val) => ({
                          value: val,
                          label: val
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                        })) || []
                      }
                      onChange={(selectedOptions) => {
                        field.onChange(
                          selectedOptions?.map((option) => option.value) || []
                        );
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permission_types"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    I give permission for the Confirmation Leaders to send me
                    the following types of information in the format stated
                    above - Please check all that apply
                    <span className="text-red-500">{" *"}</span>
                  </FormLabel>
                  <FormControl>
                    <CustomReactSelect
                      isMulti={true}
                      options={[
                        {
                          value: "Confirmation Group",
                          label: "Confirmation Group",
                        },
                        { value: "Ablaze Mass", label: "Ablaze Mass" },
                        {
                          value: "Other Parish-based Youth Activities",
                          label: "Other Parish-based Youth Activities",
                        },
                        {
                          value: "Ignite Youth Team - Diocese of East Anglia",
                          label: "Ignite Youth Team - Diocese of East Anglia",
                        },
                      ]}
                      value={
                        field.value?.map((val) => ({
                          value: val,
                          label: val
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase()),
                        })) || []
                      }
                      onChange={(selectedOptions) => {
                        field.onChange(
                          selectedOptions?.map((option) => option.value) || []
                        );
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ConfirmationForm;
