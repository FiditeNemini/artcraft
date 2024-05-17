import { useEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { MediaFile } from "~/pages/PageEnigma/models";

import { generateMovieId } from "~/pages/PageEnigma/signals";
import { ToastTypes } from "~/enums";
import { addToast } from "~/signals";

import { GetMediaFileByToken } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/AudioTab/utilities";

import { MyMovies } from "~/pages/PageEnigma/comps/GenerateModals/MyMovies";
import { Sharing } from "~/pages/PageEnigma/comps/GenerateModals/Sharing";

export function GenerateModals() {
  useSignals();
  const [movieId, setMovieId] = useState(generateMovieId.value);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    if (!mediaFile) {
      setMovieId("");
    }
  }, [mediaFile]);

  useEffect(() => {
    // console.log(2, movieId);
    if (movieId) {
      GetMediaFileByToken(movieId).then((res) => {
        if (!res.success) {
          addToast(ToastTypes.ERROR, "Unable to read media file");
          return;
        }
        setMediaFile(res.media_file ?? null);
      });
    }
  }, [movieId]);

  if (!mediaFile) {
    return <MyMovies setMovieId={setMovieId} />;
  }
  return <Sharing mediaFile={mediaFile!} setMediaFile={setMediaFile} />;
}
