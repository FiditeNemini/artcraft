import React, { useRef, useState } from "react";

import { MasonryGrid, WeightsCards } from "components/common";
import { SelectModalV2 } from "components/common/SelectModal";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";

import styleModels from "./dataStyleModels";
import { defaultPreset as noStyleCNPreset } from "./dataCnPresets";

export default function CompStyleModal({
  debug,
  t,
  value,
  onChange,
}: {
  debug?: boolean;
  t: Function;
  value: string;
  onChange: (val: {
    [key: string]:
      | number
      | string
      | boolean
      | undefined
      | { [key: string]: number | string };
  }) => void;
}) {
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [onSelectTimeStamp, setOnSelectTimeStamp] = useState<Date>(new Date());
  return (
    <SelectModalV2
      modalTitle={t("input.title.selectStyle")}
      label={t("input.label.selectStyle")}
      value={value}
      placeholder={t("input.placeholder.selectStyle")}
      forcedClose={onSelectTimeStamp}
      onClear={() =>
        onChange({
          sdModelToken: "",
          sdModelTitle: "",
          defaultCN: noStyleCNPreset,
          defaultPrompts: {
            positivePrompt: "",
            negativePrompt: "",
            positivePromptHidden: "",
            negativePromptHidden: "",
          },
          ...noStyleCNPreset,
          positivePrompt: "",
          negativePrompt: "",
          positivePromptHidden: "",
          negativePromptHidden: "",
        })
      }
    >
      <MasonryGrid
        gridRef={gridContainerRef}
        onLayoutComplete={() => {
          if (debug) console.log("Layout complete!");
        }}
      >
        {styleModels.map((data: any, key: number) => {
          const weightProps: any = {
            data,
            type: "weights",
            inSelectModal: true,
            onResultSelect: (data: any) => {
              const selectedStyle = styleModels.find(
                styleItem => (styleItem.weight_token = data.token)
              );
              if (selectedStyle !== undefined) {
                onChange({
                  sdModelToken: data.token,
                  sdModelTitle: data.title,
                  defaultCN: selectedStyle.defaultCN,
                  defaultPrompts: selectedStyle.defaultPrompts,
                  ...selectedStyle.defaultCN,
                  ...selectedStyle.defaultPrompts,
                });
                setOnSelectTimeStamp(new Date());
              }
            },
          };
          //console.log(data);
          return (
            <div
              key={key}
              className="col-12 col-sm-6 col-lg-6 col-xl-4 col-xxl-3 grid-item"
            >
              <WeightsCards type={WeightCategory.SD} props={weightProps} />
            </div>
          );
        })}
      </MasonryGrid>
    </SelectModalV2>
  );
}
