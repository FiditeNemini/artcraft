import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/contexts/TrackContext/TrackProvider";

export const PageEnigma = () => {
  return (
    <TrackProvider>
      <PageEnigmaComponent />
    </TrackProvider>
  );
};
