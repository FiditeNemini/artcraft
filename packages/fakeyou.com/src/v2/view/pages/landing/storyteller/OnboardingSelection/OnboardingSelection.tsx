import { Button, Panel } from "components/common";
import Card from "components/common/Card";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useSpring, animated } from "@react-spring/web";
import { faChevronDown, faChevronUp } from "@fortawesome/pro-solid-svg-icons";

interface OnboardingSelectionProps {}

export default function OnboardingSelection(props: OnboardingSelectionProps) {
  const history = useHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  const { maxHeight, opacity, transform } = useSpring({
    maxHeight: isExpanded ? "2000px" : "0px",
    opacity: isExpanded ? 1 : 0,
    transform: isExpanded ? "scale(1)" : "scale(0.9)",
    config: { tension: 170, friction: 26 },
  });

  const toggleVisibility = () => {
    setIsExpanded(!isExpanded);
  };

  const visitUrl = (url: string) => {
    if (url.startsWith("https://")) {
      document.location.href = url;
    } else {
      history.push(url);
    }
  };

  const cards = [
    {
      text: "Ink Dragon",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/n/j/n/a/s/njnasfa5cyvg5kf8vq17pmc5c4gpyj7z/videonjnasfa5cyvg5kf8vq17pmc5c4gpyj7zmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/q/a/q/m/h/qaqmhyqv203a5e8kep2nat2yft57ghdg/upload_qaqmhyqv203a5e8kep2nat2yft57ghdg.mp4",
      url: "https://studio.storyteller.ai/m_9pf7a7v0138zx58f4x6ejsehjcvfq6",
    },
    {
      text: "Dancing Girl",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/k/h/3/7/b/kh37b0v1jcsg800rmh52vh1k8xcgkr2x/videokh37b0v1jcsg800rmh52vh1k8xcgkr2xmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/9/1/m/g/s/91mgssbfngm5y5bdr8kfex228b7dmxc4/upload_91mgssbfngm5y5bdr8kfex228b7dmxc4.mp4",
      url: "https://studio.storyteller.ai/m_nmzvdqr6kr8eqpmxqdzkqj0yknrjwv",
    },
    {
      text: "Home Office",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/f/g/s/d/m/fgsdm4v1mv2nqd5y1y6an46zmj4sx5vt/videofgsdm4v1mv2nqd5y1y6an46zmj4sx5vtmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/2/1/t/v/e/21tvezwdmevrqdmd3zttspykenktepx4/21tvezwdmevrqdmd3zttspykenktepx4.mp4",
      url: "/studio-intro/m_7m8qvhmr55w4d7c31a7f4yjdtm22ww",
    },
    {
      text: "Best Friends",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/3/n/m/9/c/3nm9car0x6af035663ervxq2qagdw8rk/video3nm9car0x6af035663ervxq2qagdw8rkmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/e/t/3/d/6/et3d68wkewppwmgw5kadmes8yr8whe2z/et3d68wkewppwmgw5kadmes8yr8whe2z.mp4",
      url: "/studio-intro/m_th523rg3tvax5rceys7s97jgrbbm11",
    },
    {
      text: "Desert Fox",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/a/p/j/b/q/apjbqp06we4xf51aaqt4rhb7bpvdg90p/videoapjbqp06we4xf51aaqt4rhb7bpvdg90pmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/w/n/5/7/4/wn574b0qqy64xymthbk0y806czmmn0jx/wn574b0qqy64xymthbk0y806czmmn0jx.mp4",
      url: "/studio-intro/m_dzsxjjjyx18k3x2rsys5zkm94x73kt",
    },
    {
      text: "Castle Airship",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/v/e/c/3/c/vec3cwk00xvrafv7rgvhfvbhqtm72pr7/videovec3cwk00xvrafv7rgvhfvbhqtm72pr7mp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/q/h/h/r/f/qhhrf4tddye8jpfrz030ja425nkxymr3/qhhrf4tddye8jpfrz030ja425nkxymr3.mp4",
      url: "/studio-intro/m_n6rxmbn7abz29vmcecrkrgytxw55kr",
    },
    {
      text: "Forest Friends",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/k/v/r/0/w/kvr0wsw87gmkx6psfp73v34behs2vd34/videokvr0wsw87gmkx6psfp73v34behs2vd34mp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/g/1/s/n/d/g1snde1192qbe3nctpa3p0f2xhgrdjkm/g1snde1192qbe3nctpa3p0f2xhgrdjkm.mp4",
      url: "/studio-intro/m_qnvcv073za8b5y23fra4vbt8cea2c3",
    },
    {
      text: "Pirate Island",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/4/d/a/q/1/4daq1tz77rahrr5kt8wa45y6z93hy6fd/video4daq1tz77rahrr5kt8wa45y6z93hy6fdmp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/9/9/g/c/f/99gcfq21cafy6frtp1afdff11f45sm1w/99gcfq21cafy6frtp1afdff11f45sm1w.mp4",
      url: "/studio-intro/m_m5vgpxd99dak30t1cw4dsaj4jarhvt",
    },
    {
      text: "Forest Fox",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/8/w/5/w/0/8w5w0hs5pfxqbyqpqrzkn93wyqkszb27/video8w5w0hs5pfxqbyqpqrzkn93wyqkszb27mp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/k/4/y/w/k/k4ywk99n773aj1s2y2p6f74mqy6j4p9m/k4ywk99n773aj1s2y2p6f74mqy6j4p9m.mp4",
      url: "/studio-intro/m_t0x2avjrv11zkrcbp0tjmqbg9dpk0k",
    },
    {
      text: "Dragon Concert",
      defaultVideo:
        "https://storage.googleapis.com/vocodes-public/media/v/3/v/a/c/v3vacb5910g6vfhjc2aemjghshpq2fs8/videov3vacb5910g6vfhjc2aemjghshpq2fs8mp4",
      hoverVideo:
        "https://storage.googleapis.com/vocodes-public/media/a/0/p/5/a/a0p5a0dc021qam59e0pxjtg9sk59mcg2/a0p5a0dc021qam59e0pxjtg9sk59mcg2.mp4",
      url: "/studio-intro/m_qsjwkd8ap8mnvskm0dqbf9ewk8dg4m",
    },
  ];

  // DEV CARDS
  const devCards = [
    {
      text: "Room",
      backgroundImage: "/images/landing/onboarding/room-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_ejhs95fc5aybp36h4a79k7523ds6an");
      },
    },
    {
      text: "Pirate Island",
      backgroundImage:
        "/images/landing/onboarding/pirate-island-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_2k10f2sdhcj549rk00053e96mentn0");
      },
    },
    {
      text: "Spaceship",
      backgroundImage:
        "/images/landing/onboarding/spaceship-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_1mnebqs5twsqsbx4zkyq0ve7mk69ph");
      },
    },
    {
      text: "Hanashi",
      backgroundImage:
        "/images/landing/onboarding/hanashi-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_pjb8x09pve8f7dd8pqgjk4ezaryjxs");
      },
    },
    {
      text: "Seldon",
      backgroundImage: "/images/landing/onboarding/seldon.png",
      onClick: () => {
        history.push("/studio-intro/m_aeda8feh6ezdftm4d1bhevehtdk8ek");
      },
    },
    {
      text: "Pop",
      backgroundImage: "/images/landing/onboarding/pop.png",
      onClick: () => {
        history.push("/studio-intro/m_4gsy6j9406ynmzx865267qry55stqm");
      },
    },
    {
      text: "Human Male",
      backgroundImage: "/images/landing/onboarding/human_male.png",
      onClick: () => {
        history.push("/studio-intro/m_jv7efyf4zg2sjhgyxdfqv5v7vrh8jj");
      },
    },
    {
      text: "Human Female",
      backgroundImage: "/images/landing/onboarding/human_female.png",
      onClick: () => {
        history.push("/studio-intro/m_r33zjfc65yd2nwtdm9p5m8k799c4q4");
      },
    },
    {
      text: "Castle",
      backgroundImage: "/images/landing/onboarding/castle-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_3dejb87nmpee0k411hcncz0ew6zr81");
      },
    },
    {
      text: "Space War",
      backgroundImage:
        "/images/landing/onboarding/space-war-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_f320w1e8b93p5xj2fw19px5zzqh2zh");
      },
    },
    {
      text: "Simple Room",
      backgroundImage:
        "/images/landing/onboarding/simple-room-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_ectv9gkx33ccve3vhxbnccntn0dxa8");
      },
    },
    {
      text: "Alphabet",
      backgroundImage:
        "/images/landing/onboarding/alphabet-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_xtvacqsg5yyw7pv81ky7zz04w32vte");
      },
    },
  ];

  return (
    <Panel clear={true}>
      <div className="text-center my-5 pb-5">
        <h1 className="fw-bold">Make Your Movie</h1>
        <p className="opacity-75">
          It's easy! We've already built some scenes for you to try.
        </p>
        <div className="row gy-3 gx-3 gx-lg-4 mt-3 centered-row">
          {cards.slice(0, 4).map((card, index) => (
            <div className="col-6 col-lg-3" key={index}>
              <Card
                backgroundVideo={card.defaultVideo}
                backgroundVideoHover={card.hoverVideo}
                aspectRatio="16/9"
                canHover={true}
                borderWidth="2px"
                hoverPrimaryColor={true}
                onClick={() => {
                  visitUrl(card.url);
                }}
                bottomText={card.text}
              />
            </div>
          ))}
        </div>
        <animated.div
          style={{ overflow: "hidden", maxHeight, opacity, transform }}
        >
          <div className="row gy-3 gx-3 gx-lg-4 mt-0 centered-row">
            {cards.slice(4).map((card, index) => (
              <div className="col-6 col-lg-3" key={index}>
                <Card
                  backgroundVideo={card.defaultVideo}
                  backgroundVideoHover={card.hoverVideo}
                  aspectRatio="16/9"
                  canHover={true}
                  borderWidth="2px"
                  hoverPrimaryColor={true}
                  onClick={() => {
                    visitUrl(card.url);
                  }}
                  bottomText={card.text}
                />
              </div>
            ))}
          </div>
          <hr className="my-5" />
          <h4>Developer Scenes</h4>
          <p>
            These scenes work, but you'll have to build your own animation
            timeline.
          </p>
          <div className="row gy-3 gx-3 gx-lg-4 mt-0 centered-row">
            {devCards.map((card, index) => (
              <div className="col-6 col-lg-3" key={index}>
                <Card
                  backgroundImage={card.backgroundImage}
                  aspectRatio="16/9"
                  canHover={true}
                  borderWidth="2px"
                  hoverPrimaryColor={true}
                  onClick={card.onClick}
                  bottomText={card.text}
                />
              </div>
            ))}
          </div>
        </animated.div>
        <div className="d-flex justify-content-center mt-4">
          <Button
            onClick={toggleVisibility}
            label={isExpanded ? "Show less examples" : "Show more examples"}
            small={true}
            icon={isExpanded ? faChevronUp : faChevronDown}
            iconFlip={true}
            variant="secondary"
            className="opacity-50"
          />
        </div>
      </div>
    </Panel>
  );
}
