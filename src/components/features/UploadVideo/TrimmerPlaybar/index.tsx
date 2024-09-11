import { TrimmerPlaybarCore } from "./TrimmerPlaybarCore";
import { TrimmingPlaybarLoading } from "./TrimmerPlaybarLoading";

export const TrimmerPlaybar = ({
  vidEl,
  className,
}: {
  vidEl: HTMLVideoElement | undefined;
  className?: string;
}) => {
  if (!vidEl) {
    return <TrimmingPlaybarLoading />;
  }
  return <TrimmerPlaybarCore vidEl={vidEl} className={className} />;
};
