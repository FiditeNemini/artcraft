import Button from "components/common/Button/Button";
import React from "react";

function Complete() {
  return (
    <div className="d-flex flex-column gap-3 align-items-center">
      <div className="d-flex gap-3">
        <Button label="Use Voice" />
        <Button label="Create another voice" variant="secondary" />
      </div>
      <Button label="My Voices" variant="link" />
    </div>
  );
}

export { Complete };
