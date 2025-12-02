import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { Camera, X } from "lucide-react";
import PropTypes from "prop-types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment", // Use back camera on mobile if available
};

export const CameraModal = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onClose(false);
    }
  }, [webcamRef, onCapture, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-2">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Capture Image</DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col items-center justify-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={() => setIsCameraReady(true)}
            className="w-full max-w-full rounded-lg"
          />

          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Loading Camera...
            </div>
          )}

          <div className="mt-4 flex w-full justify-center gap-4">
            <Button variant="secondary" onClick={() => onClose(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={capture} disabled={!isCameraReady}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

CameraModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
};
