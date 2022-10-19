import React from "react";
import { motion } from "framer-motion";
import { container, item, panel, image } from "../../../../data/animation";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";

interface Props {}

function GuidePage(props: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <motion.img
                src="/mascot/guide.webp"
                className="img-fluid"
                width="516"
                height="444"
                alt="FakeYou Kitsune Mascot!"
                variants={image}
              />
            </div>
          </div>
          <div className="col-lg-6 px-md-2 ps-lg-5 ps-xl-2">
            <div className="text-center text-lg-start">
              <div>
                <motion.h1
                  className="display-5 fw-bold lh-1 mb-3"
                  variants={item}
                >
                  FakeYou Site Guide
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  <h4>How do I use FakeYou text-to-speech?</h4>
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Guide</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>Description.</p>
            <div>
              <h2 className="mb-4">How to get the best sounding TTS?</h2>
              <p>
                The machine learning models and content at FakeYou are
                user-submitted, but we'll be happy to remove content for any
                reason for copyright holders, original speakers, voice actors,
                et al. Please send us an email to{" "}
                <code>copyright@storyteller.io</code> with details in order to
                request a takedown.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { GuidePage };
