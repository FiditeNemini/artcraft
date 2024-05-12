// Grid.tsx
import React from "react";
import "./PrelaunchLanding.scss";

const PrelaunchLanding: React.FC = () => {
  const totalGrids = 30;
  const blankGrids = [13, 14, 15, 19, 20];

  const renderGridItems = () => {
    const gridItems = [];
    for (let i = 1; i <= totalGrids; i++) {
      const isBlank = blankGrids.includes(i);
      gridItems.push(
        <div key={i} className={`grid-item ${isBlank ? "blank" : ""}`}>
          {!isBlank ? (
            <img src="/images/dummy-image.jpg" className="w-100 h-100" />
          ) : null}
        </div>
      );
    }
    return gridItems;
  };

  return (
    <div className="grid-container">
      {renderGridItems()}

      <img className="logo" src="/fakeyou/Storyteller-Logo-1.png" />

      <button className="waitlist-button">Join the Waitlist</button>
    </div>
  );
};

export default PrelaunchLanding;
