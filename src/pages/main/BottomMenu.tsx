import { useSignals } from "@preact/signals-react/runtime";
import { layout } from "~/signals";
export const BottomMenu = () => {
  useSignals();
  const {
    signals: { isMobile, windowWidth, windowHeight },
  } = layout;
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <p>If you need to put buttons somewhere, this could be the spot.</p>
      <p>
        Layout is {windowWidth.value} x {windowHeight.value},{" "}
        <b>{isMobile.value ? "Mobile" : "Not Mobile"}</b>
      </p>
    </div>
  );
};
