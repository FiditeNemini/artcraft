import React, { useState } from 'react';

interface ChannelPointsRewardNameExactMatchProps {
  rewardName: string,
  updateRewardName: (name: string) => void,
};

function ChannelPointsRewardNameExactMatchForm(props: ChannelPointsRewardNameExactMatchProps) {
  const [rewardName, setRewardName] = useState<string>(props.rewardName);

  const updateRewardName = (ev: React.FormEvent<HTMLInputElement>) : boolean => {
    const value = (ev.target as HTMLInputElement).value;
    setRewardName(value);
    props.updateRewardName(value);
    return true;
  }
  console.log(rewardName, props.rewardName)

  return (
    <>
      <div className="field">
        <label className="label">Match the following reward name</label>
        <div className="control is-medium">
          <input 
            value={rewardName}
            onChange={updateRewardName}
            className="input is-medium" 
            type="text" 
            placeholder="Reward Name" />
        </div>
      </div>
    </>
  )
}

export { ChannelPointsRewardNameExactMatchForm }
