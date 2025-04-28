import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useFeedback from "@/hooks/useFeedbacks";
import { Loader2 } from "lucide-react";

const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z
    .string()
    .max(1000, "Feedback must be less than 1000 characters")
    .optional(),
  images: z.array(z.instanceof(File)).optional(),
});

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

const SendFeedback = () => {
  const [characterCount, setCharacterCount] = useState(0);
  const navigate = useNavigate();

  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);

  const { createPublicFeedBack, isPublicFeedbackPending } = useFeedback();

  const form = useForm({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      description: "",
      images: [],
    },
  });

  const onSubmit = (data) => {
    try {
      const formData = new FormData();

      // Append form data to FormData object
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("subject", data.subject);
      formData.append("description", data.description);

      //Append images to FormData
      currentFiles.forEach((file) => {
        formData.append("images", file);
      });

      createPublicFeedBack(formData, () => {
        navigate("/feedback/success"); // Navigate to the success page
      });
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleResetForm = () => {
    form.reset();
    setCharacterCount(0);
  };

  return (
    <div className="no-scrollbar container h-dvh max-w-full overflow-y-scroll">
      <div className="mx-auto max-w-4xl">
        <div>
          <div className="mt-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")} // Navigate to the home page
              className="text-primary-text"
            >
              <Icon icon="mingcute:arrow-left-line" className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </div>
          <div className="dark:bg-secondary-background flex flex-col justify-between rounded-lg bg-white p-6 dark:text-primary-text sm:p-8">
            <div>
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
                  <CardDescription className="sr-only">
                    Your feedback is valuable in helping us enhance your
                    experience.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Name{" "}
                                <span className="text-accent/50">
                                  (optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter the subject of your feedback..."
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Description{" "}
                                <span className="text-accent/50">
                                  (optional)
                                </span>
                              </FormLabel>
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
                        <FormField
                          control={form.control}
                          name="images"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Attach Image(s)
                                <span className="text-accent/50">
                                  {" "}
                                  (optional)
                                </span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  id="file-input"
                                  type="file"
                                  accept="image/*" // Restrict to images only
                                  className="hidden"
                                  multiple // Allow multiple image uploads
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;

                                    const fileArray = Array.from(files);

                                    // Update form state with selected files
                                    field.onChange([
                                      ...currentFiles,
                                      ...fileArray,
                                    ]);

                                    // Update local state with selected files
                                    setCurrentFiles((prevState) => [
                                      ...prevState,
                                      ...fileArray,
                                    ]);

                                    // Create image previews
                                    setImagePreviews((prevState) => [
                                      ...prevState,
                                      ...fileArray.map((file) =>
                                        URL.createObjectURL(file)
                                      ),
                                    ]);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                              <div className="flex max-h-[110px] w-full gap-3 overflow-x-scroll">
                                {imagePreviews.map((url, index) => (
                                  <div
                                    key={index}
                                    className="relative flex h-[100px] w-[100px] flex-shrink-0 rounded-md"
                                  >
                                    <img
                                      className="object-cover"
                                      src={url}
                                      alt={`Preview ${index + 1}`}
                                    />
                                    <Icon
                                      onClick={() => {
                                        // Remove the selected image
                                        setImagePreviews((prevState) =>
                                          prevState.filter(
                                            (_, i) => i !== index
                                          )
                                        );
                                        setCurrentFiles((prevState) =>
                                          prevState.filter(
                                            (_, i) => i !== index
                                          )
                                        );
                                      }}
                                      className="absolute right-1 top-1 text-xl text-accent hover:cursor-pointer"
                                      icon={"mingcute:close-circle-fill"}
                                    />
                                  </div>
                                ))}
                                <Label htmlFor="file-input">
                                  <div className="flex h-[100px] w-[100px] flex-shrink-0 items-center justify-center rounded-md border border-primary-outline bg-[#F1E6E0] hover:cursor-pointer">
                                    <Icon
                                      className="h-9 w-9 text-accent"
                                      icon={"mingcute:add-line"}
                                    />
                                  </div>
                                </Label>
                              </div>
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
                  <Button
                    disabled={isPublicFeedbackPending}
                    onClick={form.handleSubmit(onSubmit)}
                    className="self-end"
                  >
                    {isPublicFeedbackPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Icon
                          icon="mingcute:send-plane-fill"
                          className="mr-2 h-4 w-4"
                        />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendFeedback;
