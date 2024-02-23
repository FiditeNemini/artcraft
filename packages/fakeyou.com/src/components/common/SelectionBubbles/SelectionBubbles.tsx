import React, { useEffect, useRef, useState } from "react";
import "./SelectionBubbles.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";

interface SelectionBubbleProps {
  options: string[];
  onSelect: (selected: string) => void;
}

export default function SelectionBubbles({
  options,
  onSelect,
}: SelectionBubbleProps) {
  //Select first one as defaults
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options.length > 0 ? options[0] : null
  );
  const [showGradient, setShowGradient] = useState(true);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const bubblesRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    event: React.MouseEvent<HTMLButtonElement>,
    option: string
  ) => {
    event.preventDefault();
    setSelectedOption(option);
    onSelect(option);
  };

  useEffect(() => {
    if (selectedOption) {
      onSelect(selectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (bubblesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = bubblesRef.current;
      const isAtEnd = scrollWidth - Math.round(scrollLeft + clientWidth) <= 1;
      const isAtStart = scrollLeft <= 1;
      setShowGradient(!isAtEnd);
      setShowLeftGradient(!isAtStart);
    }
  };

  useEffect(() => {
    if (bubblesRef.current) {
      bubblesRef.current.addEventListener("scroll", handleScroll);
      handleScroll();
      return () =>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        bubblesRef.current?.removeEventListener("scroll", handleScroll);
    }
  }, [options]);

  useEffect(() => {
    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`selection-bubbles-wrapper ${
        showGradient ? "show-gradient" : ""
      } ${showLeftGradient ? "show-left-gradient" : ""}`.trim()}
    >
      {showLeftGradient && (
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="scroll-indicator-left fs-5"
        />
      )}
      <div className="selection-bubbles" ref={bubblesRef}>
        {options.map(option => (
          <button
            key={option}
            className={`bubble-button ${
              selectedOption === option ? "selected" : ""
            }`}
            onClick={event => handleSelect(event, option)}
          >
            {option}
          </button>
        ))}
      </div>
      {showGradient && (
        <FontAwesomeIcon
          icon={faChevronRight}
          className="scroll-indicator fs-5"
        />
      )}
    </div>
  );
}
