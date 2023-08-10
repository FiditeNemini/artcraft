import { container } from "data/animation";
import { motion } from "framer-motion";
import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  padding?: boolean;
}

export default function PageContainer({
  children,
  padding,
}: PageContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className={`${padding ? "container" : ""}`}
    >
      {children}
    </motion.div>
  );
}
