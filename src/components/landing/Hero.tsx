import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "../ui";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const Hero = () => {
  return (
    <div className="dotted-pattern relative min-h-screen overflow-hidden">
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Creative beta badge */}
          <div className="group mb-12 inline-flex cursor-pointer items-center rounded-full bg-black/5 px-6 py-2 backdrop-blur-sm transition-colors hover:bg-black/10">
            <div className="animate-pulse">
              <FontAwesomeIcon
                icon={faDiscord}
                className="text-rose-500 mr-2 h-4 w-4"
              />
            </div>
            <span className="bg-clip-text text-sm font-medium">
              Join our Creators Community
            </span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            />
          </div>

          {/* Dynamic heading */}
          <h1 className="mb-8 text-6xl font-bold tracking-tight sm:text-7xl">
            {/* <span className="inline-block transform cursor-default transition-transform hover:scale-105">
              Compose.
            </span>{" "} */}
            <span className="inline-block transform cursor-default transition-transform hover:-rotate-3">
              Storyteller
            </span>{" "}
            <span className="relative inline-block">
              <span className="gradient-text">Board</span>
            </span>
          </h1>

          {/* Interactive feature pills */}
          <div className="mb-12 flex flex-wrap justify-center gap-4">
            {[
              { text: "Canvas Compositing", icon: "🎬" },
              { text: "Smart Segmentation", icon: "✂️" },
              { text: "AI Stylization", icon: "🎨" },
            ].map(({ text, icon }) => (
              <div
                key={text}
                className="group flex transform cursor-pointer items-center space-x-2 rounded-full bg-gray-100/50 px-5 py-2 backdrop-blur-sm transition-all hover:scale-105"
              >
                <span className="text-lg group-hover:animate-bounce">
                  {icon}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {text}
                </span>
              </div>
            ))}
          </div>

          {/* Creative description */}
          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-gray-600">
            Create stunning visual stories on our intelligent canvas.
            <span className="font-semibold text-gray-800">
              {" "}
              Compose scenes, remove backgrounds, apply AI styles
            </span>{" "}
            and render beautiful movies in minutes.
          </p>

          {/* Playful CTA */}
          <div className="mb-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Button className="group relative overflow-hidden rounded-xl px-8 py-4 text-lg text-white">
              <div className="from-rose-500 absolute inset-0 bg-gradient-to-r via-purple-500 to-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative flex items-center">
                Start Creating
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Button>
          </div>

          {/* Video showcase */}
          <div className="group relative mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-2xl bg-black/10 shadow-2xl">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              >
                <source
                  src="https://cdn.coverr.co/videos/coverr-typing-on-computer-2401/1080p.mp4"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
