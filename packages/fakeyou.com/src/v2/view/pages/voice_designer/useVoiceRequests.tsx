import { useEffect, useState } from "react";

// voice imports

import { CreateVoice, CreateVoiceRequest } from "@storyteller/components/src/api/voice_designer/voices/CreateVoice";
import { ListVoicesByUser, Voice } from "@storyteller/components/src/api/voice_designer/voices/ListVoicesByUser";
import { DeleteVoice } from "@storyteller/components/src/api/voice_designer/voices/DeleteVoice";

// dataset imports

import {
  ListDatasetsByUser,
  Dataset,
} from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";
import { DeleteDataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/DeleteDataset";
import { CreateDataset, CreateDatasetRequest, CreateDatasetResponse } from "@storyteller/components/src/api/voice_designer/voice_datasets/CreateDataset";
import { UpdateDataset, UpdateDatasetRequest } from "@storyteller/components/src/api/voice_designer/voice_datasets/UpdateDataset";
import { EnqueueTts } from "@storyteller/components/src/api/voice_designer/inference/EnqueueTts";
import { useSession } from "hooks";

export default function useVoiceRequests() {
  // this state will be provided as params, triggering the appropriate api call if present
  const [datasets, datasetsSet] = useState<Dataset[]>([]);
  const [voices, voicesSet] = useState<Voice[]>([]);
  const [fetched, fetchedSet] = useState(false);
  const { user } = useSession();
  const [timestamp, timestampSet] = useState(Date.now());

  const refreshData = () => {
    timestampSet(Date.now());
  }

  const createDataset = (urlRouteArgs: string, request: CreateDatasetRequest) =>
    CreateDataset(urlRouteArgs, request).then(res => {
      refreshData();
    });
  

  const createVoice = (urlRouteArgs: string, request: CreateVoiceRequest) => CreateVoice(urlRouteArgs, request).then(res => {
      refreshData();
    });

  const deleteVoice = (voiceToken:  string) => DeleteVoice(voiceToken,{
    set_delete: true,
    as_mod: false
  }).then(res => {
    refreshData();
    // console.log("🏧",res);
  });

  const deleteDataset = (voiceToken:  string) => DeleteDataset(voiceToken,{
  	set_delete: true,
  	as_mod: false
  }).then(res => {
    refreshData();
  	// console.log("🏧",res);
  });

  const datasetByToken = (datasetToken?: string) =>
    datasets.filter(
      ({ dataset_token }, i) => datasetToken === dataset_token
    )[0];

  const editDataSet = (datasetToken: string, request: UpdateDatasetRequest) => {
  	// console.log("🍄", datasetToken);
  	UpdateDataset(datasetToken,request).then(res => {
      refreshData();
  		// console.log("😎",res);
  	});
  };

	useEffect(() => {
    if (user && user.username) {
        ListDatasetsByUser(user.username,{}).then(res => {
          if (res.datasets) datasetsSet(res.datasets);
        });
        ListVoicesByUser(user.username,{}).then(res => {
          if (res.voices) voicesSet(res.voices);
        });
    }
	},[user,timestamp]);

  return {
  	datasets: {
  		create: createDataset,
  		delete: deleteDataset,
  		edit: editDataSet,
  		list: datasets,
  		byToken: datasetByToken,
      refresh: refreshData
  	},
  	inference: {
      enqueue: EnqueueTts,
    },
  	voices: {
      create: createVoice,
      delete: deleteVoice,
      list: voices,
      refresh: refreshData
    },
    inputCtrl:
      (todo: any) =>
      ({ target }: { target: any }) => {
        console.log("🌿", target);
        todo(target.value);
      },
  };
}
