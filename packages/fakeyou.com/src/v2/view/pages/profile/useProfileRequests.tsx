import { useState } from 'react';
import { GetMediaByUser } from "@storyteller/components/src/api/media_files/GetMediaByUser";
import { MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";
import { useListContent } from "hooks";


export default function useProfileRequests({ requestMedia = false }) {
	const [list, listSet] = useState<MediaFile[]>([]);
	const media = useListContent({ fetcher: GetMediaByUser,	list, listSet, requestList: true });

  return { media };
};