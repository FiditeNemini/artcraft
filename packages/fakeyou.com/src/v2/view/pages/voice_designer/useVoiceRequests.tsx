import { useEffect, useState } from 'react';
// import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { ListDatasetsByUser, Dataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";
import { DeleteDataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/DeleteDataset";
// import { CreateVoice, UpdateDatasetRequest } from "@storyteller/components/src/api/voice_designer/voice_datasets/CreateVoice";
import { UpdateDataset, UpdateDatasetRequest } from "@storyteller/components/src/api/voice_designer/voice_datasets/UpdateDataset";
import { useSession } from "hooks";

export default function useVoiceRequests() {
  const [datasets, datasetsSet] = useState<Dataset[]>([]);
  const { user } = useSession();

  const deleteDataSet = (voiceToken:  string) => DeleteDataset(voiceToken,{
  	set_delete: true,
  	as_mod: false
  }).then(res => {
  	console.log("🏧",res);
  });

  const datasetByToken = (datasetToken?: string) => datasets.filter(({ dataset_token },i) => datasetToken === dataset_token)[0];

  const editDataSet = (datasetToken: string, request: UpdateDatasetRequest) => {
  	console.log("🍄", datasetToken);
  	UpdateDataset(datasetToken,request).then(res => {
  		console.log("😎",res);
  	});
  };

  const createDataSet = () => {
  	console.log("🌎",);
  	// CreateVoice(datasetToken,request).then(res => {
  	// 	console.log("☘️",res);
  	// });
  };

	useEffect(() => {

		if (!datasets.length && user && user.username) {
		  ListDatasetsByUser(user.username,{}).then(res => {
		    if (res.datasets) datasetsSet(res.datasets);
		  });
		}

	},[user, datasets]);

  return { 
  	datasets: {
  		create: createDataSet,
  		delete: deleteDataSet,
  		edit: editDataSet,
  		list: datasets,
  		byToken: datasetByToken
  	},
  	inference: {},
  	voice: {},
  };
};