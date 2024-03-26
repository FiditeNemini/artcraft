import { ClipProvider } from "~/contexts/ClipContext/ClipProvider";
import { PageEnigmaComponent } from "./PageEnigmaComponent";

export const PageEnigma = () => {
  return (
    <ClipProvider>
      <PageEnigmaComponent />
    </ClipProvider>
  );
};
