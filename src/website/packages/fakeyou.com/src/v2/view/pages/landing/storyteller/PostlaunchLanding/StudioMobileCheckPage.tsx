import { DeviceNotSupported } from "components/common";
import React from "react";

export const StudioMobileCheckPage = () => {
  return (
    <div className="mt-5">
      <DeviceNotSupported
        showRemixScenes={false}
        showVST={true}
        showButton={false}
      />
    </div>
  );
};
