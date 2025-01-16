import React, { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
  className?: string;
  style?: React.CSSProperties;
  fallbackContent?: React.ReactNode;
}

export default function AdBanner({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
  className = "",
  style = {},
  fallbackContent,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adFailed, setAdFailed] = useState(false);

  useEffect(() => {
    // Check if adsbygoogle is blocked or not loaded
    if (typeof window === "undefined" || !(window as any).adsbygoogle) {
      setAdFailed(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (
        adRef.current &&
        (!adRef.current.innerHTML || adRef.current.innerHTML.trim() === "")
      ) {
        setAdFailed(true);
      }
    }, 2000);

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push(
        {}
      );
    } catch (err) {
      console.error("Error loading ad:", err);
      setAdFailed(true);
    }

    return () => clearTimeout(timeoutId);
  }, []);

  if (adFailed) {
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    } else {
      return (
        <div
          className="text-center p-3 d-flex justify-content-center align-items-center"
          style={{
            height: "100px",
            backgroundColor: "#ffffff08",
            width: "100%",
          }}
        >
          {<div className="opacity-75">Ad failed to load</div>}
        </div>
      );
    }
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle text-center ${className}`.trim()}
      style={{
        display: "block",
        minWidth: "400px",
        maxWidth: "970px",
        width: "100%",
        height: "90px",
        ...style,
      }}
      data-ad-client="ca-pub-5350229982172647"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    />
  );
}
