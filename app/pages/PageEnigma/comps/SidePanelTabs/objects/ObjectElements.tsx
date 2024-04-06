import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { AssetType } from "~/pages/PageEnigma/models";
import { ObjectElement } from "~/pages/PageEnigma/comps/SidePanelTabs/objects/ObjectElement";

interface Props {
  type: AssetType;
}

export const ObjectElements = ({ type }: Props) => {
  const { characterItems, objectItems } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap gap-3">
      {(type === AssetType.CHARACTER ? characterItems : objectItems).map(
        (item) => {
          return <ObjectElement key={item.media_id} item={item} type={type} />;
        },
      )}
    </div>
  );
};
