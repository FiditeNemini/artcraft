import React, { useState } from "react";
import { Button, MocapInput, TempInput } from "components/common";
import "./EngineCompositor.scss"

interface Props {
  value?: any;
}

export default function EngineCompositor({ value }: Props) {
  const [mediaToken,mediaTokenSet] = useState();
  const onChange = ({ target }: any) => mediaTokenSet(target.value);

  console.log("🪼",mediaToken);

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>Engine Compositor</h2>
        <Button {...{ label: "Enqueue", variant: "primary" }}/>
      </header>
      <div {...{ className: "compositor-content" }}>
        <div>
          <MocapInput {...{ label: "Choose 3D data", onChange, type: "bvh" }}/>
        </div>
        <div>
          <TempInput {...{ label: "Title", placeholder: "Enter a title" }}/>
        </div>
      </div>
    </div>
  </div>;
};