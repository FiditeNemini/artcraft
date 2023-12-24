import { useEffect, useState } from 'react';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { GetWeight, Weight } from "@storyteller/components/src/api/weights/GetWeight";

interface Props {
  token: string;
}

export default function useWeightFetch({ token }: Props) {
  const [data, setData] = useState<Weight | undefined | null>(null);
  const [status, statusSet] = useState(FetchStatus.ready);
  const isLoading = status === FetchStatus.ready || status === FetchStatus.in_progress;
  const fetchError = status === FetchStatus.error;
  
  useEffect(() => {
    if (token && !data && status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      GetWeight(token, {})
        .then((res: any) => {
          console.log("🏋️", res, status);
          statusSet(FetchStatus.success);
          setData(res);
        })
        .catch(err => {
          statusSet(FetchStatus.error);
        });
    }
  }, [status, token, data]);

  return { data, fetchError, isLoading, status };
};