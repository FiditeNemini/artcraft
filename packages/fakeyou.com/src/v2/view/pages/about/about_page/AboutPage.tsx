import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { container, item, image, panel } from "../../../../../data/animation";

interface Props {}

function AboutPage(props: Props) {
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
                  A Glimpse of the Future
                </motion.h1>
              </div>
              <div>
                <motion.p className="lead" variants={item}>
                  We're building FakeYou as just one component of a broad set of
                  production and creative tooling.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div className="container-panel pt-4 pb-5" variants={panel}>
        <div className="panel p-3 p-lg-4 load-hidden mt-5 mt-lg-0">
          <h1 className="panel-title fw-bold">About FakeYou</h1>
          <div className="py-6 d-flex flex-column gap-4">
            <p>
              Your brain was already capable of imagining things spoken in other
              people's voices. This is a demonstration of how far computers have
              caught up. One day computers will be able to bring all of the rich
              and vivid imagery of your hopes and dreams to life. There's never
              been a better time throughout all history to be a creative than
              now.
            </p>
            <div>
              <h2 className="mb-4">Technology disclosure</h2>
              <p>
                <em>
                  We'll be happy to remove any of the voices featured here for
                  any reason. See our <Link to="/terms">terms page</Link> for
                  more info.
                </em>
              </p>
              <br />
              <p>
                &rdquo;Deep fakes&rdquo; are kind of like Photoshop when it
                first came out. They're impressive, maybe a little bit scary,
                but they're about to become the new norm. People will become
                accustomed to the technology, and the results will be used
                mostly for creative good, unlocking previously costly and
                unattainable high production values for individual creators.
                It's our belief that the next Hollywood will be <em>you</em>.
              </p>
              <br />
              <p>
                The technology to clone voices is already out in the open, and
                the voices here are built by a community of contributors. We're
                not the only website doing this, and plenty of people are
                producing these same results on their own at home, independent
                of our work. You can see thousands of examples on YouTube and
                social media.
              </p>
              <br />
              <p>
                Even if the United States chooses to ban this technology,
                institutions in China, Japan, Canada, and other countries all
                over the world are rapidly conducting and publishing research on
                this topic. People everywhere have access to this easy-to-use
                technology. State actors probably have even more sophisiticated
                versions available.
              </p>
              <br />
              <p>
                As an interesting point, most if not all of the voices produced
                by this website are actually
                <em> Linda Johnson</em> with a little bit layered on top.
              </p>

              <p>
                <a
                  href="https://github.com/NVIDIA/tacotron2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NVIDIA makes these tools publicly available for you to make
                  your own voice models
                </a>
                . Check it out!
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
            <div>
              <h2 className="mb-4">FakeYou was previously Vocodes</h2>
              <p>
                FakeYou.com was previously known as{" "}
                <strong>https://vo.codes</strong>, but has been rebranded to
                better reflect its purpose and direction. (Not many people know
                what a <em>vocoder</em> is anyway, so it didn't make sense to
                keep the name.)
              </p>
            </div>
            <div>
              <h2 className="mb-4">Thanks</h2>
              <p>
                Thanks to the following individuals (in no particular order) for
                help with data gathering and annotation, Discord moderation, ML
                advice, etc.
              </p>
              <br />
              <p>
                Vegito1089, Shin, Ashurath, MakaveliGH, Blutarch Mann, Yahia,
                Tim Squid, Seuneramet, Matt, Seth, CookiePPP,{" "}
                <a
                  href="https://twitter.com/r9y9/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @r9y9
                </a>
                , BFlat, Raisin.
              </p>

              <br />

              <p>
                The following papers, models, and resources were used:
                <br />
                <br />
                <a
                  href="https://github.com/NVIDIA/tacotron2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Tacotron2
                </a>{" "}
                (BSD-3 license),{" "}
                <a
                  href="https://github.com/jaywalnut310/glow-tts"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  glow-tts
                </a>{" "}
                (MIT license), {/* MIT */}
                <a
                  href="https://github.com/seungwonpark/melgan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MelGAN
                </a>{" "}
                (BSD-3 license), {/* BSD3 */}
                <a
                  href="https://arxiv.org/pdf/2005.05106.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Multi-band MelGAN
                </a>{" "}
                (paper),{" "}
                <a
                  href="https://arxiv.org/abs/2010.05646"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  HiFi-GAN
                </a>{" "}
                (paper),{" "}
                <a
                  href="https://github.com/Rudrabha/Wav2Lip"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wav2Lip
                </a>{" "}
                (MIT license), {/* Non-commercial */}
                <a
                  href="http://www.speech.cs.cmu.edu/cgi-bin/cmudict"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CMUDict
                </a>{" "}
                (BSD-2 license),{" "}
                <a
                  href="https://keithito.com/LJ-Speech-Dataset/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LJSpeech
                </a>{" "}
                (public domain),{" "}
                <a
                  href="https://datashare.is.ed.ac.uk/handle/10283/3443"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  VCTK
                </a>{" "}
                (CC BY 4.0).
              </p>
              <br />
              <p>
                Videos are generated by the amazing Wav2Lip system{" "}
                <a
                  href="https://doi.org/10.1145/3394171.3413532"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (paper)
                </a>
                , by Prajwal{" "}
                <a
                  href="https://twitter.com/prajwalkr14"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (@prajwalkr14)
                </a>
                , K R and Mukhopadhyay, Rudrabha and Namboodiri, Vinay P. and
                Jawahar, C.V.
              </p>
            </div>
            <div>
              <h2 className="mb-4">Contact</h2>
              <p>
                Reach out to "echelon" on{" "}
                <a
                  href="https://twitter.com/echelon"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
                &nbsp;and Hacker News. Say hi.
              </p>

              <p>
                The Storyteller Company (registered as Learning Machines, LLC)
              </p>
            </div>
            <div>
              <h2 className="mb-4">Built With</h2>
              <div className="row gx-3 gx-lg-4">
                <div className="col-4 col-md-3">
                  <img
                    className="rounded img-fluid"
                    src="/logos/pytorch.png"
                    alt="models are written in pytorch"
                  />
                </div>
                <div className="col-4 col-md-3">
                  <img
                    className="rounded img-fluid"
                    src="/logos/rust.png"
                    alt="core server components are written in Rust"
                  />
                </div>
                <div className="col-4 col-md-3">
                  <img
                    className="rounded img-fluid"
                    src="/logos/kubernetes.png"
                    alt="the cluster scales with k8s"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { AboutPage };
