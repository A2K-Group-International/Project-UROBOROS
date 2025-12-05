import { useState, useRef } from "react";
import { centerCrop, makeAspectCrop } from "react-image-crop";

export const useImageCropper = () => {
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const imgRef = useRef(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined); // Makes crop preview update between images
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(e.target.files[0]);
      setIsCropModalOpen(true);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        width / height, // Aspect ratio (optional, remove for free crop)
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  };

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to match the high-resolution cropped area
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Improve OCR accuracy by using a white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image at full resolution
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        blob.name = "cropped.jpeg";
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const resetCropper = () => {
    setImgSrc("");
    setCompletedCrop(null);
    setCrop(null);
    setIsCropModalOpen(false);
  };

  return {
    imgSrc,
    setImgSrc,
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
  };
};
