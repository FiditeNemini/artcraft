import { Panel } from "components/common";
import Card from "components/common/Card";
import React from "react";
import { useHistory } from "react-router-dom";

interface OnboardingSelectionProps {}

export default function OnboardingSelection(props: OnboardingSelectionProps) {
  const history = useHistory();

  const cards = [
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
  ];

  return (
    <Panel clear={true}>
      <div className="text-center my-5 pb-5">
        <h1 className="fw-bold">Explore scene examples</h1>
        <p className="opacity-75">
          Try generating a movie by clicking a scene below
        </p>
        <div className="row g-3 g-lg-4 mt-3 centered-row">
          {cards.map((card, index) => (
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
      </div>
    </Panel>
  );
}
