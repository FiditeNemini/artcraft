import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container, item, image } from "../../../../data/animation";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";

interface Props {
  sessionWrapper: SessionWrapper;
  querySessionCallback: () => void;
}

function CheckoutCancelPage(props: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container mb-4">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <motion.img
                src="/mascot/kitsune_pose7.webp"
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
                  Oh no!
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  It's okay if you don't want to support FakeYou right now, but we'd 
                  appreciate it if you reconsider us in the future.
                </motion.p>
                <br />
                <motion.p className="lead" variants={item}>
                  Paid plans go directly to helping us afford more GPUs, engineering, 
                  and research talent.
                </motion.p>
                <br />
                <motion.p className="lead" variants={item}>
                  We're trying to build a film and music production system that you 
                  can use to make any content you dream up. Please consider supporting 
                  us monetarily.
                </motion.p>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <Link to="/" className="btn btn-secondary fs-6">
                Back to FakeYou
              </Link>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <Link to="/pricing" className="btn btn-primary  fs-6">

                Select a Premium Plan
              </Link>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

export { CheckoutCancelPage };
