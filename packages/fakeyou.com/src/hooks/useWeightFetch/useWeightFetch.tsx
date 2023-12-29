import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import {
  GetWeight,
  Weight,
} from "@storyteller/components/src/api/weights/GetWeight";
import { UpdateWeight } from "@storyteller/components/src/api/weights/UpdateWeight";
import { DeleteWeight } from "@storyteller/components/src/api/weights/DeleteWeight";

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
  const isLoading =
    status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;
  const history = useHistory();

  const onChange = ({ target }: { target: { name: string; value: any } }) => {
    const todo: { [key: string]: (x: any) => void } = {
      descriptionMDSet,
      titleSet,
      visibilitySet,
    };
    todo[target.name + "Set"](target.value);
  };

  const update = () => {
    writeStatusSet(FetchStatus.in_progress);
    UpdateWeight(token, {
      description_markdown: descriptionMD,
      description_rendered_html: data?.description_rendered_html || "",
      title,
      visibility,
      weight_category: data?.weight_category || "",
      weight_type: data?.weight_type || "",
    })
      .then((res: any) => {
        writeStatusSet(FetchStatus.success);
        history.replace(`/weight/${token}`);
      })
      .catch(err => {
        writeStatusSet(FetchStatus.error);
      });
  };

  const remove = () => {
    writeStatusSet(FetchStatus.in_progress);
    DeleteWeight(token, {
      as_mod: true,
      set_delete: true,
    }).then((res: any) => {
      writeStatusSet(FetchStatus.success);
      onRemove(res);
    });
  };

  useEffect(() => {
    if (token && !data && status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      GetWeight(token, {})
        .then((res: any) => {
          let {
            creator_set_visibility,
            description_markdown,
            title: resTitle,
          } = res;
          statusSet(FetchStatus.success);
          titleSet(resTitle);
          descriptionMDSet(description_markdown);
          visibilitySet(creator_set_visibility);
          setData(res);
        })
        .catch(err => {
          statusSet(FetchStatus.error);
        });
    }
  }, [status, token, data]);

  return {
    data,
    fetchError,
    isLoading,
    descriptionMD,
    onChange,
    remove,
    status,
    title,
    update,
    visibility,
    writeStatus,
  };
}
