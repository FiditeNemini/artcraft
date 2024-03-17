import React, { useState, useRef, useEffect } from "react";
import "./SelectionBubblesV2.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/pro-solid-svg-icons";

interface Option {
  label: string;
  imageUrl?: string;
  token?: string;
  [key: string]: any;
}

interface SelectionBubbleProps {
  options: Option[];
  onSelect: (selected: any) => void;
  selectedStyle?: "outline" | "fill";
  mobileSideScroll?: boolean;
  variant?: "default" | "card";
}

export default function SelectionBubblesV2({
  options,
  onSelect,
  selectedStyle = "outline",
  mobileSideScroll = false,
  variant = "default",
}: SelectionBubbleProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options.length > 0 ? options[0].label : null
  );
  const [showGradient, setShowGradient] = useState(true);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const bubblesRef = useRef<HTMLDivElement>(null);

  const handleSelect = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    optionLabel: string
  ) => {
    event?.preventDefault();
    setSelectedOption(optionLabel);
    onSelect(optionLabel);
  };

  const handleScroll = () => {
    if (bubblesRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = bubblesRef.current;
      const isAtEnd = scrollWidth - Math.round(scrollLeft + clientWidth) <= 1;
      const isAtStart = scrollLeft <= 1;
      const isMobile = window.innerWidth <= 768;
      setShowGradient(!isAtEnd && isMobile);
      setShowLeftGradient(!isAtStart && isMobile);
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
    const handleResize = () => handleScroll();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (options.length > 0 && selectedOption !== null) {
      onSelect(options[0].label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`selection-bubbles-wrapper ${
        showGradient && mobileSideScroll ? "show-gradient" : ""
      } ${
        showLeftGradient && mobileSideScroll ? "show-left-gradient" : ""
      }`.trim()}
    >
      {showLeftGradient && mobileSideScroll && (
        <FontAwesomeIcon
          icon={faChevronLeft}
          className="scroll-indicator-left fs-5"
        />
      )}
      <div
        className={`selection-bubbles ${
          !mobileSideScroll ? "no-side-scroll" : ""
        }`.trim()}
        ref={bubblesRef}
      >
        {variant === "default" ? (
          <>
            {options.map(({ label }, key) => (
              <button
                key={key}
                className={`bubble-button ${
                  selectedOption === label
                    ? `selected ${selectedStyle === "fill" ? "fill" : ""}`
                    : ""
                }`.trim()}
                onClick={event => handleSelect(event, label)}
              >
                {label}
              </button>
            ))}
          </>
        ) : (
          <div className="w-100">
            <div
              className={`row g-2 ${
                mobileSideScroll ? "mobile-flex-nowrap" : ""
              }`}
            >
              {options.map(({ label, imageUrl }, key) => (
                <div className="col-4 col-lg-3" key={key}>
                  <button
                    className={`bubble-button ${
                      selectedOption === label
                        ? `selected ${selectedStyle === "fill" ? "fill" : ""}`
                        : ""
                    } ${variant === "card" ? "bubble-card" : ""}`.trim()}
                    onClick={event => handleSelect(event, label)}
                  >
                    {variant === "card" && imageUrl && (
                      <img
                        src={imageUrl}
                        alt={label}
                        className="bubble-image"
                        draggable="false"
                      />
                    )}
                    <span className="bubble-text">{label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {showGradient && mobileSideScroll && (
        <FontAwesomeIcon
          icon={faChevronRight}
          className="scroll-indicator fs-5"
        />
      )}
    </div>
  );
}
