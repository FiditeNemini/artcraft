import { TransitionDialogue } from "~/components";
import { generateMovieId, viewMyMovies } from "~/pages/PageEnigma/store";
import { faFilm } from "@fortawesome/pro-solid-svg-icons";
import { useContext, useEffect, useState } from "react";
import { MyMovies } from "~/pages/PageEnigma/comps/GenerateModals/MyMovies";
import { Sharing } from "~/pages/PageEnigma/comps/GenerateModals/Sharing";
import { useSignals } from "@preact/signals-react/runtime";
import dayjs from "dayjs";
import { MediaFile } from "~/pages/PageEnigma/models";
import { GetMediaFileByToken } from "~/pages/PageEnigma/comps/SidePanelTabs/AudioTab/utilities";
import { ToasterContext, ToastTypes } from "~/contexts/ToasterContext";

export function GenerateModals() {
  useSignals();
  const [movieId, setMovieId] = useState(generateMovieId.value);
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const { addToast } = useContext(ToasterContext);

  useEffect(() => {
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
