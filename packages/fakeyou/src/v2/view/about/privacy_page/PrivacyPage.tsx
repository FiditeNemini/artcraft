import React from "react";
import { motion } from "framer-motion";
import { container, item, panel, image } from "../../../../data/animation";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";

interface Props {}

function PrivacyPage(props: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pb-0 pt-5 pb-lg-5 px-md-4 px-lg-5 px-xl-3">
        <div className="d-flex flex-column">
          <motion.h1
            className="display-5 fw-bold text-center text-lg-start"
            variants={item}
          >
            FakeYou Privacy Statement
          </motion.h1>
          <motion.h4
            className="mt-1 mb-4 opacity-75 text-center text-lg-start"
            variants={item}
          >
            Updated: November 17, 2022
          </motion.h4>
        </div>
      </div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Privacy Policy</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>This is a sentence.</p>

            <div>
              <h2 className="mb-4">Sub-heading 1</h2>
              <p>This is a sentence.</p>
            </div>
            <div>
              <h2 className="mb-4">Sub-heading 2</h2>
              <p>This is a sentence.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { PrivacyPage };
