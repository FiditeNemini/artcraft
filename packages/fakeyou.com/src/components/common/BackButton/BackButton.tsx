import React from "react";
import Button from "../Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/pro-solid-svg-icons";

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      window.history.back();
    }
  };

  return (
    <Button
      icon={faArrowLeft}
      label="Back"
      variant="link"
      onClick={handleBack}
    />
  );
};

export default BackButton;
