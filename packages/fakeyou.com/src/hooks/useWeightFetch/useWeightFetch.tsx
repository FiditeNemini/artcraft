import { useEffect, useState } from 'react';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { GetWeight, Weight } from "@storyteller/components/src/api/weights/GetWeight";

interface Props {
  token: string;
}

export default function useWeightFetch({ token }: Props) {
  const [data, setData] = useState<Weight | undefined | null>(null);
  const [status, statusSet] = useState(FetchStatus.ready);
  const [title, titleSet] = useState("");
  const [visiblity, visiblitySet] = useState("public");
  const [descriptionMD, descriptionMDSet] = useState();
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;
  
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
          visiblitySet(creator_set_visibility);
          setData(response);
        })
        .catch(err => {
          statusSet(FetchStatus.error);
        });
    }
  }, [status, token, data]);

  return { data, fetchError, isLoading, descriptionMD, status, title, visiblity };
};