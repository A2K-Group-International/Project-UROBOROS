import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const feedbackSchema = z.object({
  category: z.string().min(1, "Please select a feedback category"),
  description: z
    .string()
    .min(10, "Please provide at least 10 characters of description")
    .max(1000, "Feedback must be less than 1000 characters"),
});

const feedbackCategories = [
  { value: "bug", label: "🐞 Bug Report" },
  { value: "feature", label: "✨ Feature Request" },
  { value: "ui", label: "🎨 UI Issue" },
  { value: "performance", label: "⚡ Performance Issue" },
  { value: "general", label: "💬 General Feedback" },
  { value: "account", label: "🔐 Account/Login Issue" },
  { value: "event", label: "📅 Event-Related Feedback" },
  { value: "notification", label: "🔔 Notification Issue" },
  { value: "other", label: "❓ Other" },
];

const feedbackAdditionalInformation = [
  {
    description: "Feature requests that would make your experience better",
  },
  {
    description: "Suggestions to improve existing functionalities",
  },
  {
    description: "Reports of confusing or difficult to use interfaces",
  },
  {
    description: "Ideas for new features or reports you'd like to see",
  },
];

const Feedback = () => {
  const [characterCount, setCharacterCount] = useState(0);

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      category: "",
      description: "",
    },
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  const handleResetForm = () => {
    form.reset();
    setCharacterCount(0);
  };

  return (
    <div className="no-scrollbar container mx-auto max-w-3xl overflow-y-scroll">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-text">
          Share Your Feedback
        </h1>
        <p className="text-accent">
          Help us improve the system by sharing your suggestions
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Feedback Form</CardTitle>
          <CardDescription>
            Your feedback is valuable in helping us enhance your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {feedbackCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your suggestions for improvement..."
                          className="min-h-[220px] resize-none"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setCharacterCount(e.target.value.length);
                          }}
                        />
                      </FormControl>
                      <div className="flex justify-between">
                        <FormDescription>
                          {`Please be specific about what you'd like to see
                          improved.`}
                        </FormDescription>
                        <span
                          className={`text-xs ${
                            characterCount > 900
                              ? "text-red-600"
                              : characterCount > 0
                                ? "text-primary-text"
                                : "text-muted-foreground"
                          }`}
                        >
                          {characterCount}/1000
                        </span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-lg border border-accent/20 p-4">
                <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-primary-text">
                  <Icon
                    icon="mingcute:bulb-fill"
                    className="text-primary-text"
                  />
                  What kind of feedback is helpful?
                </h4>
                <ul className="list-disc space-y-1 pl-4 text-xs">
                  {feedbackAdditionalInformation.map((item, index) => (
                    <li key={index} className="text-primary-text">
                      {item.description}
                    </li>
                  ))}
                </ul>
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-start flex flex-col justify-between gap-y-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleResetForm}
            className="self-end"
          >
            Reset Form
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} className="self-end">
            <Icon icon="mingcute:send-plane-fill" className="mr-2 h-4 w-4" />
            Submit Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Feedback;
