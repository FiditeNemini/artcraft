import { useEffect, useState } from "react";

// voice imports

import { GetVoice } from "@storyteller/components/src/api/voice_designer/voices/GetVoice";
import {
  CreateVoice,
  CreateVoiceRequest,
  CreateVoiceResponse,
} from "@storyteller/components/src/api/voice_designer/voices/CreateVoice";
import {
  ListVoicesByUser,
  Voice,
} from "@storyteller/components/src/api/voice_designer/voices/ListVoicesByUser";
import {
  DeleteVoice,
  // DeleteVoiceRequest, use me somewhere pls
  DeleteVoiceResponse,
} from "@storyteller/components/src/api/voice_designer/voices/DeleteVoice";
import { UpdateVoice } from "@storyteller/components/src/api/voice_designer/voices/UpdateVoice";

// dataset imports

import { GetDataset } from "@storyteller/components/src/api/voice_designer/voice_datasets/GetDataset";
import {
  ListDatasetsByUser,
  Dataset,
} from "@storyteller/components/src/api/voice_designer/voice_datasets/ListDatasetsByUser";
import {
  DeleteDataset,
  DeleteDatasetResponse,
} from "@storyteller/components/src/api/voice_designer/voice_datasets/DeleteDataset";
import {
  CreateDataset,
  CreateDatasetRequest,
  CreateDatasetResponse,
} from "@storyteller/components/src/api/voice_designer/voice_datasets/CreateDataset";
import {
  UpdateDataset,
  UpdateDatasetRequest,
  UpdateDatasetResponse,
} from "@storyteller/components/src/api/voice_designer/voice_datasets/UpdateDataset";
import { EnqueueTts } from "@storyteller/components/src/api/voice_designer/inference/EnqueueTts";
import { useSession } from "hooks";

export default function useVoiceRequests({
  requestDatasets = false,
  requestVoices = false,
}) {
  // this state will be provided as params, triggering the appropriate api call if present
  const [datasets, datasetsSet] = useState<Dataset[]>([]);
  const [voices, voicesSet] = useState<Voice[]>([]);

  // this state stays here, fetched states are not success, merely an attempt was made. Each list fetch sets to true. Set to false to retry
  const [fetchDatasets, fetchDatasetsSet] = useState(requestDatasets);
  const [fetchVoices, fetchVoicesSet] = useState(requestVoices);
  const [isFetchingVoices, setIsFetchingVoices] = useState(requestVoices);
  const [isFetchingDatasets, setIsFetchingDatasets] = useState(requestDatasets);
  const { user } = useSession();
  // const [timestamp, timestampSet] = useState(Date.now());

  const refreshData = () => {
    fetchDatasetsSet(true);
    fetchVoicesSet(true);
  }; // later we can do refresh per list

  const createDataset = (
    urlRouteArgs: string,
    request: CreateDatasetRequest
  ): Promise<CreateDatasetResponse> =>
    CreateDataset(urlRouteArgs, request).then((res) => {
      // refreshData(); // not needed because creating a dataset navigates to the upload page with no lists
      return res;
    });

  const createVoice = (
    urlRouteArgs: string,
    request: CreateVoiceRequest
  ): Promise<CreateVoiceResponse> =>
    CreateVoice(urlRouteArgs, request).then((res) => {
      // refreshData(); // not needed because creating a voice navigates to a new page with a new instance of useVoiceRequest
      return res;
    });

  const deleteVoice = (voiceToken: string): Promise<DeleteVoiceResponse> =>
    DeleteVoice(voiceToken, {
      set_delete: true,
      as_mod: false,
    }).then((res) => {
      refreshData();
      return res;
      // console.log("🏧",res);
    });

  const deleteDataset = (voiceToken: string): Promise<DeleteDatasetResponse> =>
    DeleteDataset(voiceToken, {
      set_delete: true,
      as_mod: false,
    }).then((res) => {
      refreshData();
      return res;
      // console.log("🏧",res);
    });

  const datasetByToken = (datasetToken?: string) =>
    datasets.filter(
      ({ dataset_token }, i) => datasetToken === dataset_token
    )[0];

  const editDataSet = (
    datasetToken: string,
    request: UpdateDatasetRequest
  ): Promise<UpdateDatasetResponse> => {
    // console.log("🍄", datasetToken);
    return UpdateDataset(datasetToken, request).then((res) => {
      refreshData();
      return res;
    });
  };

  const listDatasets = () => {
    fetchDatasetsSet(true);
    return datasets;
  };

  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
  ];

  const visibilityOptions = [
    { label: "Public", value: "public" },
    { label: "Hidden", value: "hidden" },
  ];

  useEffect(() => {
    if (user && user.username) {
      if (fetchDatasets) {
        setIsFetchingDatasets(true);
        fetchDatasetsSet(false);
        ListDatasetsByUser(user.username, {}).then((res) => {
          if (res.datasets) datasetsSet(res.datasets);
          setIsFetchingDatasets(false);
        });
      }
      if (fetchVoices) {
        setIsFetchingVoices(true);
        fetchVoicesSet(false);
        ListVoicesByUser(user.username, {}).then((res) => {
          if (res.voices) voicesSet(res.voices);
          setIsFetchingVoices(false);
        });
      }
    }
  }, [user, fetchDatasets, fetchVoices]);

  return {
    isFetching: isFetchingVoices || isFetchingDatasets,
    datasets: {
      byToken: datasetByToken,
      create: createDataset,
      delete: deleteDataset,
      edit: editDataSet,
      get: GetDataset,
      list: datasets,
      listDatasets,
      refresh: refreshData,
    },
    inference: {
      enqueue: EnqueueTts,
    },
    languages,
    visibilityOptions,
    voices: {
      create: createVoice,
      delete: deleteVoice,
      get: GetVoice,
      list: voices,
      refresh: refreshData,
      update: UpdateVoice,
    },
    inputCtrl:
      (todo: any) =>
      ({ target }: { target: any }) => {
        console.log("🌿", target);
        todo(target.value);
      },
  };
}
