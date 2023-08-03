import React from "react";
import { motion } from "framer-motion";
import { panel } from "data/animation";

interface PanelProps {
  children: React.ReactNode;
  padding?: boolean;
  mb?: boolean;
}

export default function Panel(props: PanelProps) {
  return (
    <motion.div className="container-panel" variants={panel}>
      <div
        className={`panel ${props.padding ? "p-3 py-lg-4 p-md-4" : ""} ${
          props.mb ? "mb-4" : ""
        }`}
      >
        {props.children}
      </div>
    </motion.div>
  );
}
