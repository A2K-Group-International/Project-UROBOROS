import { useState } from "react";
import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomReactSelect from "../CustomReactSelect";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import AddPollSchema from "@/zodSchema/Poll-management/AddPollSchema";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { format, parse } from "date-fns";
import TimePickerv2 from "../TimePickerv2/TimePickerv2";

import { useUser } from "@/context/useUser";

import usePoll from "@/hooks/usePoll";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllMinistryBasics } from "@/services/ministryService";
import { getAllUsers } from "@/services/userService";
import { fetchAllGroups } from "@/services/groupServices";

const Addpoll = ({ isEditing = false, poll, dates }) => {
  const { userData } = useUser();
  const [openPollDialog, setOpenPollDialog] = useState(false); // State to control dialog open/close
  const [currentStep, setCurrentStep] = useState(1); // Start at step 1
  const totalStep = 6; // Total number of steps in the poll creation process
  const [selectedTimes, setSelectedTimes] = useState({}); // State to hold selected times for each date

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Function to handle dialog open/close
  const handleOpenChange = (open) => {
    setOpenPollDialog(open);
    if (open) {
      setCurrentStep(1);
      // Parse dates for editing mode - dates is an array directly
      const parsedDates =
        isEditing && dates
          ? dates?.map((dateItem) => {
              // Each dateItem has a 'date' property with ISO string
              const dateObj = new Date(dateItem.date);
              return dateObj;
            })
          : [];

      // Parse time slots for editing mode
      const parsedTimeSlots =
        isEditing && dates
          ? dates?.flatMap(
              (dateItem, dateIndex) =>
                dateItem.poll_times?.map((timeSlot, timeIndex) => ({
                  dateIndex,
                  timeIndex,
                  time: timeSlot.time,
                })) || []
            )
          : [];

      // Parse expiration date and time
      let expiryDate = null;
      let expiryTime = null;

      if (poll?.expiration_date) {
        const expiryDateTime = new Date(poll?.expiration_date);
        expiryDate = expiryDateTime;
        expiryTime = format(expiryDateTime, "HH:mm");
      }

      form.reset({
        pollName: isEditing ? poll?.name : "",
        pollDescription: isEditing ? poll?.description : "",
        pollDates: parsedDates,
        timeSlots: parsedTimeSlots,
        pollDateExpiry: expiryDate,
        pollTimeExpiry: expiryTime,
        ministryIds: [],
        groupIds: [],
        userIds: [],
      });

      // If editing, also set the selectedTimes state for step 4
      if (isEditing && dates) {
        const timesById = {};
        dates.forEach((dateItem, dateIndex) => {
          if (dateItem.poll_times && dateItem.poll_times.length > 0) {
            timesById[dateIndex] = dateItem.poll_times.map(
              (timeSlot) => timeSlot.time
            );
          }
        });
        setSelectedTimes(timesById);
      } else {
        setSelectedTimes({});
      }
    }
  };

  // Initialize form
  const form = useForm({
    resolver: zodResolver(AddPollSchema),
    defaultValues: {
      pollName: "",
      pollDescription: "",
      pollDates: [],
      timeSlots: [],
      pollDateExpiry: null,
      pollTimeExpiry: null,
      shareMode: "public",
      ministryIds: [],
      groupIds: [],
      userIds: [],
    },
    mode: "onChange",
  });

  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = await form.trigger("pollName");
        break;
      case 2:
        isValid = await form.trigger("pollDescription");
        break;
      case 3:
        isValid = await form.trigger("pollDates");
        break;
      case 4: {
        //  at least one time slot for each date
        const timeSlots = form.getValues("timeSlots") || [];
        const selectedDates = form.getValues("pollDates") || [];

        if (timeSlots.length === 0) {
          form.setError("timeSlots", {
            type: "manual",
            message: `Please add at least one time slot for ${format(selectedDates[0], "MMMM dd")}`,
          });
          isValid = false;
        } else {
          // Check if all selected dates have at least one time slot
          const datesWithTimeSlots = new Set(
            timeSlots.map((slot) => slot.dateIndex)
          );

          // Find dates without time slots
          const datesWithoutTimeSlots = [];
          selectedDates.forEach((date, index) => {
            if (!datesWithTimeSlots.has(index)) {
              datesWithoutTimeSlots.push(format(date, "MMM dd, yyyy"));
            }
          });

          if (datesWithoutTimeSlots.length > 0) {
            form.setError("timeSlots", {
              type: "manual",
              message: `Please add time slots for: ${datesWithoutTimeSlots.join(", ")}`,
            });
            isValid = false;

            // Add this to scroll to the error message
            setTimeout(() => {
              document.querySelector('[name="timeSlots"]')?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 100);
          } else {
            form.clearErrors("timeSlots");
            isValid = true;
          }
        }
        break;
      }
      case 5: {
        // Validate both date and time are selected
        const pollDateExpiry = form.getValues("pollDateExpiry");
        const pollTimeExpiry = form.getValues("pollTimeExpiry");

        if (!pollDateExpiry) {
          form.setError("pollDateExpiry", {
            type: "manual",
            message: "Please select an expiry date",
          });
          isValid = false;
        } else if (!pollTimeExpiry) {
          form.setError("pollTimeExpiry", {
            type: "manual",
            message: "Please select an expiry time",
          });
          isValid = false;
        } else {
          // Both date and time are valid
          form.clearErrors(["pollDateExpiry", "pollTimeExpiry"]);
          isValid = true;
        }
        break;
      }
      default:
        isValid = true;
    }

    if (isValid && currentStep < totalStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const { createPollMutation } = usePoll();

  const onSubmit = (data) => {
    createPollMutation.mutate(
      {
        creator_id: userData.id,
        pollName: data.pollName,
        pollDescription: data.pollDescription,
        pollDates: data.pollDates,
        timeSlots: data.timeSlots,
        pollDateExpiry: data.pollDateExpiry,
        pollTimeExpiry: data.pollTimeExpiry,
        shareMode: data.shareMode,
        ministryIds: data.ministryIds,
        userIds: data.userIds,
        groupIds: data.groupIds,
      },
      {
        onSuccess: () => {
          setOpenPollDialog(false);
        },
      }
    );
  };

  return (
    <AlertDialog open={openPollDialog} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" className="rounded-xl">
          <Icon
            icon={
              isEditing
                ? "mingcute:edit-2-fill"
                : "mingcute:classify-add-2-fill"
            }
            width={16}
            height={16}
          />

          {isEditing ? (
            <span className="hidden md:block">Edit Poll</span>
          ) : (
            <span>Create Poll</span>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl px-8 pb-4 pt-6">
        <AlertDialogHeader className="p-0">
          <AlertDialogTitle className="flex items-center justify-between pb-1">
            <p className="text-lg font-bold">
              {isEditing ? "Edit your poll" : "Create a poll"}
            </p>
            <StepIndicatior currentStep={currentStep} totalStep={totalStep} />
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            This form is about creating a new poll for your church community.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* CONTENT */}
        <div className="no-scrollbar max-h-[32rem] overflow-y-scroll">
          <Form {...form}>
            <form id="poll-form" onSubmit={form.handleSubmit(onSubmit)}>
              <RenderContent
                currentStep={currentStep}
                form={form}
                selectedTimes={selectedTimes}
                setSelectedTimes={setSelectedTimes}
              />
            </form>
          </Form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between p-0 pt-1">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="ghost"
              className="justify-self-start font-medium text-accent hover:text-accent"
              onClick={() => setOpenPollDialog(false)}
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto flex gap-x-2">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            )}
            {currentStep < totalStep ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                form="poll-form"
                disabled={createPollMutation.isPending}
              >
                {createPollMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Finish"
                )}
              </Button>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

Addpoll.propTypes = {
  isEditing: PropTypes.bool,
  poll: PropTypes.object,
  dates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      poll_times: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.string.isRequired,
        })
      ),
    })
  ),
};

const StepIndicatior = ({ currentStep, totalStep }) => {
  return (
    <div className="flex items-center gap-x-1">
      {Array.from({ length: totalStep }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;

        return (
          <div
            key={stepNumber}
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm font-bold text-accent ${
              isActive
                ? "border-none bg-accent text-white"
                : isCompleted
                  ? "border-none bg-accent text-white"
                  : "text-accent"
            }`}
          >
            {stepNumber}
          </div>
        );
      })}
    </div>
  );
};

StepIndicatior.propTypes = {
  currentStep: PropTypes.number.isRequired,
  totalStep: PropTypes.number.isRequired,
};

const RenderDescription = ({ title, description }) => {
  return (
    <>
      <Label className="text-2xl font-bold">{title}</Label>
      <p className="text-pretty text-[16px] font-normal leading-none">
        {description}
      </p>
    </>
  );
};

RenderDescription.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const SharePollPrivacy = ({ form }) => {
  const { control } = form;

  const { data: ministries, isLoading: ministriesLoading } = useQuery({
    queryKey: ["pollMinistries"],
    queryFn: fetchAllMinistryBasics,
    enabled: form.getValues("shareMode") === "ministry",
  });
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["pollUsers"],
    queryFn: getAllUsers,
    enabled: form.getValues("shareMode") === "specific",
  });
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["pollGroups"],
    queryFn: fetchAllGroups,
    enabled: form.getValues("shareMode") === "group",
  });

  const groupOptions = groups?.map((group) => ({
    value: group.id,
    label: `${group.name} - ${group.ministries?.ministry_name}`,
  }));

  return (
    <div className="mt-4 space-y-4">
      {/* Share Mode Selection */}
      <FormField
        key="shareMode"
        control={control}
        name="shareMode"
        render={({ field }) => (
          <FormItem>
            <Label className="font-semibold">Share poll to</Label>
            <Select
              value={field.value}
              onValueChange={(value) => {
                if (value === "public") {
                  form.setValue("ministryIds", []);
                  form.setValue("groupIds", []);
                  form.setValue("userIds", []);
                }
                if (value === "ministry") {
                  form.setValue("userIds", []);
                  form.setValue("groupIds", []);
                }
                if (value === "group") {
                  form.setValue("ministryIds", []);
                  form.setValue("userIds", []);
                }
                field.onChange(value); // Pass the value to field.onChange instead of just referencing it
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sharing mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="ministry">Ministry</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      {/* Conditionally show appropriate selector based on share mode */}
      {form.watch("shareMode") === "ministry" && (
        <FormField
          key="ministryIds"
          control={control}
          name="ministryIds"
          render={({ field }) => (
            <FormItem>
              <Label className="font-semibold">Select ministry</Label>
              <FormControl>
                <CustomReactSelect
                  isLoading={ministriesLoading}
                  options={ministries?.map((ministry) => ({
                    value: ministry.id,
                    label: ministry.ministry_name,
                  }))}
                  placeholder="Select ministry"
                  isClearable
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch("shareMode") === "group" && (
        <FormField
          key="groupIds"
          control={control}
          name="groupIds"
          render={({ field }) => (
            <FormItem>
              <Label className="font-semibold">Select group</Label>
              <FormControl>
                <CustomReactSelect
                  placeholder="Select group"
                  isClearable
                  isLoading={groupsLoading}
                  isMulti={true}
                  options={groupOptions}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch("shareMode") === "specific" && (
        <FormField
          key="userIds"
          control={control}
          name="userIds"
          render={({ field }) => (
            <FormItem>
              <Label className="font-semibold">Select users</Label>
              <FormControl>
                <CustomReactSelect
                  isMulti={true}
                  options={users?.map((user) => ({
                    value: user.id,
                    label: `${user.first_name} ${user.last_name}`,
                  }))}
                  isLoading={usersLoading}
                  placeholder="Select specific users"
                  isClearable
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

SharePollPrivacy.propTypes = {
  form: PropTypes.object.isRequired,
};

const RenderContent = ({
  currentStep,
  form,
  selectedTimes,
  setSelectedTimes,
}) => {
  const { control } = form;

  const [activeTimePickerIndex, setActiveTimePickerIndex] = useState(null); // Index of the date for which time picker is active

  const [activeExpiryTimePicker, setActiveExpiryTimePicker] = useState(false); // Time for poll expiration

  /************** CASE 4 FUNCTION*********************/

  // Add time slot function
  const addTimeSlot = (dateIndex, time) => {
    // Update state
    const newTimes = { ...selectedTimes };
    if (!newTimes[dateIndex]) {
      newTimes[dateIndex] = [];
    }
    newTimes[dateIndex].push(time);
    setSelectedTimes(newTimes);

    // Update form value
    const currentTimeSlots = form.getValues("timeSlots") || [];
    currentTimeSlots.push({
      dateIndex,
      timeIndex: newTimes[dateIndex].length - 1,
      time,
    });
    form.setValue("timeSlots", currentTimeSlots);
  };

  const removeTimeSlot = (dateIndex, timeIndex) => {
    // Remove this specific time from state
    const newTimes = { ...selectedTimes };
    newTimes[dateIndex] = newTimes[dateIndex].filter((_, i) => i !== timeIndex);

    // If no times left, remove the date entry
    if (newTimes[dateIndex].length === 0) {
      delete newTimes[dateIndex];
    }

    setSelectedTimes(newTimes);

    // Variable to hold updated time slots
    const updatedTimeSlots = [];

    // For each date that has time slots
    Object.keys(newTimes).forEach((dateIdx) => {
      const dateIdxNum = parseInt(dateIdx);
      // For each time slot in that date
      newTimes[dateIdx].forEach((time, idx) => {
        updatedTimeSlots.push({
          dateIndex: dateIdxNum,
          timeIndex: idx,
          time,
        });
      });
    });

    // Update the form value
    form.setValue("timeSlots", updatedTimeSlots);
  };

  /**************END OF CASE 4 FUNCTION*********************/

  switch (currentStep) {
    case 1:
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Give your poll a name"
            description="Make your poll easy to identify by giving it a descriptive name."
          />
          <FormField
            key="pollName"
            control={control}
            name="pollName"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormControl>
                  <Input
                    placeholder="Poll Name"
                    className="w-full"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 2:
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Describe your poll"
            description="Add a description to provide more context about your poll."
          />
          <FormField
            key="pollDescription"
            control={control}
            name="pollDescription"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormControl>
                  <Textarea
                    placeholder="Add description..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );

    case 3:
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Add dates to your poll"
            description="Specify the dates relevant to this poll."
          />
          <FormField
            key="pollDates"
            control={control}
            name="pollDates"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormControl>
                  <Calendar
                    disabled={(date) => date < new Date()}
                    mode="multiple"
                    selected={field.value}
                    onSelect={field.onChange}
                    className="rounded-lg border border-primary"
                  />
                </FormControl>
                {field.value?.length > 0 && (
                  <div>
                    <p className="text-sm">Selected Dates</p>
                    <div className="flex flex-wrap gap-2 rounded-xl bg-primary p-2">
                      {field.value.map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center rounded-full bg-accent px-3 py-1 text-sm text-white"
                        >
                          {format(date, "MM/dd")}
                          <button
                            type="button"
                            className="ml-2 p-1 text-gray"
                            onClick={(e) => {
                              e.preventDefault();
                              const newDates = [...field.value];
                              newDates.splice(index, 1);
                              field.onChange(newDates);
                            }}
                          >
                            <Icon
                              icon="mingcute:close-line"
                              width={14}
                              height={14}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      );
    case 4: {
      const selectedDates = form.getValues("pollDates") || [];

      const timeInputRef = { current: null };

      const formatTimeDisplay = (timeString) => {
        try {
          // First try HH:mm:ss format (from database)
          return format(parse(timeString, "HH:mm:ss", new Date()), "hh:mm a");
        } catch (e) {
          console.error("Failed to parse time:", e);
          try {
            // Then try HH:mm format (from time picker)
            return format(parse(timeString, "HH:mm", new Date()), "hh:mm a");
          } catch (e) {
            console.error("Failed to parse time:", e);
            // If all parsing fails, return the original string
            return timeString;
          }
        }
      };
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Add timeslots for this poll"
            description="Include timeslots for participants to choose from."
          />
          {/* Display selected dates */}
          {selectedDates.length > 0 && (
            <>
              <div className="mt-2 flex flex-col gap-2">
                {selectedDates.map((date, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-primary p-4"
                  >
                    <Label className="font-semibold">
                      {format(date, "dd MMMM yyyy")}
                    </Label>
                    {/* Display already selected time slots */}
                    {selectedTimes[index]?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {selectedTimes[index].map((time, timeIndex) => (
                          <div
                            key={timeIndex}
                            className="flex items-center justify-between rounded-xl bg-[rgba(246,240,237,0.5)] px-6 py-2"
                          >
                            <div className="flex items-center">
                              <Label className="font-semibold">
                                {formatTimeDisplay(time)}
                              </Label>
                            </div>
                            <div className="flex items-center gap-x-2">
                              <div className="rounded-xl bg-[#F1E6E0] px-4 py-2">
                                <Icon
                                  icon="mingcute:time-fill"
                                  width={20}
                                  height={20}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeTimeSlot(index, timeIndex)}
                              >
                                <Icon
                                  icon="mingcute:close-line"
                                  width={20}
                                  height={20}
                                />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTimePickerIndex(index)}
                        className="w-full rounded-xl border-none bg-primary font-semibold hover:bg-primary hover:font-semibold hover:text-primary-text"
                        ref={(el) => {
                          if (activeTimePickerIndex === index) {
                            timeInputRef.current = el;
                          }
                        }}
                      >
                        Add Time Slot
                      </Button>
                    </div>
                    {/* Render TimePicker when this is the active date */}
                    {activeTimePickerIndex === index && (
                      <TimePickerv2
                        setTime={(time) => addTimeSlot(index, time)}
                        setActivity={(isActive) => {
                          if (!isActive) {
                            setActiveTimePickerIndex(null);
                          }
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Display error message when no time */}
              <FormField
                key="timeSlots"
                control={control}
                name="timeSlots"
                render={() => (
                  <FormItem className="mt-4">
                    <FormControl>
                      <input type="hidden" />
                    </FormControl>
                    {form.formState.errors.timeSlots && (
                      <FormMessage className="block text-center text-base font-medium" />
                    )}
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      );
    }
    case 5:
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Set poll expiration"
            description="Define when the poll should expire."
          />
          <div className="space-y-4">
            {/* Date Selection */}
            <FormField
              key="pollDateExpiry"
              control={control}
              name="pollDateExpiry"
              render={({ field }) => (
                <FormItem>
                  <Label className="font-semibold">Select expiry date</Label>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      className="rounded-lg border border-primary"
                      disabled={(date) => date < new Date()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Time Selection */}
            <div className="mt-6">
              <Label>Time of poll expiration</Label>
              <div className="mt-2">
                <FormField
                  control={control}
                  name="pollTimeExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Button
                            type="button"
                            className="w-full rounded-xl bg-[rgba(246,240,237)] p-6 text-primary-text"
                            onClick={() => setActiveExpiryTimePicker(true)}
                          >
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="text-sm font-semibold">
                                  {field.value
                                    ? format(
                                        parse(field.value, "HH:mm", new Date()),
                                        "hh:mm a"
                                      )
                                    : "Please select a time"}
                                </span>
                              </div>
                            </div>
                            <div className="rounded-xl bg-[#F1E6E0] px-4 py-2">
                              <Icon
                                icon="mingcute:time-fill"
                                width={20}
                                height={20}
                              />
                            </div>
                          </Button>

                          {activeExpiryTimePicker && (
                            <div className="absolute right-0 top-full z-10 mt-1 w-full">
                              <TimePickerv2
                                setTime={(time) => {
                                  field.onChange(time);
                                  setActiveExpiryTimePicker(false);
                                }}
                                setActivity={(isActive) => {
                                  if (!isActive) {
                                    setActiveExpiryTimePicker(false);
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      );

    case 6:
      return (
        <div className="my-5 text-accent">
          <RenderDescription
            title="Share with coordinators & volunteers"
            description="Send the poll to users for participation."
          />
          <SharePollPrivacy form={form} />
        </div>
      );
  }
};

RenderContent.propTypes = {
  currentStep: PropTypes.number.isRequired,
  form: PropTypes.object.isRequired,
  selectedTimes: PropTypes.object.isRequired,
  setSelectedTimes: PropTypes.func.isRequired,
};

export default Addpoll;
