import { useEffect, useState } from 'react';

import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useSession } from "hooks";

export default function useProfileRequests({ requestMedia = false }) {
	const { user } = useSession();
	const [mediaList, mediaListSet] = useState<MediaFile[]>([]);
	const [mediaListStatus, datasetStatusSet] = useState(requestMedia ? 1 : 0);

    useEffect(() => {
	    if (user && user.username) {
	      if (mediaListStatus === 1) {
	        datasetStatusSet(2);
	        GetMediaByUser(user.username, {}).then((res) => {
	          datasetStatusSet(3);
	          console.log("🧶",res);
	          if (res.results) mediaListSet(res.results);
	        });
	      }
    	}
  }, [user, mediaListStatus]);

  console.log("😎",mediaList);

  return {

  };
};