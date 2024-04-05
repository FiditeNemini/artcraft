import { useContext, useEffect, useState } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { useSignals } from "@preact/signals-react/runtime";
import { timelineHeight } from "~/pages/PageEnigma/store";
import { AssetType } from "~/pages/PageEnigma/models";
import { ObjectElement } from "~/pages/PageEnigma/comps/SidePanelTabs/ObjectElement";

interface Props {
  type: AssetType;
}

export const ObjectElements = ({ type }: Props) => {
  const { characterItems } = useContext(TrackContext);
  useSignals();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    setHeight(window.outerHeight - timelineHeight.value);
  }, []);

  return (
    <div className="flex flex-wrap gap-3 overflow-y-auto" style={{ height }}>
      {characterItems.map((item) => {
        return <ObjectElement key={item.media_id} item={item} type={type} />;
      })}
    </div>
  );
};
