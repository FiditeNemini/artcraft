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
        history.push("/studio-intro/m_0tmgwem7x4k47w4cq96ja8psnvnaw5");
      },
    },
    {
      text: "Spaceship",
      backgroundImage:
        "/images/landing/onboarding/spaceship-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_16cc8b0dtp5fmjgb3yh85hnxyd695c");
      },
    },
    {
      text: "Hanashi",
      backgroundImage:
        "/images/landing/onboarding/hanashi-scene-thumbnail.webp",
      onClick: () => {
        history.push("/studio-intro/m_r4025m9dq0hppqzh8t6tmpmxv47yyv");
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
