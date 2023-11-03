import { useEffect, useState } from 'react';
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { ListDatasetsByUser, Dataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";
import { DeleteDataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/DeleteDataset";

interface Props {
  sessionWrapper: SessionWrapper;
}

export default function useVoiceRequests({ sessionWrapper }: Props) {
	const { user } = sessionWrapper.sessionStateResponse || {};
  const [datasets, datasetsSet] = useState<Dataset[]>([]);

  const deleteDataSet = (voiceToken:  string) => DeleteDataset(voiceToken,{
  	set_delete: true,
  	as_mod: false
  }).then(res => {
  	console.log("🏧",res);
  });

	useEffect(() => {

		if (!datasets.length && user && user.username) {
		  ListDatasetsByUser(user.username,{}).then(res => {
		    if (res.datasets) datasetsSet(res.datasets);
		  });
		}

	},[user, datasets]);

  return { datasets, deleteDataSet };
};