import { useCallback, useRef } from "react";
import { twMerge } from "tailwind-merge";
// import { useSignals } from "@preact/signals-react/runtime";
import { withProtectionRoute } from "~/components/hoc";
// import { authentication } from "~/signals";

import {
  //PanelRight,
  PanelBottom,
} from "~/components/ui";
import { ProfileDropdown, KonaContainer } from "~/components/features";

import { KonvaApp } from "~/KonvaApp";

import { BottomMenu } from "./BottomMenu";

export const Main = withProtectionRoute(() => {
  // useSignals();
  const MainPageRerenderCount = useRef(0);
  MainPageRerenderCount.current++;
  if (MainPageRerenderCount.current === 1) {
    console.log(`Main page rerendered ${MainPageRerenderCount.current} times`);
  } else {
    console.warn(`Main page rerendered ${MainPageRerenderCount.current} times`);
  }
  // const {
  //   signals: { userInfo },
  //   fetchers: { logout },
  // } = authentication;

  const konaContainerCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      KonvaApp(node);
    }
  }, []);

  return (
    <div className="fixed grid h-full w-full grid-cols-12 grid-rows-12">
      <KonaContainer
        ref={konaContainerCallbackRef}
        className="col-span-12 col-start-1 row-span-12 row-start-1"
      />
      <div
        className={twMerge(
          "col-span-8 col-start-5 row-span-1 row-start-1",
          "md:col-span-6 md:col-start-7",
          "lg:col-span-3 lg:col-start-10",
        )}
      >
        <div className="flex items-center justify-end gap-4 pr-4 pt-2">
          <div className="w-1/2">
            <img src="/brand/Storyteller-Logo.png" alt="Storyteller Logo" />
          </div>
          <ProfileDropdown />
        </div>
      </div>
      {/* <PanelRight>
        <div className="flex items-center gap-4">
          <div className="w-1/2">
            <img src="/brand/Storyteller-Logo.png" alt="Storyteller Logo" />
          </div>
          <span className="grow" />
          <ProfileDropdown />
        </div>
        <hr className="my-2 border-ui-divider" />
        <p>you are logged in as {userInfo.value?.display_name}</p>
        <button onClick={() => logout()}>Logout</button>
      </PanelRight> */}
      <PanelBottom>
        <BottomMenu />
      </PanelBottom>
    </div>
  );
});
