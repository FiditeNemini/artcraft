import { useSession } from "hooks";
import React, { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat: string;
  dataFullWidthResponsive: boolean;
  className?: string;
  style?: React.CSSProperties;
  fallbackContent?: React.ReactNode;
  tall?: boolean;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat,
  dataFullWidthResponsive,
  className = "",
  style = {},
  fallbackContent,
  tall = false,
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const [adFailed, setAdFailed] = useState(false);

  const { loggedIn, sessionSubscriptions } = useSession();
  const hasPremium = loggedIn && sessionSubscriptions?.hasPaidFeatures();

  useEffect(() => {
    if (hasPremium) {
      // Disable auto ads for premium users
      (window as any).adsbygoogle = [];
      document.querySelectorAll("ins.adsbygoogle").forEach(ad => {
        ad.remove();
      });
      // Remove padding added by auto ads
      document.body.style.paddingBottom = "0";
      return;
    }

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
  }, [hasPremium]);

  if (hasPremium) {
    return null;
  }

  if (adFailed) {
    if (fallbackContent) {
      return <>{fallbackContent}</>;
    } else {
      return (
        // <div
        //   className="text-center p-3 d-flex justify-content-center align-items-center"
        //   style={{
        //     height: "100px",
        //     backgroundColor: "#ffffff08",
        //     width: "100%",
        //   }}
        // >
        //   {<div className="opacity-75">Ad failed to load</div>}
        // </div>
        null
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
        maxWidth: "1200px",
        width: "100%",
        height: tall ? "auto" : "90px",
        ...style,
      }}
      data-ad-client="ca-pub-5350229982172647"
      data-ad-slot={dataAdSlot}
      data-ad-format={dataAdFormat}
      data-full-width-responsive={dataFullWidthResponsive.toString()}
    />
  );
}
