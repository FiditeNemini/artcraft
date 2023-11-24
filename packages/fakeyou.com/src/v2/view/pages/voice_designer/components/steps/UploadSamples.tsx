import React, { useEffect, useState } from "react";
import { AudioInput } from "components/common";
import moment from 'moment';
import ListItems from "../NewList";
import { v4 as uuidv4 } from "uuid";
import { ListSamplesForDataset } from "@storyteller/components/src/api/voice_designer/voice_dataset_samples/ListSamplesForDataset";
import { UploadSample } from "@storyteller/components/src/api/voice_designer/voice_dataset_samples/UploadSample";
import { DeleteSample } from "@storyteller/components/src/api/voice_designer/voice_dataset_samples/DeleteSample";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaveform } from "@fortawesome/pro-solid-svg-icons";

interface Props {
   audioProps: any,
   datasetToken?: string,
   uploadStatus: number,
   uploadStatusSet: any 
}

function UploadSamples({ audioProps, datasetToken, uploadStatus, uploadStatusSet }: Props) {
  const [samples,samplesSet] = useState<any[]>([]);
  const [listFetched,listFetchedSet] = useState(false);

  const SampleBadge = () => <FontAwesomeIcon icon={faWaveform} className="me-2 me-lg-3" />;

  const sampleClick =  () => ({ target }: { target: any }) => {
      let sampleToken = samples[target.name.split(",")[0].split(":")[1]].sample_token;
      DeleteSample(sampleToken,{ as_mod: false, set_delete: true })
      .then((res) => {
        listFetchedSet(false);
        // set unBusy here
      });
  };

  const actionSamples = samples.map((sample: any, i: number) => {
    let date = new Date(sample.created_at);
    return {
      ...sample,
      badge: SampleBadge,
      buttons: [
        {
          label: "Delete",
          small: true,
          variant: "secondary",
          onClick: sampleClick()
        },
      ],
      name: `Sample from ${ date ? moment(date).format("MMMM Do YYYY, h:mm a") : "" }`,
    };
  });

  useEffect(() => {
    if (audioProps.file && datasetToken && !uploadStatus) {
      uploadStatusSet(1);
      UploadSample("",{
        dataset_token: datasetToken || "",
        file: audioProps.file,
        uuid_idempotency_token: uuidv4(),
      })
      .then((res) => {
        if (res.success) {
          audioProps.clear();
          uploadStatusSet(2);
          listFetchedSet(false);
        }
      });
    }

    if (datasetToken && !listFetched) {
      listFetchedSet(true);
      ListSamplesForDataset(datasetToken,{})
      .then((res) => {
        if (res.success && res.samples) {
          samplesSet(res.samples);
        }
      });
    }

  },[audioProps, datasetToken, listFetched, uploadStatus, uploadStatusSet]);

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <label className="sub-title">Upload Audio</label>
        <div className="d-flex flex-column gap-3 upload-component">
          <AudioInput {...{ ...audioProps }}/>
          { samples.length ? <ListItems {...{ data: actionSamples, isLoading: false }}/> : null }
        </div>
      </div>
    </div>
  );
}

export { UploadSamples };
