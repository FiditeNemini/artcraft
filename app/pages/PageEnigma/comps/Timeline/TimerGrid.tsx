import {
  filmLength,
  fullHeight,
  scale,
  stylizeScrollX,
  timelineScrollX,
} from "~/pages/PageEnigma/store";
import { Fragment } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { Pages } from "~/pages/PageEnigma/constants/page";

interface Props {
  page: Pages;
}
export const TimerGrid = ({ page }: Props) => {
  useSignals();
  const sectionWidth = 60 * 4 * scale.value;
  const scrollX =
    page === Pages.EDIT ? timelineScrollX.value : stylizeScrollX.value;

  return (
    <div
      className={[
        "prevent-select ml-[204px] mt-4",
        "relative flex h-7 overflow-hidden",
        "border-t border-t-ui-panel-border",
        "text-xs text-white opacity-75",
      ].join(" ")}>
      <div className="absolute" style={{ left: scrollX * -1 }}>
        {Array(filmLength.value)
          .fill(0)
          .map((_, index) => (
            <Fragment key={index}>
              <div
                className="absolute ps-1 pt-2"
                style={{ left: index * sectionWidth + 4 }}>
                00:{index < 10 ? "0" + index.toString() : index.toString()}
              </div>
              <div
                className="absolute block bg-ui-divider"
                style={{
                  width: 1,
                  left: index * sectionWidth,
                  height: fullHeight.value,
                }}
              />
              {Array(9)
                .fill(0)
                .map((_, ind) => (
                  <div
                    key={ind}
                    className="absolute block h-2 bg-ui-divider"
                    style={{
                      width: 1,
                      top: 0,
                      left:
                        index * sectionWidth + (sectionWidth / 10) * (ind + 1),
                    }}
                  />
                ))}
            </Fragment>
          ))}
        <div
          className="absolute pt-2"
          style={{ left: filmLength.value * sectionWidth + 4 }}>
          00:
          {filmLength.value < 10
            ? "0" + filmLength.value.toString()
            : filmLength.value.toString()}
        </div>
        <div
          className="absolute block h-full bg-ui-divider"
          style={{
            width: 1,
            left: filmLength.value * sectionWidth,
            height: fullHeight.value,
          }}
        />
      </div>
    </div>
  );
};
