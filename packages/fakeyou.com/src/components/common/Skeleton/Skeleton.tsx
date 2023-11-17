import React from "react";
import "./Skeleton.scss";

interface SkeletonProps {
  type?: "full" | "medium" | "short";
  rounded?: boolean;
}

export default function Skeleton({ type = "full", rounded }: SkeletonProps) {
  const skeletonClass = `skeleton ${type} ${rounded ? "rounded" : ""}`;

  return <div className={skeletonClass}></div>;
}
