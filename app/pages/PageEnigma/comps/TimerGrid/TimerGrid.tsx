import { filmLength, fullHeight, scale } from "~/pages/PageEnigma/store";
import { Fragment } from "react";

export const TimerGrid = () => {
  const sectionWidth = 60 * 4 * scale.value;

  return (
    <div
      className={[
        "prevent-select mt-4",
        "flex h-3",
        "border-t border-t-ui-panel-border",
        "text-xs text-white opacity-75",
      ].join(" ")}
    >
      {Array(filmLength.value)
        .fill(0)
        .map((_, index) => (
          <Fragment key={index}>
            <div
              className="absolute ps-1 pt-1"
              style={{ left: index * sectionWidth + 92 }}
            >
              00:{index < 10 ? "0" + index.toString() : index.toString()}
            </div>
            <div
              className="absolute block h-full bg-ui-divider"
              style={{
                width: 1,
                left: index * sectionWidth + 88,
                height: fullHeight.value,
              }}
            />
          </Fragment>
        ))}
      <div
        className="absolute"
        style={{ left: filmLength.value * sectionWidth + 92 }}
      >
        00:
        {filmLength.value < 10
          ? "0" + filmLength.value.toString()
          : filmLength.value.toString()}
      </div>
      <div
        className="absolute block h-full bg-ui-divider"
        style={{
          width: 1,
          left: filmLength.value * sectionWidth + 88,
          height: fullHeight.value,
        }}
      />
    </div>
  );
};
