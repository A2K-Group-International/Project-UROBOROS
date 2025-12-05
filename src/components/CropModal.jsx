import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Crop } from "lucide-react";
import PropTypes from "prop-types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Description } from "@/components/Title";

export const CropModal = ({
  isOpen,
  onClose,
  imgSrc,
  imgRef,
  crop,
  setCrop,
  setCompletedCrop,
  onImageLoad,
  onConfirm,
  isScanning,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <Description>Crop the image to select the lyrics area.</Description>
        </DialogHeader>
        <div className="flex justify-center">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={undefined} // Free crop
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: "90vh" }}
              />
            </ReactCrop>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isScanning}>
            <Crop className="mr-2 h-4 w-4" />
            {isScanning ? "Scanning..." : "Confirm Crop & Scan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

CropModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imgSrc: PropTypes.string,
  imgRef: PropTypes.object,
  crop: PropTypes.object,
  setCrop: PropTypes.func.isRequired,
  setCompletedCrop: PropTypes.func.isRequired,
  onImageLoad: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isScanning: PropTypes.bool,
};
