import { useState } from "react";
import { cn } from "./utils";
import PropTypes from "prop-types";

const ImageLoader = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-full">
      {!loaded && (
        <div className="absolute inset-0 h-full animate-pulse rounded-md bg-gray" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(className, {
          "opacity-0": !loaded,
          "h-full opacity-100 transition-opacity duration-300": loaded,
        })}
        onLoad={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
};
ImageLoader.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default ImageLoader;
