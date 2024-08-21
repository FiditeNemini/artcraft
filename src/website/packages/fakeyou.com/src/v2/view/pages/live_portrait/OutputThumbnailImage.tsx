import React, { useState, useEffect } from "react";

interface OutputThumbnailImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}

const OutputThumbnailImage: React.FC<OutputThumbnailImageProps> = ({
  src,
  alt,
  style,
  draggable,
}) => {
  const [isThumbReady, setIsThumbReady] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [thumbnailSrc, setThumbnailSrc] = useState(src);

  useEffect(() => {
    let isMounted = true;
    const maxAttempts = 5;

    const checkImage = () => {
      const img = new Image();
      const thumbSrc = src + "-thumb.jpg";
      img.src = thumbSrc;
      img.onload = () => {
        if (isMounted) {
          console.log("Thumbnail loaded successfully");
          setIsThumbReady(true);
          setThumbnailSrc(thumbSrc);
        }
      };
      img.onerror = () => {
        if (isMounted && !isThumbReady && attempts < maxAttempts) {
          console.log(`Attempt ${attempts + 1} failed, retrying...`);
          setTimeout(checkImage, 1000); // Retry after 1 second if the image is not available
          setAttempts(prev => prev + 1);
        } else {
          console.log("Max attempts reached or component unmounted");
        }
      };
    };

    if (src && src.toLowerCase().endsWith(".mp4")) {
      checkImage();
    }

    return () => {
      isMounted = false;
    };
  }, [src, isThumbReady, attempts]);

  return (
    <>
      {isThumbReady ? (
        <img
          key={src}
          src={thumbnailSrc}
          alt={alt}
          style={style}
          draggable={draggable}
        />
      ) : null}
    </>
  );
};

export default OutputThumbnailImage;
