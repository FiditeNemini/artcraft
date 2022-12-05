import React, { useEffect, useState } from "react";

interface ChannelPointsRewardNameExactMatchProps {
  rewardName: string;
  updateRewardName: (name: string) => void;
}

function ChannelPointsRewardNameExactMatchForm(
  props: ChannelPointsRewardNameExactMatchProps
) {
  const [rewardName, setRewardName] = useState<string>("");

  // NB: useState is not always setting from props correctly (after several re-renders)
  // The following answers suggests using useEffect:
  //  https://stackoverflow.com/a/54866051 (less clear by also using useState(), but good comments)
  //  https://stackoverflow.com/a/62982753
  useEffect(() => {
    setRewardName(props.rewardName);
  }, [props.rewardName]);

  const updateRewardName = (ev: React.FormEvent<HTMLInputElement>): boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setRewardName(value);
    props.updateRewardName(value);
    return true;
  };

  return (
    <>
      <div className="form-group">
        <label className="sub-title">Match the following reward name</label>
        <div>
          <input
            value={rewardName}
            onChange={updateRewardName}
            className="form-control"
            type="text"
            placeholder="Reward Name"
          />
        </div>
      </div>
    </>
  );
}

export { ChannelPointsRewardNameExactMatchForm };
