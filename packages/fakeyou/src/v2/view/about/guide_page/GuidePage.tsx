import React from "react";
import { motion } from "framer-motion";
import { container, item, panel, image } from "../../../../data/animation";
import { Link } from "react-router-dom";

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
                  FakeYou TTS Guide
                </motion.h1>
              </div>
              <div className="mb-5">
                <motion.p className="lead px-5 px-lg-0" variants={item}>
                  <h4>How to generate the best sounding TTS</h4>
                </motion.p>
              </div>
              <div>
                <motion.div
                  variants={item}
                  className="d-flex justify-content-center justify-content-lg-start mb-5 mb-lg-0"
                >
                  <Link to="/">
                    <button className="btn btn-primary">
                      Generate your TTS
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">Quick Tips</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>
              These are some tips to generate the best sounding text-to-speech.
            </p>
            <div>
              <h2 className="mb-4">Preventing TTS strokes</h2>
              <p>
                A TTS stroke is when the generated audio becomes garbled and
                incoherent.
              </p>
              <p>
                This can be fixed by adding an ending punctuation as without
                one, this will happen frequently. If the message still messes
                up, add a comma at the start and end so the program can take a
                brief pause and usually corrects it.
              </p>
            </div>
            <div>
              <h2 className="mb-4">
                Purposefully misspelling words to get correct
                pronunciation/manner of speech
              </h2>
              <p>
                Sometimes the TTS program cannot accurately read the word or you
                want a word pronounced a certain way. You can experiment with
                it. For example, to say the word "ass" with a certain hit, spell
                it as "asz". Or another example, Games = Gaymes.
              </p>
            </div>
            <div>
              <h2 className="mb-4">Fluffing</h2>
              <p>
                To get a certain emotion and personality in the message you
                want, add fluff. To do this, add the first sentence with words
                that you have no intention of using. Like bunch of cursing and
                such. "
                <span style={{ textDecoration: "line-through" }}>
                  Fuck you bitch! I hate you!
                </span>{" "}
                I cant believe you said that to me!". You can remove the first
                sentence you had no intention of using in an audio editor of
                your choice like Audacity.
              </p>
            </div>
            <div>
              <h2 className="mb-4">Yelling</h2>
              <p>
                This only works if the dataset has yelling and transcript
                properly. When you do the transcript of a character that yells,
                add an exclamation mark on the transcript clip that has yelling
                and periods for normal speech. This will easier trigger angry
                emotions. But the yelling will likely not happen with smaller
                datasets or if the yelling is not at all in the dataset.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h2 className="panel-title fw-bold">Generate your TTS now!</h2>
          <div className="py-6 d-flex flex-column gap-4">
            <div>
              <Link to="/">
                <button className="btn btn-primary w-100">
                  Go to text-to-speech generation page
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { GuidePage };
