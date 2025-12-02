import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Loader2 } from "lucide-react";

import { Description, Title } from "@/components/Title";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addSongSchema } from "@/zodSchema/Lyrics/AddSongSchema";
import { useToast } from "@/hooks/use-toast";
import { googleVisionService } from "@/services/googleVisionService";
import { songService } from "@/services/songService";
import { useImageCropper } from "@/hooks/useImageCropper";
import { CropModal } from "@/components/CropModal";
import { useSong } from "@/hooks/useSong";
import { Icon } from "@iconify/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AddSong = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams();
  const isEditMode = !!id;

  // OCR State
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  // Use Custom Hook for Cropping Logic
  const {
    imgSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    isCropModalOpen,
    setIsCropModalOpen,
    imgRef,
    onSelectFile,
    onImageLoad,
    getCroppedImg,
    resetCropper,
  } = useImageCropper();

  // Use Mutation Hook for Saving Song
  const {
    addSong,
    isAdding,
    updateSong,
    isUpdating,
    deleteSong,
    isDeleting,
    getSongByIdQuery,
  } = useSong(id);

  const form = useForm({
    resolver: zodResolver(addSongSchema),
    defaultValues: {
      song_number: "",
      lyrics: "",
    },
  });

  useEffect(() => {
    if (getSongByIdQuery.data) {
      form.reset({
        song_number: getSongByIdQuery.data.number.toString(),
        lyrics: getSongByIdQuery.data.lyrics,
      });
    }
  }, [getSongByIdQuery.data, form]);

  // Handle Image Upload Trigger
  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropConfirm = async () => {
    if (!imgRef.current || !completedCrop) return;

    setIsScanning(true);

    try {
      const blob = await getCroppedImg(imgRef.current, completedCrop);

      // Convert blob to base64 for Google Vision API
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Image = base64data.split(",")[1];

        try {
          const text = await googleVisionService.analyzeImage(base64Image);

          // Cleanup: remove excess whitespace/noise
          const cleanedText = text.trim();

          // Get current value to append (handling "Page 2" scenario)
          const currentLyrics = form.getValues("lyrics") || "";
          const separator = currentLyrics ? "\n\n" : "";

          // Update form value
          form.setValue("lyrics", currentLyrics + separator + cleanedText, {
            shouldDirty: true,
            shouldValidate: true,
          });

          toast({
            title: "Lyrics Scanned",
            description: "Text extracted and appended successfully.",
          });

          // Close modal and reset cropper after success
          resetCropper();
        } catch (error) {
          console.error(error);
          toast({
            variant: "destructive",
            title: "Scan Failed",
            description: error.message || "Could not extract text from image.",
          });
        } finally {
          setIsScanning(false);
          // Reset file input so same file can be selected again if needed
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      };
    } catch (error) {
      console.error(error);
      setIsScanning(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Check for unique song number
      const exists = await songService.checkSongNumberExists(
        data.song_number,
        id
      );

      if (exists) {
        form.setError("song_number", {
          type: "manual",
          message: "Song number already exists",
        });
        return;
      }

      if (isEditMode) {
        await updateSong({ id, ...data });
      } else {
        await addSong(data);
      }
      // Success toast is handled in the hook
      navigate("/lyrics");
    } catch (error) {
      // Error toast is handled in the hook
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSong(id);
      navigate("/lyrics");
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = `${value.substring(0, start)}  ${value.substring(end)}`;

      // Update form value
      form.setValue("lyrics", newValue, {
        shouldDirty: true,
        shouldValidate: true,
      });

      setTimeout(() => {
        if (e.target) {
          e.target.selectionStart = e.target.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="mb-20 flex h-full flex-col gap-6 py-6 lg:py-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-auto rounded-xl px-2 text-primary-text hover:text-primary-text"
            onClick={() => navigate("/lyrics")}
          >
            <Icon icon="mingcute:arrow-left-line" size={24} />
          </Button>
          <div className="flex flex-col gap-1">
            <Title>{isEditMode ? "Edit Song" : "Add New Song"}</Title>
            <Description>
              {isEditMode
                ? "Update the details of the song."
                : "Enter the details of the new song."}
            </Description>
          </div>
        </div>
        <div>
          {isEditMode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-600"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon icon="mingcute:delete-line" size={24} />
                  )}
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the song from the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      {getSongByIdQuery.isLoading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-text" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full w-full flex-col gap-6"
          >
            {/* Hidden File Input for OCR */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={onSelectFile}
              accept="image/*"
              className="hidden"
            />

            <div className="flex flex-col gap-4 md:flex-row">
              <FormField
                control={form.control}
                name="song_number"
                render={({ field }) => (
                  <FormItem className="w-full md:w-1/3">
                    <FormLabel>Song Number</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g. 1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="lyrics"
              render={({ field }) => (
                <FormItem className="flex flex-1 flex-col gap-1">
                  {/* Header with Scan Button */}
                  <div className="flex items-center justify-between">
                    <FormLabel>Lyrics</FormLabel>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleScanClick}
                      disabled={isScanning}
                      className="gap-2"
                    >
                      {isScanning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                      {isScanning ? "Uploading..." : "Upload Image"}
                    </Button>
                  </div>

                  <FormControl>
                    <Textarea
                      placeholder="Enter lyrics here or scan an image..."
                      className="flex-1 resize-none font-mono text-sm"
                      onKeyDown={handleKeyDown}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/lyrics")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding || isUpdating}>
                {isAdding || isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : isEditMode ? (
                  "Update Song"
                ) : (
                  "Save Song"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
      {/* Crop Modal Component */}
      <CropModal
        isOpen={isCropModalOpen}
        onClose={setIsCropModalOpen}
        imgSrc={imgSrc}
        imgRef={imgRef}
        crop={crop}
        setCrop={setCrop}
        setCompletedCrop={setCompletedCrop}
        onImageLoad={onImageLoad}
        onConfirm={handleCropConfirm}
        isScanning={isScanning}
      />
    </div>
  );
};

export default AddSong;
