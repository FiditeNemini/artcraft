import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { selectedRemixCard } from "~/pages/PageEnigma/Wizard/signals/wizard";

export const RemixVideo = ({
  card,
}: {
  card: {
    title: string;
    text: string;
    defaultVideo: string;
    hoverVideo: string;
    token: string;
  };
}) => {
  useSignals();
  const [hover, setHover] = useState(false);

  return (
    <div>
      <button
        key={card.token}
        className={twMerge(
          "relative block aspect-video w-[352px] overflow-hidden rounded-lg",
          card.token === selectedRemixCard.value?.token
            ? "border-2 border-brand-primary"
            : "border-2 border-gray-500",
        )}
        onClick={() => (selectedRemixCard.value = card)}
        onPointerOver={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        {hover ? (
          <video src={card.hoverVideo} crossOrigin="anonymous" autoPlay loop />
        ) : (
          <video
            src={card.defaultVideo}
            crossOrigin="anonymous"
            autoPlay
            loop
          />
        )}
        <div className="text-bold absolute bottom-[8px] left-[8px] text-lg">
          {card.title}
        </div>
      </button>
      <div className="text-xs text-white/50">{card.text}</div>
    </div>
  );
};
