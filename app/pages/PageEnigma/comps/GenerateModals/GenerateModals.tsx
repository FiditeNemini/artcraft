import { generateMovieId } from "~/pages/PageEnigma/store";
import { useContext, useEffect, useState } from "react";
import { MyMovies } from "~/pages/PageEnigma/comps/GenerateModals/MyMovies";
import { Sharing } from "~/pages/PageEnigma/comps/GenerateModals/Sharing";
import { useSignals } from "@preact/signals-react/runtime";
import { MediaFile } from "~/pages/PageEnigma/models";
import { GetMediaFileByToken } from "~/pages/PageEnigma/comps/SidePanelTabs/AudioTab/utilities";
import { ToasterContext, ToastTypes } from "~/contexts/ToasterContext";

export function GenerateModals() {
  useSignals();
  const [movieId, setMovieId] = useState(generateMovieId.value);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const { addToast } = useContext(ToasterContext);

  console.log(1, mediaFile);

  useEffect(() => {
    if (!mediaFile) {
      setMovieId("");
    }
  }, [mediaFile]);

  useEffect(() => {
    console.log(2, movieId);
    if (movieId) {
      GetMediaFileByToken(movieId).then((res) => {
        if (!res.success) {
          addToast(ToastTypes.ERROR, "Unable to read media file");
          return;
        }
        setMediaFile(res.media_file ?? null);
      });
    }
  }, [movieId, addToast]);

  if (!mediaFile) {
    return <MyMovies setMovieId={setMovieId} />;
  }
  return <Sharing mediaFile={mediaFile!} setMediaFile={setMediaFile} />;
}
