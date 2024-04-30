import { useSignals } from "@preact/signals-react/runtime";
import { useState } from "react";
import { MediaFile } from "~/pages/PageEnigma/models";
import { Button, Input, Label, TransitionDialogue } from "~/components";
import {
  faArrowDownToLine,
  faArrowRight,
  faFilm,
  faLink,
} from "@fortawesome/pro-solid-svg-icons";
import SocialButton from "./SocialButton";
import { generateMovieId, viewMyMovies } from "~/pages/PageEnigma/store";
import dayjs from "dayjs";
import { environmentVariables } from "~/store";

interface Props {
  mediaFile: MediaFile;
  setMediaFile: (file: MediaFile | null) => void;
}

export function Sharing({ mediaFile, setMediaFile }: Props) {
  useSignals();
  const shareUrl = `https://storyteller.ai/media/${mediaFile?.token || ""}`;
  const shareText = "Check out this media on StoryTeller.ai";
  const [buttonLabel, setButtonLabel] = useState("Copy");
  const downloadLink = `${environmentVariables.value.GOOGLE_API}/vocodes-public${mediaFile?.public_bucket_path}`;
  const openUrl = `/media/${mediaFile.token}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setButtonLabel("Copied!");
    setTimeout(() => setButtonLabel("Copy"), 2000);
  };

  const generateTitle = () => {
    return (
      <div className="flex items-center gap-2.5">
        <span className="font-xl font-bold">
          {mediaFile?.maybe_title ?? mediaFile?.token}
        </span>
        <span className="text-sm font-medium text-white/60">
          {dayjs(mediaFile?.updated_at).format("MMM DD, YYYY HH:mm:ss")}
        </span>
      </div>
    );
  };

  return (
    <TransitionDialogue
      title={generateTitle()}
      titleIcon={faFilm}
      className="max-w-6xl"
      childPadding={false}
      isOpen={viewMyMovies.value}
      width={1049}
      onClose={() => {
        if (generateMovieId.value) {
          viewMyMovies.value = false;
          return;
        }
        setMediaFile(null);
      }}>
      <div className="flex gap-6 px-5 pb-5">
        <div className="max-h-[420px] w-full overflow-hidden rounded-lg">
          <video controls crossOrigin="anonymous" width="100%">
            <source
              src={`${environmentVariables.value.GOOGLE_API}/vocodes-public${mediaFile?.public_bucket_path}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="flex w-[500px] flex-col">
          <Label>Share movie to:</Label>
          <div className="flex w-full flex-wrap justify-between">
            <SocialButton
              social="x"
              shareUrl={shareUrl}
              shareText={shareText}
            />
            <SocialButton
              social="whatsapp"
              shareUrl={shareUrl}
              shareText={shareText}
            />
            <SocialButton
              social="facebook"
              shareUrl={shareUrl}
              shareText={shareText}
            />
            <SocialButton
              social="reddit"
              shareUrl={shareUrl}
              shareText={shareText}
            />
            <SocialButton
              social="email"
              shareUrl={shareUrl}
              shareText={shareText}
            />
          </div>
          <div className="my-6 flex w-full gap-2">
            <div className="w-full">
              <Input type="text" value={shareUrl} readOnly />
            </div>

            <Button icon={faLink} onClick={handleCopyLink} variant="primary">
              {buttonLabel}
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              icon={faArrowDownToLine}
              className="h-10 w-full"
              onClick={() => {
                window.open(downloadLink, "_blank");
              }}
              variant="secondary">
              Download
            </Button>
            <Button
              className="h-10 w-full"
              onClick={() => {
                window.open(openUrl, "_blank");
              }}
              icon={faArrowRight}
              iconFlip={true}
              variant="secondary">
              View on Media Page
            </Button>
          </div>
        </div>
      </div>
    </TransitionDialogue>
  );
}
