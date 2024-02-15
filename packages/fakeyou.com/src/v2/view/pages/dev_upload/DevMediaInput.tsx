import React, { useState } from "react";
import { EntityInput } from "components/entities";
import { EntityFilterOptions, EntityType, MediaFilterProp, WeightFilterProp } from "components/entities/EntityTypes";
import { useModal, 
  // useSession 
} from "hooks";
import { InferenceJobsModal } from "components/modals";
import { Button, SegmentButtons, TempInput, TempSelect } from "components/common";

interface Props {
  value?: any;
}

export default function DevMediaInput({ value }: Props) {
  // const session = useSession();
  // console.log("🤦🏻‍♂️",session);
  const [mediaToken,mediaTokenSet] = useState();
  const [mediaType,mediaTypeSet] = useState<MediaFilterProp>("all");
  const [weightType,weightTypeSet] = useState<WeightFilterProp>("all");
  // const [mode,modeSet] = useState("media");
  const [entityType,entityTypeSet] = useState(EntityType.media);
  const [owner,ownerSet] = useState("");
  const onChange = ({ target }: any) => mediaTokenSet(target.value);

  const { open } = useModal();

  const options = EntityFilterOptions();
  const changeFilter = ({ target }: { target: any }) => [mediaTypeSet,mediaTypeSet,weightTypeSet][entityType](target.value);

  const openModal = () => open({ component: InferenceJobsModal });

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>{ [526,187].map((num = 0) => String.fromCodePoint(128000 + num)) }</h2>
        <SegmentButtons {...{ onChange: ({ target }: { target: any }) => entityTypeSet(target.value), options, value: entityType }}/>
        <TempInput {...{ value: owner, onChange: ({ target }: { target: any }) => ownerSet(target.value), placeholder: "User" }}/>
        <TempSelect {...{
          options: EntityFilterOptions(0),
          value: ["",mediaType,weightType][entityType],
          onChange: changeFilter
        }}/>
      </header>
       <EntityInput {...{
          accept: ["bvh","glb","gltf"],
          aspectRatio: "landscape",
          label: `Choose ${ ["","media file","weight"][entityType] }`,
          onChange,
          owner,
          search: "Dream",
          type: "media"
        }}/>
        <Button {...{ className: "mt-3", label: "Open modal", onClick: openModal, variant: "primary" }}/>
       <div>
        { mediaToken }
       </div>
    </div>
  </div>;
};