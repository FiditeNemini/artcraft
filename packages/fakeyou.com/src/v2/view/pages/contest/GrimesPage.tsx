import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container, item, image, panel } from "../../../../data/animation";
import { usePrefixedDocumentTitle } from "../../../../common/UsePrefixedDocumentTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileMusic, faWaveformLines } from "@fortawesome/pro-solid-svg-icons";

interface Props {}

function GrimesPage(props: Props) {
  usePrefixedDocumentTitle("Grimes AI Contest");

  return (
    <motion.div initial="hidden" animate="visible" variants={container}>
      <div className="container pt-3 pt-lg-5 pb-5">
        <div className="row gx-3 align-items-center">
          <div className="col-lg-5">
            <div className="d-flex justify-content-center justify-content-lg-start mb-3 mb-lg-0">
              <motion.img
                src="/mascot/contest.webp"
                className="img-fluid"
                width="350"
                alt="FakeYou Kitsune Mascot!"
                variants={image}
              />
            </div>
          </div>
          <div className="col-lg-7 px-md-2 ps-lg-5 ps-xl-2">
            <div className="text-center text-lg-start">
              <div>
                <motion.h1
                  className=" fw-bold lh-1 mb-4 display-5"
                  variants={item}
                >
                  Grimes AI Song Contest
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  We at FakeYou are thrilled to present the Grimes AI Song
                  Contest! Participants have the opportunity to compete for a
                  share of the huge <b>$20,000</b> prize pool! Read more about
                  this event in the details below.
                </motion.p>
                <div className="d-flex gap-3 mt-3 pt-3 justify-content-center justify-content-lg-start">
                  <Link to="/voice-conversion" className="btn btn-primary">
                    <FontAwesomeIcon icon={faWaveformLines} className="me-2" />
                    Start Creating
                  </Link>
                  <Link to="/voice-conversion" className="btn btn-primary">
                    <FontAwesomeIcon icon={faFileMusic} className="me-2" />
                    Submit Song
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="container-panel pt-5 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Contest Details</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>Description of the contest here...</p>
            <div>
              <h2 className="mb-4 fw-semibold">Prize Pool</h2>
              <p>
                1. Top Grimes AI Song
                <br />
                2. Top AI Song by another artist
                <br />
                3. Top Grimes Collab
                <br />
                4. Top Deceased Musician Song
                <br />
                5. Top Grimes x John Oliver (for instance)
                <br />
                6. Top Grimes x (other AI celeb)
              </p>
            </div>
            <div>
              <h2 className="mb-4 fw-semibold">How to Participate</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                nulla massa, viverra eget commodo a, tincidunt eu ante.
                Phasellus imperdiet augue rutrum dignissim hendrerit. Sed
                sodales ante eu est lacinia, eget eleifend sapien imperdiet.
                Integer a efficitur massa.
              </p>
              <br />
              <p>
                Nunc sapien sapien, vestibulum venenatis nulla eget, venenatis
                vulputate dolor. Etiam faucibus dolor vel augue suscipit ornare.
                Integer et velit metus. Ut enim arcu, hendrerit eget viverra at,
                sagittis id dui. Maecenas mollis justo libero, sed auctor ligula
                suscipit vestibulum. Fusce nec dictum metus. Quisque dapibus
                placerat urna, at tempus velit blandit quis.
              </p>
            </div>
            <div>
              <h2 className="mb-4 fw-semibold">Contest Terms and Conditions</h2>
              <h5 className="mb-4 fw-semibold">1. Eligibility</h5>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla
                nulla massa, viverra eget commodo a, tincidunt eu ante.
                Phasellus imperdiet augue rutrum dignissim hendrerit. Sed
                sodales ante eu est lacinia, eget eleifend sapien imperdiet.
                Integer a efficitur massa.
              </p>
              <br />
              <h5 className="mb-4 fw-semibold">
                2. Data Protection and Publicity
              </h5>
              <p>
                Maecenas mollis justo libero, sed auctor ligula suscipit
                vestibulum. Fusce nec dictum metus. Quisque dapibus placerat
                urna, at tempus velit blandit quis.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { GrimesPage };
