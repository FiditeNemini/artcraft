import { useEffect, useState } from 'react';

// voice imports

import { ListVoicesByUser, Voice } from "@storyteller/components/src/api/voice_designer/voices/ListVoicesByUser";
import { DeleteVoice } from "@storyteller/components/src/api/voice_designer/voices/DeleteVoice";

// dataset imports

import { ListDatasetsByUser, Dataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";
import { DeleteDataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/DeleteDataset";
import { CreateDataset, CreateDatasetRequest, CreateDatasetResponse } from "@storyteller/components/src/api/voice_designer/voice_datasets/CreateDataset";
import { UpdateDataset, UpdateDatasetRequest } from "@storyteller/components/src/api/voice_designer/voice_datasets/UpdateDataset";
import { useSession } from "hooks";

export default function useVoiceRequests() {
  const [datasets, datasetsSet] = useState<Dataset[]>([]);
  const [voices, voicesSet] = useState<Voice[]>([]);
  const [fetched,fetchedSet] = useState(false);
  const { user } = useSession();

  // voices

  const deleteVoice = (voiceToken:  string) => DeleteVoice(voiceToken,{
    set_delete: true,
    as_mod: false
  }).then(res => {
    // console.log("🏧",res);
  });


  // datasets

  const createDataset = (request: CreateDatasetRequest) => {
  	// console.log("🌎",);
  	CreateDataset("",request).then((res: CreateDatasetResponse) => {
  		// console.log("☘️",res);
  	});
  };


  const deleteDataset = (voiceToken:  string) => DeleteDataset(voiceToken,{
  	set_delete: true,
  	as_mod: false
  }).then(res => {
  	// console.log("🏧",res);
  });

  const datasetByToken = (datasetToken?: string) => datasets.filter(({ dataset_token },i) => datasetToken === dataset_token)[0];

  const editDataSet = (datasetToken: string, request: UpdateDatasetRequest) => {
  	// console.log("🍄", datasetToken);
  	UpdateDataset(datasetToken,request).then(res => {
  		// console.log("😎",res);
  	});
  };

	useEffect(() => {
    if (!fetched && user && user.username) {
      fetchedSet(true);
      if (!datasets.length) {
        ListDatasetsByUser(user.username,{}).then(res => {
          if (res.datasets) datasetsSet(res.datasets);
        });
      }
      if (!voices.length) {
        ListVoicesByUser(user.username,{}).then(res => {
          if (res.voices) voicesSet(res.voices);
        });
      }
    }

	},[fetched,user, datasets, voices]);

  return { 
  	datasets: {
  		create: createDataset,
  		delete: deleteDataset,
  		edit: editDataSet,
  		list: datasets,
  		byToken: datasetByToken
  	},
  	inference: {},
  	voices: {
      delete: deleteVoice,
      list: voices
    },
  };
};