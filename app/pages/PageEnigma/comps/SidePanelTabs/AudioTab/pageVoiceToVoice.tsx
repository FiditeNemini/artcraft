import { AudioTabPages } from "./types";
import { VoiceConversionModelListItem } from "./typesImported";

export const PageVoicetoVoice = ({
  changePage,
  sessionToken,
  v2vModels
}:{
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
  v2vModels: Array<VoiceConversionModelListItem>
}) => {
  console.log(v2vModels);
  return (
    <p>v2v page</p>
  );
}