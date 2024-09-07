import { useCallback } from "react";
import { twMerge } from "tailwind-merge";
import { withProtectionRoute } from "~/components/hoc";
import { useRenderCounter } from "~/hooks/useRenderCounter";

// Components of the page
import { ToolbarUserProfile, ErrorDialog } from "~/components/features";

// Components of the Konva App are all in the KonvaContainer
import { KonvaContainer } from "~/KonvaContainer";

// The KonvaApp is the root of the Konva stage
// and only entry point for anything in Konva JS
import { KonvaApp } from "~/KonvaApp";

export const Main = withProtectionRoute(() => {
  // This is a hook that will log the number of times the component has rerendered
  // Let's make sure we only log once
  useRenderCounter("Pages/Main");
  const konvaContainerCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      KonvaApp(node);
    }
  }, []);

  return (
    <div className="fixed grid h-full w-full grid-cols-12 grid-rows-12">
      <KonvaContainer
        ref={konvaContainerCallbackRef}
        className="col-span-12 col-start-1 row-span-12 row-start-1"
      />
      <div
        className={twMerge(
          "col-span-8 col-start-5 row-span-1 row-start-1 flex justify-end",
          "md:col-span-6 md:col-start-7",
          "lg:col-span-3 lg:col-start-10",
        )}
      >
        <ToolbarUserProfile />
        <ErrorDialog />
      </div>
    </div>
  );
});
