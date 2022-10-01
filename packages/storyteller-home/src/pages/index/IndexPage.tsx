import {
  faDiscord,
  faFacebook,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import {
  faArrowRight,
  faBookOpen,
  faClapperboard,
  faDrum,
  faFilm,
  faMicrophone,
  faMicrophoneLines,
  faMusic,
  faPaintbrush,
  faPersonWalkingArrowRight,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Marquee from "react-fast-marquee";
import { TtsComponent } from "./TtsComponent";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import AudioSample from "./AudioSample";
import { useEffect } from "react";
import gsap from "gsap";
import SplitType from "split-type";
import Scene from "./Scene";
import { ThirdPartyLinks } from "@storyteller/components/src/constants/ThirdPartyLinks";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper";
import { useForm, ValidationError } from '@formspree/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function IndexPage() {
  // Title Animation
  useEffect(() => {
    const splitTitle = new SplitType("#hero-title", {
      types: "chars",
      charClass: "title-split",
    });

    const splitTitleOutline = new SplitType("#hero-title-outline", {
      types: "words",
      wordClass: "title-outline-split",
    });

    console.log(splitTitleOutline);

    var tl = gsap.timeline({ delay: 0.2 });
    tl.to(
      "#pascal",
      {
        delay: 0.2,
        duration: 1.2,
        y: 0,
        opacity: 1,
        ease: "expo",
      },
      "<"
    );
    tl.to(
      "#roko",
      {
        duration: 1.2,
        x: 0,
        opacity: 1,
        ease: "expo",
      },
      "<"
    );
    tl.to(
      "#basilisk",
      {
        duration: 1.2,
        x: 0,
        opacity: 1,
        ease: "expo",
      },
      "<"
    );
    tl.to(
      splitTitle.chars,
      {
        delay: 0.3,
        duration: 0.4,
        y: 0,
        opacity: 1,
        stagger: 0.03,
        ease: "expo",
      },
      "<"
    );
    tl.to(
      splitTitleOutline.words,
      {
        delay: 0,
        duration: 0.8,
        y: 0,
        scale: 1,
        opacity: 1,
        ease: "expo",
      },
      "<"
    );
    tl.to(
      "#sub-title",
      {
        delay: 0.4,
        duration: 0.8,
        x: 0,
        scale: 1,
        opacity: 1,
        ease: "expo",
      },
      "<"
    );

    tl.to(
      ".shape-2, .shape-1, .shape-3, .shape-4",
      {
        duration: 1,
        y: 0,
        scale: 1,
        opacity: 0.6,
        ease: "expo",
      },
      0.4
    );
  }, []);

  const [state, handleSubmit] = useForm("xnqrvjbo");
  if (state.succeeded) {
    const reset = document.getElementById("reset")
    const success = document.getElementById('success_message')

    if (reset) reset.click()

    setTimeout(function () {
      if (success) success.innerHTML = '<h4 >Thank you for your message!</h4>'
    }, 500)

    setTimeout(function () {
      if (success) success.innerHTML = ''
    }, 5000)
  }

  return (
    <>
      <div id="home" data-scroll-section>
        <div className="bg-hero">
          <div className="container">
            <div className="hero-title-container">
              <h1
                id="hero-title"
                className="hero-title d-flex flex-column text-center"
              >
                <span
                  className="hero-title-one align-items-center zi-2"
                  data-scroll
                  data-scroll-speed="3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  The <span>Future</span>
                </span>
                <span
                  className="hero-title-two zi-2"
                  data-scroll
                  data-scroll-speed="-3"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  of Production
                </span>
              </h1>

              <div
                className="d-flex flex-column align-items-center align-items-xl-end"
                id="sub-title"
              >
                <p
                  className="lead hero-sub-title fw-normal opacity-75"
                  data-scroll
                  data-scroll-speed="-4"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  We’re scientists, engineers, and creatives building the future
                  AI cloud production studio.
                </p>
                <div
                  id="hero-btn"
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
                <h1
                  id="hero-title-outline"
                  className="hero-title d-flex flex-column text-center"
                >
                  <span
                    className="hero-title-one align-items-center text-outline"
                    data-scroll
                    data-scroll-speed="-4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    The Future
                  </span>
                  <span
                    className="hero-title-two text-outline"
                    data-scroll
                    data-scroll-speed="4"
                    data-scroll-direction="horizontal"
                    data-scroll-position="top"
                  >
                    of Production
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            {/* <img
              id="hero-img"
              className="hero-img"
              src="/hero/hero-img.webp"
              alt="Storyteller HyperJail"
            /> */}

            <div
              className="hero-img roko"
              data-scroll
              data-scroll-speed="1"
              data-scroll-direction="horizontal"
              data-scroll-position="top"
            >
              <img
                id="roko"
                src="/hero/hyperjail_IsolatedRoko_RimWEB.png"
                alt=""
              />
            </div>

            <div
              className="hero-img basilisk"
              data-scroll
              data-scroll-speed="-1"
              data-scroll-direction="horizontal"
              data-scroll-position="top"
            >
              <img
                id="basilisk"
                src="/hero/hyperjail_IsolatedBasilisk_RimWEB.png"
                alt=""
              />
            </div>

            <div
              className="hero-img pascal"
              data-scroll
              data-scroll-speed="1"
              data-scroll-direction="vertical"
              data-scroll-position="top"
            >
              <img
                id="pascal"
                src="/hero/hyperjail_IsolatedPascal_RimWEB.png"
                alt=""
              />
            </div>

            <div className="bg-floor"></div>
          </div>

          <div
            className="d-none d-lg-flex social-icons flex-column gap-4 align-items-center"
            data-scroll
            data-scroll-speed="8"
            data-scroll-direction="horizontal"
            data-scroll-position="top"
          >
            <Tippy content="Discord" placement="right">
              <a
                href={ThirdPartyLinks.FAKEYOU_DISCORD}
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faDiscord} />
              </a>
            </Tippy>
            <Tippy content="Twitch" placement="right">
              <a
                href="https://twitch.tv/FakeYouLabs"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faTwitch} />
              </a>
            </Tippy>
            <Tippy content="Facebook" placement="right">
              <a
                href="https://facebook.com/vocodes"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faFacebook} />
              </a>
            </Tippy>
            <Tippy content="Twitter" placement="right">
              <a
                href="https://twitter.com/intent/follow?screen_name=FakeYouApp"
                rel="noreferrer"
                target="_blank"
              >
                <FontAwesomeIcon icon={faTwitter} />
              </a>
            </Tippy>
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
            className="shape-1-container"
            data-scroll
            data-scroll-speed="4"
            data-scroll-position="top"
          >
            <div className="shape-1"></div>
          </div>

          <div
            className="shape-4-container"
            data-scroll
            data-scroll-speed="2"
            data-scroll-position="top"
          >
            <div className="shape-4"></div>
          </div>
        </div>
        <div
          id="about"
          className="bg-light section section-pb-extra about-section"
        >
          <Marquee gradient={false} speed={100}>
            <h1 className="marquee-title d-flex gap-3 gap-md-4 gap-lg-5">
              <span className="text-outline">Storyteller</span>
              <span className="text-red">\\</span>
              <span>Storyteller</span>
              <span className="text-red">\\</span>
              <span className="text-outline">Storyteller</span>
              <span className="text-red">\\</span>
              <span>Storyteller</span>
              <span className="text-red me-3 me-md-4 me-lg-5">\\</span>
            </h1>
          </Marquee>

          <div className="container py-5 text-center d-flex flex-column align-items-center mt-3">
            <h1 className="fw-bold display-4 about-title mt-5">
              You can run the new Hollywood and top the Billboard Hot 100
            </h1>
            <h4 className="fw-semibold opacity-75 mt-4">
              Our technology can turn anyone into a director, musician, or movie
              star.
            </h4>
          </div>

          <div className="about-cards-container mt-4 mb-5">
            <div className="container text-center d-flex flex-column align-items-center">
              <div className="row gx-4 gy-5 pt-4 position-relative">
                <div
                  className="shape-5-container"
                  data-scroll
                  data-scroll-speed="4"
                  data-scroll-position="top"
                >
                  <div className="shape-5"></div>
                </div>
                <div
                  className="shape-6-container"
                  data-scroll
                  data-scroll-speed="4"
                  data-scroll-position="top"
                >
                  <div className="shape-6"></div>
                </div>
                <div
                  className="shape-7-container"
                  data-scroll
                  data-scroll-speed="3"
                  data-scroll-position="top"
                >
                  <div className="shape-7"></div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon icon={faMusic} className="about-icon" />
                    Music generation - vocals, instrumentals, and more
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon
                      icon={faMicrophoneLines}
                      className="about-icon"
                    />
                    Audio dubbing and transformation
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon
                      icon={faPersonWalkingArrowRight}
                      className="about-icon"
                    />
                    Real time animation
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon icon={faFilm} className="about-icon" />
                    Real time Hollywood VFX without going to set
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon icon={faBookOpen} className="about-icon" />
                    World building, character arc development, narrative
                    creation
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon
                      icon={faPaintbrush}
                      className="about-icon"
                    />
                    Concept art generation
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon icon={faDrum} className="about-icon" />
                    BG music generator, automatic foley
                  </p>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                  <p className="fw-normal card bg-dark-solid pt-5 about-card">
                    <FontAwesomeIcon
                      icon={faClapperboard}
                      className="about-icon"
                    />
                    No more editing. Shots automatically populate the timeline.
                  </p>
                </div>
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
              <h1 className="marquee-title d-flex gap-3 gap-md-4 gap-lg-5">
                <span>What we do</span>
                <span className="text-red">\\</span>
                <span className="text-outline">What we do</span>
                <span className="text-red">\\</span>
                <span>What we do</span>
                <span className="text-red">\\</span>
                <span className="text-outline">What we do</span>
                <span className="text-red me-3 me-md-4 me-lg-5">\\</span>
              </h1>
            </Marquee>
          </div>
          <div className="container pt-10">
            <div className="row gx-5">
              <div className="col-lg-5 text-center text-lg-start">
                <img
                  src="/images/VC-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Voice Changing</h1>
                <h4 className="fw-semibold opacity-75 mb-4">
                  Now you can sound like someone else
                </h4>
                <p className="mt-3">
                  Use offline (studio quality) or real time voice changing to
                  re-dub your film or give your live performers a new character.
                </p>
                <div>
                  <a
                    href="https://fakeyou.com/clone"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Transform my voice</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 pb-5 text-center">
              <h2 className="text-center mt-5 fw-bold">
                <FontAwesomeIcon icon={faMicrophone} className="me-3" />
                Voice Changing Demo
              </h2>
              <p className="mb-4">
                This is still an early beta. Voice quality will change and
                improve substantially over time.
              </p>
              <p className="text-center my-4 pt-5">
                <strong className="fw-semibold fs-5">Brandon</strong>
                <FontAwesomeIcon icon={faArrowRight} className="mx-2" />
                <strong className="fw-semibold fs-5">Donald Trump</strong>
                <br />
                Real time voice to voice conversion.
              </p>
              <div className="row gx-4 gy-4 text-center pb-5">
                <div className="col-12 col-lg-6">
                  <div className="card bg-light-solid justify-content-start">
                    <AudioSample sampleUrl="/audio-samples/voice-conversion-1.mp3" />
                    <p className="mb-0">
                      <em className="fs-6">
                        &ldquo;I've got a huge announcement. This just sounds
                        really, really great. And other than some phase
                        distortion, artifacts, this is just sounding really
                        great. And it's good for America. And voice synthesis is
                        amazing.&rdquo;
                      </em>
                    </p>
                  </div>
                </div>
                <div className="col-12 col-lg-6">
                  <div className="card bg-light-solid justify-content-start">
                    <AudioSample sampleUrl="/audio-samples/voice-conversion-2.mp3" />
                    <p className="mb-0">
                      <em className="fs-6">
                        &ldquo;My favorite game is Super Smash Bros Ultimate.
                        It's a really, really great game. It's huge. There's so
                        many characters.&rdquo;
                      </em>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center position-relative">
              <div className="position-relative zi-2">
                <h2 className="text-center mt-5 fw-bold">
                  Sign up for your very own voice changer
                </h2>
                <p className="mb-4">
                  We'll be rolling this out shortly. Get on the list! Tell us
                  who you want to be.
                </p>
                <div>
                  <a
                    href="https://fakeyou.com/clone"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-3"
                  >
                    <span>Transform my voice</span>
                  </a>
                </div>
              </div>
              <div className="shape-bg"></div>
            </div>
          </div>
        </div>
        <div className="bg-light section-2">
          <div className="container">
            <div className="row gx-5 flex-row-reverse">
              <div className="col-lg-5 text-center text-lg-start">
                <img
                  src="/images/FakeYou-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">FakeYou</h1>
                <h4 className="fw-semibold opacity-75 mb-4">
                  Used by millions of people every month
                </h4>
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
                    <span>Go to FakeYou.com</span>
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-4 text-center">
              <h2 className="text-center mt-5 fw-bold">
                <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
                Try our text to speech!
              </h2>
              <p className="mb-5">
                We have over 2,000 voices (with more added every day), but we've
                selected a few to show off.
              </p>
            </div>
          </div>

          <div className="d-flex flex-column align-items-center container tts-demo pb-5">
            <TtsComponent />
          </div>

          <div className="container text-center position-relative">
            <div className="position-relative zi-2">
              <h2 className="text-center mt-5 fw-bold">Want to hear more?</h2>
              <p className="mb-4">
                Listen to all of the 2,000+ available voices on FakeYou.
              </p>
              <div className="d-flex flex-column flex-md-row gap-3 justify-content-center pt-3">
                <a
                  href="https://fakeyou.com/"
                  rel="noreferrer"
                  target="_blank"
                  className="btn btn-primary"
                >
                  <span>Go to FakeYou.com</span>
                </a>
                <a
                  href="https://fakeyou.com/clone"
                  rel="noreferrer"
                  target="_blank"
                  className="btn btn-secondary"
                >
                  <span>Clone my voice</span>
                </a>
              </div>
            </div>
            <div className="shape-bg dark"></div>
          </div>
        </div>
        <div className="bg-dark section-2">
          <div className="container">
            <div className="row gx-5">
              <div className="col-lg-5 text-center text-lg-start">
                <img
                  src="/images/Stream-img.webp"
                  alt="Storyteller Stream"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller Stream</h1>
                <h4 className="fw-semibold opacity-75 mb-4">
                  Twitch Streamers and Creators can engage and monetize
                </h4>
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

        <div className="bg-light section-2">
          <div className="container">
            <div className="row gx-5 flex-row-reverse">
              <div className="col-lg-5 text-center text-lg-start">
                <img
                  src="/images/Engine-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller Engine</h1>
                <h4 className="fw-semibold opacity-75 mb-4">
                  A fully 3D virtual set for your stream or film
                </h4>
                <p className="mt-3">
                  Our community contributes sets, character models, props,
                  events, and more. Use motion or volumetric capture. Your
                  audience can control everything. Ideal for improv, news casts,
                  interviews, gaming, fast virtual filmmaking, and much more!
                </p>
                <div>
                  <a
                    href={ThirdPartyLinks.FAKEYOU_DISCORD}
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Ask us in Discord</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="row gx-4 gy-4 gx-lg-5 gy-lg-5 mb-5 mt-5">
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <video
                  src="/video/webpage-demo-1-640.mp4"
                  autoPlay={true}
                  playsInline={true}
                  loop={true}
                  muted={true}
                  className="img-fluid img-border"
                ></video>
              </div>
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <div className="card bg-dark-solid align-items-start justify-content-center fs-6 h-auto">
                  <h3 className="pb-3">Volumetric Capture</h3>
                  <p className="mb-0">
                    Use one or more cameras to build a 3D volumetric capture of
                    your actors. In the future, we'll be upscaling from
                    VGA-resolution depth maps to full 4K.
                  </p>
                </div>
              </div>
            </div>

            <div className="row gx-4 gy-4 gx-lg-5 gy-lg-5 flex-row-reverse mb-5">
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <video
                  src="/video/webpage-demo-2-640.mp4"
                  autoPlay={true}
                  playsInline={true}
                  loop={true}
                  muted={true}
                  className="img-fluid img-border"
                ></video>
              </div>
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <div className="card bg-dark-solid align-items-start justify-content-center fs-6 h-auto">
                  <h3 className="pb-3">Motion Capture</h3>
                  <p className="mb-0">
                    Community-contributed models, sets, and scenarios can be
                    controlled with webcam, Kinect, or motion capture systems
                    and directed remotely from the web.
                  </p>
                </div>
              </div>
            </div>

            <div className="row gx-4 gy-4 gx-lg-5 gy-lg-5 pb-5">
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <video
                  src="/video/webpage-demo-3-640.mp4"
                  autoPlay={true}
                  playsInline={true}
                  loop={true}
                  muted={true}
                  className="img-fluid img-border"
                ></video>
              </div>
              <div className="col-12 col-md-6 d-flex flex-column justify-content-center">
                <div className="card bg-dark-solid align-items-start justify-content-center fs-6 h-auto">
                  <h3 className="pb-3">
                    Fake Faces, Voices, and Corrected Motion
                  </h3>
                  <p className="mb-0">
                    We couldn't hire Elon Musk, but that didn't stop us and it
                    won't stop you. Change your actors faces and voices to fit
                    your needs. Tweak their movements and posture &mdash; even
                    the location and lighting &mdash; all post capture.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-5">
              <div className="text-center position-relative">
                <div className="position-relative zi-2 d-flex flex-column align-items-center">
                  <h2 className="text-center fw-bold">
                    Apply for our beta program
                  </h2>
                  <p className="mb-4 mw-text">
                    Are you a streamer or filmmaker? Want to help us test and
                    develop Storyteller Engine into the best tool ever created
                    for making narrative content?
                  </p>
                  <div>
                    <a
                      href={ThirdPartyLinks.FAKEYOU_DISCORD}
                      rel="noreferrer"
                      target="_blank"
                      className="btn btn-primary mt-3"
                    >
                      <span>Ask us in Discord</span>
                    </a>
                  </div>
                </div>
                <div className="shape-bg"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-dark section-2">
          <div className="container">
            <div className="row gx-5">
              <div className="col-lg-5 text-center text-lg-start">
                <img
                  src="/images/VoxelCam-img.webp"
                  alt="FakeYou"
                  className="img-fluid"
                />
              </div>
              <div className="col-lg-7 d-flex flex-column justify-content-center">
                <h1 className="fw-bold display-5">Storyteller VoxelCam</h1>
                <h4 className="fw-semibold opacity-75 mb-4">
                  Volumetric capture for your stream, and for your film set.
                </h4>
                <p className="mt-3">
                  Webcams are boring and flat. You can use our volumetric camera
                  in-stream to make your personality come to life. This system
                  can also be integrated into our no-cinema camera virtual set.
                </p>
                <div>
                  <a
                    href="https://discord.gg/fakeyou"
                    rel="noreferrer"
                    target="_blank"
                    className="btn btn-primary mt-4"
                  >
                    <span>Ask us in Discord</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="container pt-5">
            <h2 className="text-center my-5 fw-bold">
              Volumetric cameras aren't limited to two dimensions
            </h2>

            <div className="rounded overflow-hidden">
              <Scene />
            </div>

            <h2 className="text-center mt-5 pt-5 fw-bold">Screenshots</h2>

            <div className="row gx-4 gy-4 my-4 text-center">
              <div className="col-12 col-sm-4">
                <div>
                  <img
                    className="img-fluid img-border img-hover"
                    src="/screenshots/engine-fuji.png"
                    alt="screenshot"
                  />
                </div>
              </div>

              <div className="col-12 col-sm-4">
                <img
                  className="img-fluid img-border"
                  src="/screenshots/engine-zelda-monsters.png"
                  alt="screenshot"
                />
              </div>

              <div className="col-12 col-sm-4">
                <img
                  className="img-fluid img-border"
                  src="/screenshots/engine-point-cloud.png"
                  alt="screenshot"
                />
              </div>
            </div>
          </div>
        </div>

        <div id="mentions" className="bg-light section-2">
          <div>
            <Marquee gradient={false} speed={120}>
              <h1 className="marquee-title d-flex gap-3 gap-md-4 gap-lg-5 mt-0">
                <span className="text-outline">Press and mentions</span>
                <span className="text-red">\\</span>
                <span>Press and mentions</span>
                <span className="text-red">\\</span>
                <span className="text-outline">Press and mentions</span>
                <span className="text-red">\\</span>
                <span>Press and mentions</span>
                <span className="text-red me-3 me-md-4 me-lg-5">\\</span>
              </h1>
            </Marquee>
          </div>

          <div className="swiper">
            <Swiper
              loop={true}
              autoplay={{
                delay: 6000,
                disableOnInteraction: false,
              }}
              slidesPerView={1.1}
              centeredSlides={true}
              spaceBetween={50}
              grabCursor={true}
              breakpoints={{
                640: {
                  slidesPerView: 1.5,
                  spaceBetween: 10,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 40,
                },
                1024: {
                  slidesPerView: 2.5,
                  spaceBetween: 40,
                },
                1600: {
                  slidesPerView: 4,
                  spaceBetween: 50,
                },
              }}
              pagination={{
                clickable: true,
              }}
              modules={[Autoplay, Pagination]}
            >
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100">
                  <div>
                    <img
                      className="mb-3"
                      src="/press-logos/techstars.png"
                      alt="Techstars Logo"
                      height="34"
                    />
                  </div>

                  <p className="swiper-text">
                    "Tool of the Week: AI voice generator | [FakeYou ...] is a
                    window into the future [...]. Play with it with a number of
                    celebrity voices, including Judi Dench, Neil DeGrasse Tyson,
                    and Bill Gates."
                    <br />
                    <br />— <b>Techstars</b>
                  </p>
                </div>
              </SwiperSlide>
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100 align-items-start">
                  <div>
                    <img
                      className="mb-2"
                      src="/press-logos/gigazine.png"
                      alt="Gigazine Logo"
                      height="40"
                    />
                  </div>

                  <p className="swiper-text">
                    "無料でビル・ゲイツやアーノルド・シュワルツネッガーなど有名人に好きな台詞をしゃべらせることができる「Vocodes」レビュー"
                    <br />
                    <br />
                    ("Vocodes" [now FakeYou] allows users to use celebrities
                    such as Bill Gates and Arnold Schwarzenegger to speak their
                    favorite lines for free.)
                    <br />
                    <br />— <b>Gigazine</b>
                  </p>
                </div>
              </SwiperSlide>
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100">
                  <div>
                    <img
                      className="mb-2"
                      src="/press-logos/shots.png"
                      alt="Shots Logo"
                      height="60"
                    />
                  </div>

                  <p className="swiper-text">
                    "Have you ever wanted David Attenborough to narrate your
                    audiobook? Judi Dench to read your shopping list? Gilbert
                    Gottfried to... well... some things are better left unsaid."
                    <br />
                    <br />— <b>Shots</b>
                  </p>
                </div>
              </SwiperSlide>
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100">
                  <div>
                    <img
                      className="mb-2"
                      src="/press-logos/larepublica.png"
                      alt="La Republica Logo"
                      height="34"
                    />
                  </div>

                  <p className="swiper-text">
                    "Un truco secreto de WhatsApp se acaba de volver tendencia
                    en las redes sociales, sobre todo entre los fanáticos de
                    Dragon Ball Super, debido a que permite que los usuarios
                    puedan enviar audios con la voz de Gokú"
                    <br />
                    <br />
                    (A secret WhatsApp trick has just become a trend on social
                    networks , especially among Dragon Ball Super fans , because
                    it allows users to send audios with the voice of Goku"
                    <br />
                    <br />— <b>La República</b>
                  </p>
                </div>
              </SwiperSlide>
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100">
                  <div>
                    <img
                      className="mb-2"
                      src="/press-logos/tnw.png"
                      alt="TNW Logo"
                      height="40"
                    />
                  </div>

                  <p className="swiper-text">
                    We’ve previously seen apps like this, but Vocodes [now
                    FakeYou] impresses with the sheer volume of voices available
                    to test out.
                    <br />
                    <br />— <b>TheNextWeb</b>
                  </p>
                </div>
              </SwiperSlide>
              <SwiperSlide className="card swiper-card bg-dark-solid">
                <div className="d-flex flex-column gap-4 w-100">
                  <p className="swiper-text">
                    "[Digital artist Glenn Marshall's recent project employs] a
                    classic 19th-century poem as AI-imaging fuel alongside an
                    uncanny narration from an artificial Christopher Lee. To
                    make "In the Bleak Midwinter" even more, uh, bleak, Marshall
                    then employed software called vo.codes [now FakeYou] to
                    approximate a poetic narration in the voice of the late Sir
                    Christopher Lee. [...] to be honest with you, we initially
                    thought Marshall simply dubbed an old audio recording of Lee
                    actually reading the poem, that's how convincing the result
                    is."
                    <br />
                    <br />— <b>Input</b>
                  </p>
                </div>
              </SwiperSlide>
            </Swiper>
          </div>
        </div>

        <div id="contact" className="bg-light section-2">
          <h3 className="text-center fw-bold display-5 mb-5">Contact Us</h3>
          <div id="success_message" className="fw-semibold opacity-75 mb-4 text-center"></div>
          <form id="contact_form" onSubmit={handleSubmit} className="col-12 col-md-6 mx-auto">
            <fieldset className="">
              <input
                id="name"
                type="text"
                name="name"
                placeholder='Name *'
                required
                className="col-12"
              />
              <ValidationError
                prefix="Name"
                field="name"
                errors={state.errors}
              />
              <input
                id="email"
                type="email"
                name="email"
                placeholder='Email *'
                required
                className="col-12 mt-2"
              />
              <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
              />
            </fieldset>
            <fieldset>
              <textarea
                id="message"
                name="message"
                placeholder='Say "hi" here!'
                required
                className="col-12 mt-2"
                cols={40}
                rows={4}
                style={{ resize: 'none' }}
              />
              <ValidationError
                prefix="Message"
                field="message"
                errors={state.errors}
              />
            </fieldset>
            <button type="submit" className="btn btn-primary mt-4 col-12" disabled={state.submitting}>
              Submit
            </button>
            <input type="reset" id="reset" className="d-none" />
          </form>
        </div>
      </div>
    </>
  );
}


export default IndexPage;
