import React, {useRef, useState} from 'react';

import {
  MasonryGrid,
  WeightsCards }
from 'components/common';
import { SelectModalV2 } from "components/common/SelectModal";
import { WeightCategory } from "@storyteller/components/src/api/_common/enums/WeightCategory";

import styleModels from './dataStyleModels';

export default function CompStyleModal({
  debug,
  t,
  value,
  onChange,
}:{
  debug?: boolean;
  t: Function;
  value: string;
  onChange: (val: {
    [key: string]: number | string | boolean | undefined;
  }) => void;
}){
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const [onSelectTimeStamp, setOnSelectTimeStamp] = useState<Date>(new Date());
  return(
    <SelectModalV2
      modalTitle={t("input.title.selectStyle")}
      label={t("input.label.selectStyle")}
      value={value}
      placeholder={t("input.placeholder.selectStyle")}
      forcedClose={onSelectTimeStamp}
      onClear={()=>onChange({
        sdModelToken: "",
        sdModelTitle: "",
      })}
    >
      <MasonryGrid
        gridRef={gridContainerRef}
        onLayoutComplete={() => {if(debug)console.log("Layout complete!")}}
      >
      {styleModels.map((data: any, key: number) => {
        const weightProps: any = {
          data,
          type: "weights",
          inSelectModal: true,
          onResultSelect: (data: any)=>{
            onChange({
              sdModelToken:data.token,
              sdModelTitle: data.title,
            })
            setOnSelectTimeStamp(new Date());
          }
        };
        //console.log(data);
        return (
          <div key={key}
            className="col-12 col-sm-6 col-xl-4 grid-item"
          >
          <WeightsCards 
            type={WeightCategory.SD}
            props={weightProps}
          />
          </div>
        );
      })}
      </MasonryGrid>
    </SelectModalV2>
  );

}