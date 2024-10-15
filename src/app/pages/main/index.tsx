import { useParams } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { withProtectionRoute } from "~/components/hoc";
import { useRenderCounter } from "~/hooks/useRenderCounter";

// Components of the page
import { ToolbarUserProfile } from "~/components/features";

//Components of the Konva App are all in the KonvaComponent
import { KonvaRootComponent } from "~/KonvaRootComponent";

export const Main = withProtectionRoute(() => {
  // This is a hook that will log the number of times the component has rerendered
  // Let's make sure we only log once
  useRenderCounter("Pages/Main");
  let { sceneToken } = useParams();
  if (import.meta.env.DEV && sceneToken === "debug") {
    sceneToken = "m_p8nkry6m5j22w586xyex0w4a4pznbx";
  }
  return (
    <div className="fixed grid h-full w-full grid-cols-12 grid-rows-12">
      <KonvaRootComponent
        sceneToken={sceneToken}
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
      </div>
    </div>
  );
});
