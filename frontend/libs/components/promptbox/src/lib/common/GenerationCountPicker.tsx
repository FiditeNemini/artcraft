import { faCopy, faCrown } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PopoverMenu, PopoverItem } from "@storyteller/ui-popover";
import { Tooltip } from "@storyteller/ui-tooltip";
import { ImageModel } from "@storyteller/model-list";

const DEFAULT_GENERATION_COUNT: number = 4;

interface GenerationCountPickerProps {
  currentModel?: ImageModel;
  currentCount: number;
  handleCountChange: (count: number) => void;
  isFreeUser?: boolean;
}

export const GenerationCountPicker = ({
  currentModel,
  currentCount,
  handleCountChange,
  isFreeUser = false,
}: GenerationCountPickerProps) => {
  const maxGenerationCount =
    currentModel?.maxGenerationCount || DEFAULT_GENERATION_COUNT;
  const hasPredefinedOptions = !!currentModel?.predefinedGenerationCounts;
  const isNanoBananaPro = currentModel?.id === "nano_banana_pro";
  const shouldLimitGenerations = isFreeUser && isNanoBananaPro;

  let generationCountOptions: PopoverItem[];

  // Free users on Nano Banana Pro are limited to 1 generation at a time
  if (shouldLimitGenerations) {
    generationCountOptions = [{ label: "1", selected: true }];
  } else if (hasPredefinedOptions) {
    // Count pickers either have a "[1,2, ... max]" set of options, or a pre-defined list of options.
    generationCountOptions = buildPredefinedCountOptions(
      currentModel?.predefinedGenerationCounts || [],
      currentCount,
    );
  } else {
    generationCountOptions = buildSequentialCountOptions(
      maxGenerationCount,
      currentCount,
    );
  }

  const onSelect = (item: PopoverItem) => {
    let count = parseInt(item.label, 10);
    if (isNaN(count)) {
      return;
    }
    if (count < 1 || count > maxGenerationCount) {
      // Clamp to valid range
      count = Math.min(Math.max(1, count), maxGenerationCount);
    }
    handleCountChange(count);
  };

  // Tooltip content changes based on subscription status (only for Nano Banana Pro)
  const tooltipContent = shouldLimitGenerations ? (
    <div className="flex flex-col gap-1 max-w-[200px]">
      <div className="flex items-center gap-1.5 font-medium">
        <FontAwesomeIcon icon={faCrown} className="h-3 w-3 text-yellow-400" />
        <span>Generate more images</span>
      </div>
      <p className="text-xs text-base-fg/70">
        Subscribe to ArtCraft to generate multiple images at once.
      </p>
    </div>
  ) : (
    "Number of generations"
  );

  return (
    <>
      <Tooltip
        content={tooltipContent}
        position="top"
        className="z-50"
        closeOnClick={true}
        delay={0}
      >
        <PopoverMenu
          items={generationCountOptions}
          onSelect={onSelect}
          mode="toggle"
          panelTitle="No. of images"
          triggerIcon={<FontAwesomeIcon icon={faCopy} className="h-4 w-4" />}
          buttonClassName="h-9"
        />
      </Tooltip>
    </>
  );
};

const buildSequentialCountOptions = (
  maxCount: number,
  currentCount: number,
): PopoverItem[] => {
  const options = [];
  for (let i = 0; i < maxCount; i++) {
    const count = i + 1;
    options.push({
      label: String(count),
      selected: count === currentCount,
    });
  }
  return options;
};

const buildPredefinedCountOptions = (
  options: number[],
  currentCount: number,
): PopoverItem[] => {
  const result: PopoverItem[] = [];
  options.forEach((option) => {
    result.push({
      label: String(option),
      selected: option === currentCount,
    });
  });
  return result;
};
