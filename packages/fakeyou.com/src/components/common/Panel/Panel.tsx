import React from "react";
import { motion } from "framer-motion";
import { panel } from "data/animation";

interface PanelProps {
  children: React.ReactNode;
  padding?: boolean;
  mb?: boolean;
  mt?: boolean;
}

export default function Panel({ children, padding, mb, mt }: PanelProps) {
  return (
    <motion.div className="container-panel" variants={panel}>
      <div
        className={`panel ${padding ? "p-3 py-4 p-md-4" : ""}
        ${mb ? "mb-4" : ""} ${mt ? "mt-4" : ""}`}
      >
        {children}
      </div>
    </motion.div>
  );
}
