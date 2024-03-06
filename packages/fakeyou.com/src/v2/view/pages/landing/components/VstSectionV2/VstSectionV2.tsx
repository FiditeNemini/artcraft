import { Panel } from "components/common";
import React from "react";

interface VstSectionV2Props {}

export default function VstSectionV2(props: VstSectionV2Props) {
  return (
    <Panel clear={true}>
      <div className="d-flex">
        <div>
          <div className="ratio"></div>
        </div>
        <div>Column 1</div>
        <div>Column 1</div>
      </div>
    </Panel>
  );
}
