import { useState } from "react";
import { FetchStatus } from "~/pages/PageEnigma/enums";

export const usePagination = (setStatus: (status: FetchStatus) => void) => {
  const [page, setPage] = useState(0);
  const pageChange = (page: number) => {
    setPage(page);
    setStatus(FetchStatus.READY);
  };

  return { page, pageChange };
};
