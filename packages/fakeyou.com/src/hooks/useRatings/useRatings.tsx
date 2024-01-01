import { useState } from 'react';
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";

interface Props {
  value?: any;
}

export default function useRatings({ value }: Props) {
  const [status, statusSet] = useState(FetchStatus.ready);
  return { status, statusSet };
};