import { useState } from "react";
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
import PropTypes from "prop-types";

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

const Addpoll = () => {
  const [openPollDialog, setOpenPollDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalStep = 6;

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
      form.reset({
        pollName: "",
        pollDescription: "",
        pollDates: [],
        timeSlots: [],
        pollDateExpiry: null,
        pollTimeExpiry: null,
      });
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

  const onSubmit = (data) => {
    console.log("Form submitted with data:", data);
  };

  return (
    <AlertDialog open={openPollDialog} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button size="sm" className="rounded-xl">
          <Icon icon="mingcute:classify-add-2-fill" width={20} height={20} />
          Add Poll
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl px-8 pb-4 pt-6">
        <AlertDialogHeader className="p-0">
          <AlertDialogTitle className="flex items-center justify-between pb-1">
            <p className="text-lg font-bold">Create a poll</p>
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
              <RenderContent currentStep={currentStep} form={form} />
            </form>
          </Form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between p-0 pt-1">
          {currentStep > 1 && (
            <Button
              variant="ghost"
              className="justify-self-start font-medium text-accent hover:text-accent"
              onClick={() => setOpenPollDialog(false)}
            >
              Cancel
            </Button>
          )}
          <div className="ml-auto flex gap-x-2">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
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
              <Button type="submit" form="poll-form">
                Submit
              </Button>
            )}
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
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
      <p className="text-sm">{description}</p>
    </>
  );
};

RenderDescription.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

const RenderContent = ({ currentStep, form }) => {
  const { control } = form;

  const [activeTimePickerIndex, setActiveTimePickerIndex] = useState(null); // Index of the date for which time picker is active
  const [selectedTimes, setSelectedTimes] = useState({});

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
            title="Name your poll"
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
                                {format(
                                  parse(time, "HH:mm", new Date()),
                                  "hh:mm a"
                                )}
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
            description="Send the poll to coordinators and volunteers for participation."
          />
        </div>
      );
  }
};

RenderContent.propTypes = {
  currentStep: PropTypes.number.isRequired,
  form: PropTypes.object.isRequired,
};

export default Addpoll;
