import { TrimmerPlaybarCore } from "./TrimmerPlaybarCore";
import { TrimmingPlaybarLoading } from "./TrimmerPlaybarLoading";
import { TrimData } from "./utilities";
export type { TrimData };
export const TrimmerPlaybar = ({
  vidEl,
  trimData,
  className,
  onTrimChange,
}: {
  vidEl: HTMLVideoElement | undefined;
  className?: string;
  trimData?: TrimData;
  onTrimChange: (trimData: TrimData) => void;
}) => {
  if (!vidEl) {
    return <TrimmingPlaybarLoading />;
  }
  return (
    <TrimmerPlaybarCore
      vidEl={vidEl}
      className={className}
      trimData={trimData}
      onTrimChange={onTrimChange}
    />
  );
};
