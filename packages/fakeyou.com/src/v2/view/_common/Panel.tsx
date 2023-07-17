import React from "react";
import { motion } from "framer-motion";
import { panel } from "data/animation";

interface PanelProps {
  children: React.ReactNode;
}

function Panel(props: PanelProps) {
  return (
    <motion.div className="container-panel pb-5 mb-4" variants={panel}>
      <div className="panel p-3 py-4 p-md-4">{props.children}</div>
    </motion.div>
  );
}

export { Panel };
