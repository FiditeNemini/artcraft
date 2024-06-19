import React from "react";
import { useFeatureStore } from "./store";

interface FeatureCardProps extends CardProps {
  children: React.ReactNode;
}

interface CardProps {
  id: string;
}

function FeatureCard({ children, id }: FeatureCardProps) {
  const inViewFeature = useFeatureStore((state: any) => state.inViewFeature);

  return (
    <div
      className="h-100 w-100 overflow-hidden"
      style={{
        opacity: inViewFeature === id ? 1 : 0,
        transition: "all 0.25s",
        borderRadius: "1rem",
        border: "2px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function BuildScene({ id }: CardProps) {
  return (
    <FeatureCard id={id}>
      <video
        src="/videos/landing/build_scene.mp4"
        className="object-fit-contain w-100 h-100"
        preload="metadata"
        muted={true}
        autoPlay={true}
        controls={false}
        loop={true}
        playsInline={true}
      />
    </FeatureCard>
  );
}

export function Animate({ id }: CardProps) {
  return (
    <FeatureCard id={id}>
      <video
        src="/videos/landing/animate_scene.mp4"
        className="object-fit-contain w-100 h-100"
        preload="metadata"
        muted={true}
        autoPlay={true}
        controls={false}
        loop={true}
        playsInline={true}
      />
    </FeatureCard>
  );
}

export function SelectStyle({ id }: CardProps) {
  return (
    <FeatureCard id={id}>
      <video
        src="/videos/landing/select_style.mp4"
        className="object-fit-contain w-100 h-100"
        preload="metadata"
        muted={true}
        autoPlay={true}
        controls={false}
        loop={true}
        playsInline={true}
      />
    </FeatureCard>
  );
}

export function GenerateMovie({ id }: CardProps) {
  return (
    <FeatureCard id={id}>
      <video
        src="/videos/landing/generate_movie.mp4"
        className="object-fit-contain w-100 h-100"
        preload="metadata"
        muted={true}
        autoPlay={true}
        controls={false}
        loop={true}
        playsInline={true}
      />
    </FeatureCard>
  );
}
