import { AssetType } from "~/pages/PageEnigma/models";
import { ObjectElement } from "~/pages/PageEnigma/comps/SidePanelTabs/objects/ObjectElement";
import { characterItems, objectItems } from "~/pages/PageEnigma/store";

interface Props {
  type: AssetType;
}

export const ObjectElements = ({ type }: Props) => {
  return (
    <div className="flex flex-wrap gap-3">
      {(type === AssetType.CHARACTER
        ? characterItems.value
        : objectItems.value
      ).map((item) => {
        return <ObjectElement key={item.media_id} item={item} type={type} />;
      })}
    </div>
  );
};
