import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container, item, image } from "../../../../data/animation";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function PortalSuccessPage(props: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container mb-4">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <motion.img
                src="/mascot/kitsune_pose3.webp"
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
                  className="display-5 fw-bold lh-1 mb-4"
                  variants={item}
                >
                  Thank You!
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  Your support means a lot to us.
                </motion.p>
                <motion.p className="lead" variants={item}>
                  Please continue to enjoy FakeYou!
                </motion.p>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="d-flex justify-content-center">
              <Link to="/" className="btn btn-primary  fs-6">
                Back to FakeYou
              </Link>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

export { PortalSuccessPage };
