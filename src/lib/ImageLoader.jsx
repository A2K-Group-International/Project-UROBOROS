import { useState } from "react";
import { cn } from "./utils";
import PropTypes from "prop-types";

const ImageLoader = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative">
      {!loaded && (
        <div className="bg-gray-400 absolute inset-0 h-full animate-pulse rounded-md" />
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
