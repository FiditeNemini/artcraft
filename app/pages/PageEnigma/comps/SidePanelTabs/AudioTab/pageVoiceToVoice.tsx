import { AudioTabPages } from "./types";

export const PageVoicetoVoice = ({
  changePage,
  sessionToken,
}:{
  changePage: (newPage:AudioTabPages) => void;
  sessionToken: string;
}) => {
  return (
    <p>v2v page</p>
  );
}