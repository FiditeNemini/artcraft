import React, { useEffect, useState } from 'react';
import { AudioInput } from "components/common";
import { useFile } from "hooks";
import { v4 as uuidv4 } from "uuid";
import { UploadAudio } from "@storyteller/components/src/api/media_files/UploadAudio";

interface Props {
  value?: any;
}

export default function MediaDebug({ value }: Props) {
  const audioProps = useFile({});
  const [fetched,fetchedSet] = useState(false);

  useEffect(() => {
    if (!fetched && audioProps.file) {
      let uuid_idempotency_token = uuidv4();
      fetchedSet(true);
      UploadAudio("",{
        file: audioProps.file,
        uuid_idempotency_token,
      })
      .then((res: any) => {
        if (res.success) {
          console.log("🧰",res);
        }
      });
    }
  },[audioProps, fetched]);

  return <div>
    <h1>Hello world</h1>
    <AudioInput {...{ ...audioProps }}/>
  </div>;
};