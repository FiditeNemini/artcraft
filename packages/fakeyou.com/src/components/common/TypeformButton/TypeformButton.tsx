import React from "react";
import { PopupButton } from "@typeform/embed-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faPartyHorn } from "@fortawesome/pro-solid-svg-icons";
import { get, set } from "local-storage";
import Button from "../Button";

interface TypeformButtonProps {
  formId: string;
  label: string;
  labelSubmitted: string;
}

export default function TypeformButton({
  formId,
  label,
  labelSubmitted,
}: TypeformButtonProps) {
  return (
    <>
      {!get<boolean>("isSubmit") ? (
        <PopupButton
          id={formId}
          className="button button-primary button-small"
          onSubmit={() => {
            set<boolean>("isSubmit", true);
            console.log("Form submitted!");
          }}
        >
          {label}
          <FontAwesomeIcon icon={faArrowRight} className="ms-2" />
        </PopupButton>
      ) : (
        <Button
          label={labelSubmitted}
          small={true}
          disabled={true}
          variant="secondary"
          icon={faPartyHorn}
        />
      )}
    </>
  );
}
