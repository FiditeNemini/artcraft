import {
  faDiscord,
  faFacebook,
  faPatreon,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Marquee from "react-fast-marquee";
import { TtsComponent } from "./TtsComponent";

function IndexPage() {
  return (
    <>
      <div id="home" data-scroll-section>
        <div className="bg-hero">
          <div
            className="shape-1-container"
            data-scroll
            data-scroll-speed="4"
            data-scroll-position="top"
          >
            <div className="shape-1"></div>
          </div>
          <div className="shape-2"></div>
          <div
            className="shape-3-container"
            data-scroll
            data-scroll-speed="3"
            data-scroll-position="top"
          >
            <div className="shape-3"></div>
          </div>
          <div
            className="shape-4-container"
            data-scroll
            data-scroll-speed="2"
            data-scroll-position="top"
          >
            <div className="shape-4"></div>
          </div>
          <div className="container">
            <div className="hero-title-container">
              <h1 className="hero-title d-flex flex-column text-center">
                <div
                  className="hero-title-one align-items-center zi-2"
                  data-scroll
                  data-scroll-speed="3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  The <span>Future</span>
                </div>
                <div
                  className="hero-title-two zi-2"
                  data-scroll
                  data-scroll-speed="-3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  of Production
                </div>
              </h1>

              <div className="d-flex flex-column align-items-end">
                <p
                  className="lead text-end w-50 hero-sub-title fw-normal opacity-75"
                  data-scroll
                  data-scroll-speed="-4"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  We’re streamers and filmmakers building the components of the
                  future Hollywood studio.
                </p>
                <div
                  data-scroll
                  data-scroll-speed="-5"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                  className="zi-10 mt-2"
                >
                  <a className="btn btn-primary" href="#about" data-scroll-to>
                    <span>Explore</span>
                  </a>
                </div>
              </div>

              <div className="hero-title-outline noselect">
                <h1 className="hero-title d-flex flex-column text-center">
                  <div
                    className="hero-title-one align-items-center text-outline"
                    data-scroll
                    data-scroll-speed="-4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    The Future
                  </div>
                  <div
                    className="hero-title-two text-outline"
                    data-scroll
                    data-scroll-speed="4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    of Production
                  </div>
                </h1>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <img
              className="hero-img"
              src="/hero/hero-img.webp"
              alt="Storyteller HyperJail"
            />
          </div>

          <div
            className="d-flex social-icons flex-column gap-4 align-items-center"
            data-scroll
            data-scroll-speed="8"
            data-scroll-direction="horizontal"
            data-scroll-position="top"
          >
            <a href="/">
              <FontAwesomeIcon icon={faDiscord} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faTwitch} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="/">
              <FontAwesomeIcon icon={faPatreon} />
            </a>
          </div>
        </div>
        <div id="about" className="bg-light section section-pb-extra">
          <div className="container py-5 text-center">
            <h1 className="fw-bold display-4">
              We're the new Hollywood and Nashville
            </h1>
            <h4 className="fw-normal opacity-75 mb-5 lead">
              Our technology can turn anyone into a director, musician, or movie
              star.
            </h4>
            <div className="w-100 d-flex justify-content-center d-none d-lg-flex">
              <div className="red-line"></div>
            </div>
            <div className="row gx-4 gy-4 pt-4">
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Music generation - vocals, instrumentals, and more
                </p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Audio dubbing and transformation
                </p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">Real time animation</p>
              </div>
              <div className="col-12 col-lg-3">
                <p className="fw-normal card bg-dark">
                  Real time Hollywood VFX without going to set
                </p>
              </div>
            </div>
          </div>
          <div className="w-100 d-flex justify-content-center">
            <img
              src="/logo/Storyteller-Icon-Logo.png"
              alt="Storyteller Logo Icon"
              className="divider-logo"
            />
          </div>
        </div>
        <div className="bg-dark section-2">
          <div id="products">
            <Marquee gradient={false} speed={100}>
              <h1 className="marquee-title d-flex gap-5">
                <span>What we do</span>
                <span className="text-red">\\</span>
                <span className="text-outline">What we do</span>
                <span className="text-red">\\</span>
                <span>What we do</span>
                <span className="text-red">\\</span>
                <span className="text-outline">What we do</span>
                <span className="text-red me-5">\\</span>
              </h1>
            </Marquee>
          </div>
          <div className="container pt-10">
            <div className="row gx-5">
              <div className="col-lg-5">
                <img
                  src="/images/FakeYou-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">FakeYou</h1>
                <p className="fw-normal fs-5 opacity-75">
                  Used by millions of people every month
                </p>
                <p className="mt-3">
                  We've built a social platform for deep learning and generative
                  models. FakeYou is a place where creators can upload and
                  manage a variety of deep fake models: speech, music,
                  lipsyncing, and more. Every day, artists and musicians use our
                  tools to their to dub their creative work. We offer paid voice
                  cloning services, an API with free and paid tiers, and in the
                  future, our users will be able to monetize their own voices.
                </p>
                <div>
                  <a
                    href="https://fakeyou.com"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Visit FakeYou.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* <TtsComponent /> */}
          </div>
        </div>
        <div className="bg-light section-2">
          <div className="container">
            <div className="row gx-5 flex-row-reverse">
              <div className="col-lg-5">
                <img
                  src="/images/Stream-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller Stream</h1>
                <p className="fw-normal fs-5 opacity-75">
                  Twitch Streamers and Creators can engage and monetize
                </p>
                <p className="mt-3">
                  It’s tough to build an audience on Twitch. It's even tougher
                  to earn an income. We've built the most comprehensive and
                  engaging donation system for Twitch to date, letting audience
                  members pay to use Deep Fake voices and emotes in their
                  favorite streamers' live broadcasts.Get started with your
                  channel! There's nothing to install. It's the easiest, most
                  engaging, most fun system for Twitch yet. And it earns you
                  money!
                </p>
                <div>
                  <a
                    href="https://storyteller.stream"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Add to your stream now!</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark section-2">
          <div className="container">
            <div className="row gx-5">
              <div className="col-lg-5">
                <img
                  src="/images/VC-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">FakeYou Voice Changer</h1>
                <p className="fw-normal fs-5 opacity-75">
                  Now you can sound like someone else
                </p>
                <p className="mt-3">
                  Change how you sound in real time. Choose your next voice.
                  Great for your stream, hanging out in VR, or filming that
                  historical drama.
                </p>
                <div>
                  <a
                    href="https://fakeyou.com"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Visit Storyteller.stream</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-light section-2">
          <div className="container">
            <div className="row gx-5 flex-row-reverse">
              <div className="col-lg-5">
                <img
                  src="/images/Engine-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller Engine</h1>
                <p className="fw-normal fs-5 opacity-75">
                  A fully 3D virtual set for your stream or film
                </p>
                <p className="mt-3">
                  Our community contributes sets, character models, props,
                  events, and more. Use motion or volumetric capture. Your
                  audience can control everything. Ideal for improv, news casts,
                  interviews, gaming, fast virtual filmmaking, and much more!
                </p>
                {/* <div>
                  <a
                    href="https://fakeyou.com"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Visit Storyteller.stream</span>
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark section-2">
          <div className="container">
            <div className="row gx-5">
              <div className="col-lg-5">
                <img
                  src="/images/VoxelCam-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller VoxelCam</h1>
                <p className="fw-normal fs-5 opacity-75">
                  Volumetric capture for your stream, and soon for your film
                  set.
                </p>
                <p className="mt-3">
                  Webcams are boring and flat. You can use our volumetric camera
                  in-stream to make your personality come to life. This system
                  can also be integrated into our no-cinema camera virtual set.
                </p>
                <div>
                  <a
                    href="https://fakeyou.com"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Visit Storyteller.stream</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default IndexPage;
