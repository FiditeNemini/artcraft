import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { withProtectionRoute } from "~/components/hoc";
import { useRenderCounter } from "~/hooks/useRenderCounter";

// Components
import {
  ProfileDropdown,
  KonaContainer,
  ToolbarMain,
} from "~/components/features";

// The KonvaApp is the root of the Konva stage
// and only entry point for anything Konva
import { KonvaApp } from "~/KonvaApp";

export const Main = withProtectionRoute(() => {
  // This is a hook that will log the number of times the component has rerendered
  // Let's make sure we only log once
  useRenderCounter("Pages/Main");

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
      <ToolbarMain />
    </div>
  );
});
