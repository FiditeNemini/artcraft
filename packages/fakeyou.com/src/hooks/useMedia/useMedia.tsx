import { useEffect, useState } from 'react';
import { GetMedia, MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";

export default function useMedia({ mediaToken = "", onSuccess = (res:MediaFile) => {} }) {
  const [status, statusSet] = useState(FetchStatus.ready);
  const [media,mediaSet] = useState<MediaFile | undefined>();

  useEffect(() => {
    if (mediaToken && status === FetchStatus.ready) {
      statusSet(FetchStatus.in_progress);
      GetMedia(mediaToken,{})
      .then((res) => {
        if (res.success && res.media_file) {
          statusSet(FetchStatus.success);
          onSuccess(res.media_file);
          mediaSet(res.media_file);
        }
      });
    }

  },[mediaToken, onSuccess, status, statusSet]);
 return { media, status };
};