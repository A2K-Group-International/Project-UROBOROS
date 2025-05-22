import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "../ui/textarea";

const consultationForm = z.object({
  preferenceA: z.string().min(1, "Please select preference"),
  preferenceB: z.string().min(1, "Please select preference"),
  preferenceC: z.string().min(1, "Please select preference"),
  massPreference: z.string().min(1, "Please select a Mass preference"),
  optionalReasons: z.string().optional(),
});

const ConsultationQuestion = () => {
  // Define the three Mass time preference
  const preferences = [
    { letter: "a", times: "7.45am, 9.15am, 11.15am" },
    { letter: "b", times: "7.45am, 9.30am, 11.30am" },
    { letter: "c", times: "8.00am, 9.30am, 11.30am" },
  ];

  // Function to check if a rank is already selected by another option
  const isRankSelected = (rank) => {
    const preferenceA = form.watch("preferenceA");
    const preferenceB = form.watch("preferenceB");
    const preferenceC = form.watch("preferenceC");

    return [preferenceA, preferenceB, preferenceC].includes(rank);
  };

  // Function to check if a specific option has a specific rank
  const hasRank = (preference, rank) => {
    return form.watch(`preference${preference.toUpperCase()}`) === rank;
  };

  // Function to reset all selections
  const resetSelections = () => {
    form.setValue("preferenceA", "");
    form.setValue("preferenceB", "");
    form.setValue("preferenceC", "");
    form.setValue("massPreference", "");
    form.clearErrors();
  };

  // Initialize form with React Hook Form and zod validation
  const form = useForm({
    resolver: zodResolver(consultationForm),
    defaultValues: {
      preferenceA: "",
      preferenceB: "",
      preferenceC: "",
      massPreference: "",
      optionalReasons: "",
    },
  });

  // Submit handler
  const onSubmit = (data) => {
    // Check if all options have different rankings
    const rankings = [data.preferenceA, data.preferenceB, data.preferenceC];
    const uniqueRankings = new Set(rankings);

    if (uniqueRankings.size !== 3) {
      console.log("Each option must have a unique ranking (1st, 2nd, 3rd)");
    }
    // Send data backend
    console.log("Form submitted:", data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Mass Time Rankings */}
        <div className="mt-4 text-accent">
          {preferences.map((preference) => (
            <div
              key={preference.letter}
              className="mb-2 space-y-2 rounded-xl border border-accent/20 p-4"
            >
              <h3 className="font-semibold">
                {`${preference.letter}.) ${preference.times}`}
              </h3>

              <FormField
                control={form.control}
                name={`preference${preference.letter.toUpperCase()}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-1"
                      >
                        {["1st", "2nd", "3rd"].map((rank) => (
                          <div
                            key={rank}
                            className="flex items-center space-x-2 pl-4"
                          >
                            <RadioGroupItem
                              value={rank}
                              id={`${preference.letter}-${rank}`}
                              disabled={
                                isRankSelected(rank) &&
                                !hasRank(preference.letter, rank)
                              }
                            />
                            <Label
                              htmlFor={`${preference.letter}-${rank}`}
                              className={cn(
                                isRankSelected(rank) &&
                                  !hasRank(preference.letter, rank)
                                  ? "text-accent/30"
                                  : ""
                              )}
                            >
                              {rank}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <div className="mb-2 space-y-2 rounded-xl border border-accent/20 p-4">
            <h3 className="font-semibold">
              Please indicate which of the current Masses you usually attend:
            </h3>
            <FormField
              control={form.control}
              name="massPreference"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-1"
                    >
                      {["6.00pm; Saturday", "8.00am", "9.30am", "11.00am"].map(
                        (massPref) => (
                          <div
                            key={massPref}
                            className="flex items-center space-x-2 pl-4"
                          >
                            <RadioGroupItem value={massPref} />
                            <Label htmlFor={`mass-${massPref}`}>
                              {massPref}
                            </Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-4">
            <Button
              type="button"
              onClick={resetSelections}
              variant="outline"
              className="border-danger/30 text-red-400 hover:bg-white hover:text-red-400"
            >
              Reset Preferences
            </Button>
          </div>

          <div className="mb-4 rounded-xl bg-primary p-4 lg:p-6">
            <p className="text-[12px] font-medium md:text-[15px] lg:text-[16px]">
              If you would like to share the reasons for your preference, and/or
              if there is a fourth pattern you would recommend, please indicate
              that here:
            </p>
          </div>
          <div>
            <FormField
              control={form.control}
              name="optionalReasons"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Write your reasons here (optional)."
                      {...field}
                      className="min-h-36 resize-none bg-primary/10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="rounded-full px-8">
            Submit Response
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ConsultationQuestion;
