import React, { useState } from "react";
import { EntityInput } from "components/entities";
import { EntityFilterOptions, EntityType, MediaFilterProp, WeightFilterProp } from "components/entities/EntityTypes";
import { useModal } from "hooks";
import { InferenceJobsModal } from "components/modals";
import { Button, SegmentButtons, TempInput, TempSelect } from "components/common";

interface Props {
  value?: any;
}

export default function DevMediaInput({ value }: Props) {
  const [mediaToken,mediaTokenSet] = useState();
  const [mediaType,mediaTypeSet] = useState<MediaFilterProp>("all");
  const [weightType,weightTypeSet] = useState<WeightFilterProp>("all");
  const [entityType,entityTypeSet] = useState(EntityType.media);
  const [owner,ownerSet] = useState("");
  const onChange = ({ target }: any) => mediaTokenSet(target.value);

  const { open } = useModal();

  const options = [{ label: "Media", value: EntityType.media },{ label: "Weights", value: EntityType.weights }];
  const changeFilter = ({ target }: { target: any }) => [mediaTypeSet,mediaTypeSet,weightTypeSet][entityType](target.value);

  const openModal = () => open({ component: InferenceJobsModal });

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>{ [526,187].map((num = 0) => String.fromCodePoint(128000 + num)) }</h2>
        <SegmentButtons {...{ onChange: ({ target }: { target: any }) => entityTypeSet(target.value), options, value: entityType }}/>
        <TempInput {...{ value: owner, onChange: ({ target }: { target: any }) => ownerSet(target.value), placeholder: "User" }}/>
        <TempSelect {...{ options: EntityFilterOptions(entityType), value: ["",mediaType,weightType][entityType], onChange: changeFilter }}/>
        <Button {...{ label: "Enqueue", variant: "primary" }}/>
      </header>
       <EntityInput {...{
          aspectRatio: "landscape",
          label: `Choose ${ ["","media file","weight"][entityType] }`,
          onChange,
          owner,
          ...([{},{ mediaType },{ weightType }][entityType])
        }}/>
        <Button {...{ className: "mt-3", label: "Open modal", onClick: openModal, variant: "primary" }}/>
       <div>
        { mediaToken }
       </div>
    </div>
  </div>;
};