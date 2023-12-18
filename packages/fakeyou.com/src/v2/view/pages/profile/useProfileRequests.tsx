import { useEffect, useState } from 'react';
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useSession } from "hooks";

export default function useProfileRequests({ requestMedia = false }) {
	const { user } = useSession();
	const [mediaList, mediaListSet] = useState<MediaFile[]>([]);
	const [mediaListStatus, mediaListStatusSet] = useState(requestMedia ? 1 : 0);
	const [mediaPage,mediaPageSet] = useState(1);
	const [mediaPageCount,mediaPageCountSet] = useState(0);

	const mediaPageChange = (page: number) => {
		mediaPageSet(page);
		mediaListStatusSet(1);
	};

    useEffect(() => {
	    if (user && user.username) {
	      if (mediaListStatus === 1) {
	        mediaListStatusSet(2);
	        GetMediaByUser(user.username, {}, { page_index: mediaPage }).then((res) => {
	          mediaListStatusSet(3);
	          console.log("🧶",res);
	          if (res.results && res.pagination) {
	          	mediaPageCountSet(res.pagination.total_page_count)
	          	mediaListSet(res.results);
	          }
	        });
	      }
    	}
  }, [user, mediaListStatus, mediaPage]);

  // console.log("😎",mediaList);

  return {
  	mediaList,
  	mediaPage,
  	mediaPageChange,
  	mediaPageCount
  };
};