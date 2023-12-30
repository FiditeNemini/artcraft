import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { GetWeight, Weight } from "@storyteller/components/src/api/weights/GetWeight";
import { UpdateWeight } from "@storyteller/components/src/api/weights/UpdateWeight";
import { DeleteWeight } from "@storyteller/components/src/api/weights/DeleteWeight";
import { UploadMedia, UploadMediaResponse } from "@storyteller/components/src/api/media_files/UploadMedia";
import { v4 as uuidv4 } from "uuid";
import { useFile } from "hooks";

interface Props {
  onRemove?: (x: any) => void;
  token: string;
}

export default function useWeightFetch({ onRemove = () => {}, token }: Props) {
  const [data, setData] = useState<Weight | undefined | null>(null);
  const [status, statusSet] = useState(FetchStatus.ready);
  const [writeStatus, writeStatusSet] = useState(FetchStatus.paused);
  const [title, titleSet] = useState("");
  const [visibility, visibilitySet] = useState("public");
  const [descriptionMD, descriptionMDSet] = useState("");
  const [imgMediaFile, imgMediaFileSet] = useState("");
  const [imgUploadStatus, imgUploadStatusSet] = useState(FetchStatus.ready);
  const imageProps = useFile({});
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;
  const history = useHistory();

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = { descriptionMDSet, titleSet, visibilitySet };
    todo[target.name + "Set"](target.value);
  };

  const update = () => {
    writeStatusSet(FetchStatus.in_progress);
    UpdateWeight(token,{
      cover_image_media_file_token: imgMediaFile,
      description_markdown: descriptionMD,
      description_rendered_html: data?.description_rendered_html || "",
      title,
      visibility,
      weight_category: data?.weights_category || "",
      weight_type: data?.weights_type || ""
    })
    .then((res: any) => {
      console.log("📝",res);
      writeStatusSet(FetchStatus.success);
      history.replace(`/weight/${ token }`);
    })
    .catch(err => {
      writeStatusSet(FetchStatus.error);
    });
  };

  const remove = () => {
    writeStatusSet(FetchStatus.in_progress);
    DeleteWeight(token,{
      as_mod: true,
      set_delete: true
    })
    .then((res: any) => {
      writeStatusSet(FetchStatus.success);
      console.log("✂️",res);
      onRemove(res);
    });
  };

  const uploadCoverImg = (e: any) => {
    console.log("🧲",!!imageProps.file, imgUploadStatus);
    // e.stopPropigation();
    if (imageProps.file && imgUploadStatus < 2) {
      imgUploadStatusSet(FetchStatus.in_progress);
      UploadMedia({
        uuid_idempotency_token: uuidv4(),
        file: imageProps.file,
        source: "file",
      }) // if there an audio file it uploads here
      .then((res: UploadMediaResponse) => {
        if ("media_file_token" in res) {
          imgUploadStatusSet(FetchStatus.success);
          imgMediaFileSet(res.media_file_token);
        }
      });
    }
  };
  
  useEffect(() => {
    if (token && !data && status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      GetWeight(token, {})
      .then((res: any) => {
        let { creator_set_visibility, description_markdown, title: resTitle, ...response } = res;
        console.log("🏋️", res, status);
        statusSet(FetchStatus.success);
        titleSet(resTitle);
        descriptionMDSet(description_markdown);
        visibilitySet(creator_set_visibility);
        setData(response);
      })
      .catch(err => {
        statusSet(FetchStatus.error);
      });
    }
  }, [status, token, data]);

  return { data, fetchError, imgMediaFile, imgMediaFileSet, imageProps, imgUploadStatus, isLoading, descriptionMD, onChange, remove, status, title, update, uploadCoverImg, visibility, writeStatus };
};