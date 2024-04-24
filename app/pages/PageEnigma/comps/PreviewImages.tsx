import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";
import { useSignals } from "@preact/signals-react/runtime";
import { pageHeight, pageWidth } from "~/store";

export const PreviewImages = () => {
  useSignals();

  const imageWidth1 = pageWidth.value > 1340 ? 630 : (pageWidth.value - 80) / 2;
  const imageHeight1 = imageWidth1 * 0.56;
  const imageHeight2 = pageHeight.value > 1138 ? 354 : pageHeight.value - 650;
  const imageWidth2 = imageHeight2 / 0.56;

  const imageWidth = imageHeight1 < imageHeight2 ? imageWidth1 : imageWidth2;
  const imageHeight = imageHeight1 < imageHeight2 ? imageHeight1 : imageHeight2;

  const textClasses = [
    "flex items-center justify-center",
    "w-full rounded-t-lg bg-ui-controls h-[34px]",
    "text-sm font-semibold",
  ].join(" ");

  return (
    <div className="flex justify-center gap-1">
      <div className="flex flex-col" style={{ width: imageWidth }}>
        <div className={textClasses}>Raw Preview</div>
        <div
          className="block w-full overflow-hidden rounded-b-lg"
          style={{ height: imageHeight }}
        >
          <canvas id="raw-preview" width={imageWidth} height={imageHeight} />
        </div>
      </div>
      <div className="flex w-[40px] flex-col justify-center">
        <FontAwesomeIcon icon={faArrowRight} className="text-3xl opacity-60" />
      </div>
      <div className="flex flex-col" style={{ width: imageWidth }}>
        <div className={textClasses}>Styled Preview</div>
        <div
          className="block w-full overflow-hidden rounded-b-lg"
          style={{ height: imageHeight }}
        >
          <img id="styled-preview" width={imageWidth} height={imageHeight} />
        </div>
      </div>
    </div>
  );
};
