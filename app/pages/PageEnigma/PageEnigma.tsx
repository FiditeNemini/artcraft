import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";

export const PageEnigma = () => {
  return (
    <TrackProvider>
      <PageEnigmaComponent />
    </TrackProvider>
  );
};
