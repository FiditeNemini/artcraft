import type { MetaFunction } from "@remix-run/deno";
import { TopBarHelmet } from "~/modules/TopBarHelmet";

import sonic from "./_assets/sonic-the-hedgehog-classic-sonic.gif";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { pageHeight, pageWidth } from "~/store";
import { sidePanelWidth, timelineHeight } from "~/pages/PageEnigma/store";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Sonic() {
  return (
    <div className="size-full">
      <TopBarHelmet>{null}</TopBarHelmet>
      <img
        alt="sonic"
        src={sonic}
        className="
          fixed
          left-0 top-0
          -z-10 h-screen
          w-screen
          object-cover
        "
      />
    </div>
  );
}
