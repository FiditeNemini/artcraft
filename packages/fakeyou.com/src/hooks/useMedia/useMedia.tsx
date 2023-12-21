import { useEffect, useState } from 'react';
import { GetMedia, MediaFile } from "@storyteller/components/src/api/media_files/GetMedia";

enum Status {
	Paused,
  Working,
  Success,
  Error,
}

export default function useMedia({ mediaToken = "" }) {
  const [fetched,fetchedSet] = useState(false);
  const [media,mediaSet] = useState<MediaFile | undefined>();
  let index;

  if (!fetched) index = Status.Paused;
  else if (!media) index = Status.Working;
  else if (media.token) index = Status.Success;
  else index = Status.Error;

  useEffect(() => {
    if (mediaToken && !fetched) {
      fetchedSet(true);
      GetMedia(mediaToken,{})
      .then((res) => {
        if (res.success && res.media_file) {
          mediaSet(res.media_file);
        }
      });
    }

  },[fetched,mediaToken]);

  return [media,{ fetched, index, id: Status[index] }];
};

// usage example:
// const [ media, mediaStatus ] = useMedia({ mediaToken: xyz });
//
// not loaded, so show a spinner
// if (!mediaStatus.fetched) return <Spinner />; 
//
// show a specific component from an array of Components
// return [Spinner,Skeleton,ViewMedia,MediaError][mediaStatus.index];
//
// use text for some reason? like translation strings?
// t(`nameSpace.status${ mediaStatus.id  }`);