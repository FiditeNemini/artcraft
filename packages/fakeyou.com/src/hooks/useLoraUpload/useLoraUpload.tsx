import { useState } from "react";
import { UploadModel } from "@storyteller/components/src/api/image_generation/UploadModel";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { useCoverImgUpload } from "hooks";
import { v4 as uuidv4 } from "uuid";

// this hook is mostly for organizational purposes while I work -V

export default function useLoraUpload() {
  const [title, titleSet] = useState("");
  const [uploadPath, uploadPathSet] = useState("");
  const [visibility, visibilitySet] = useState("public");
  const [descriptionMD, descriptionMDSet] = useState("");
  const [writeStatus, writeStatusSet] = useState(FetchStatus.paused);
  const coverImg = useCoverImgUpload();

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = {
      descriptionMDSet,
      uploadPathSet,
      titleSet,
      visibilitySet,
    };
    todo[target.name + "Set"](target.value);
  };

  const upload = () => {
    writeStatusSet(FetchStatus.in_progress);
    UploadModel("", {
      ...(coverImg.token
        ? { cover_image_media_file_token: coverImg.token }
        : {}),
      maybe_name: title,
      maybe_description: descriptionMD,
      uuid_idempotency_token: uuidv4(),
      type_of_inference: "inference",
      maybe_upload_path: uploadPath,
      visibility,
    })
      .then((res: any) => {
        writeStatusSet(FetchStatus.success);
        console.log("🌠", res);
        // history.replace(`/weight/${token}`);
      })
      .catch(err => {
        writeStatusSet(FetchStatus.error);
      });
  };
  return {
    coverImg,
    descriptionMD,
    onChange,
    title,
    upload,
    uploadPath,
    visibility,
    writeStatus,
  };
}
