import React from "react";
import { motion } from "framer-motion";
import { container, item, panel, image } from "../../../../data/animation";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";

interface Props {}

function TermsPage(props: Props) {
  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container">
        <div className="row gx-3 flex-lg-row-reverse align-items-center">
          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <motion.img
                src="/mascot/tou.webp"
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
                  Terms and Conditions
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  <h4>Please use this technology responsibly.</h4>
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Terms of Use</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>
              We do not condone the use of FakeYou for any type of deception,
              slur, abuse, or mistreatment of any individual or group. Please
              report such abuses to our{" "}
              <a href={ThirdPartyLinks.FAKEYOU_DISCORD}>
                community staff on Discord
              </a>
              . Bad actors will have their access revoked and materials deleted.
            </p>
            <p>
              This is a research technology for fun. You may not use FakeYou
              deepfakes for commercial use.
            </p>
            <p>
              Do not engage in unlawful activity or attempt to impersonate any
              person, company, or other entity. All published usages must be
              labled as "deep fake".
            </p>
            <p>
              <em>
                The audio we generate is watermarked, and we will soon release a
                tool to verify that it is deep fake generated and trace it back
                to its source.
              </em>
            </p>

            <div>
              <h2 className="mb-4">Takedown Requests</h2>
              <p>
                The machine learning models and content at FakeYou are
                user-submitted, but we'll be happy to remove content for any
                reason for copyright holders, original speakers, voice actors,
                et al. Please send us an email to{" "}
                <code>copyright@storyteller.io</code> with details in order to
                request a takedown.
              </p>
            </div>
            <div>
              <h2 className="mb-4">Voice Acting & Musician Jobs</h2>
              <p>
                If you're a voice actor or musician, we're looking to hire
                talented performers to help us build commercial-friendly AI
                voices. (The user-submitted models on FakeYou are just a
                technology demonstration and may not be used commercially.) We
                want to empower small creators (game designers, musicians, and
                more) to voice, sing, and speak emotion into their work. Please
                reach out to <code>jobs@storyteller.io</code> if you'd like to
                work with us. We can pay a flat fee and/or royalty. Please get
                in touch to learn more!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { TermsPage };
