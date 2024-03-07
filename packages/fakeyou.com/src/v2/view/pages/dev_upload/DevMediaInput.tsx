import React, { useState } from "react";
import { EntityInput } from "components/entities";
import { EntityFilterOptions, EntityInputMode, EntityModeProp, ListEntityFilters } from "components/entities/EntityTypes";
import { useModal, useSession } from "hooks";
import { InferenceJobsModal } from "components/modals";
import { Button, SegmentButtons, TempInput, TempSelect } from "components/common";
import "./DevEntityInput.scss";

interface Props {
  value?: any;
}

interface Yank {
  [key: string]: any[]
}

export default function DevMediaInput({ value }: Props) {
  const { studioAccessCheck } = useSession();
  const [mediaToken,mediaTokenSet] = useState();
  const [mode, modeSet] = useState<EntityModeProp>("media");
  const yadda = Object.keys(EntityInputMode).filter(val => isNaN(Number(val))).reduce((obj,modeType,i) => {
    return {
      [modeType]: ListEntityFilters(i),
      ...obj
    };
  },{});

  const [filters,filtersSet] = useState<Yank>(yadda);
  const [owner,ownerSet] = useState("");
  const onChange = ({ target }: any) => mediaTokenSet(target.value);
  const { open } = useModal();

  const inputMode = EntityInputMode[mode];

  const options = EntityFilterOptions();
  const filterOptions = EntityFilterOptions(inputMode);

  console.log("❌", mode, inputMode, filterOptions);

  const changeFilter = ({ target }: { target: any }) => filtersSet({ ...filters, [mode]: target.value });

  const openModal = () => open({ component: InferenceJobsModal });

  return studioAccessCheck(<div {...{ className: "fy-engine-compositor p-3"}}>
    <h2>{ [526,187].map((num = 0) => String.fromCodePoint(128000 + num)) }</h2>
    <div {...{ className: "panel p-3 fy-basic-grid" }}>
      <header>
        <SegmentButtons {...{ onChange: ({ target }: { target: any }) => modeSet(target.value), options, value: mode }}/>
        <TempInput {...{ value: owner, onChange: ({ target }: { target: any }) => ownerSet(target.value), placeholder: "User" }}/>
      </header>
      <TempSelect {...{
        options: filterOptions,
        value: filters[mode],
        onChange: changeFilter
      }}/>
     <EntityInput {...{
        accept: ["bvh","glb","gltf"],
        aspectRatio: "landscape",
        label: "Choose entity",
        // label: `Choose ${ ["","media file","weight"][entityType] }`,
        onChange,
        owner,
        search: "Dream",
        type: "media"
      }}/>
      <Button {...{ label: "Open modal", onClick: openModal, variant: "primary" }}/>
     <div>
      { mediaToken }
     </div>
    </div>
  </div>);
};