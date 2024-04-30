import { useSignals } from "@preact/signals-react/runtime";
import { useLayoutEffect, useState } from "react";
import { MediaFile } from "~/pages/PageEnigma/models";
import { Button, Input, TransitionDialogue } from "~/components";
import {
  faArrowDownToLine,
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
      <div>
        <span className="font-xl font-bold">
          {mediaFile?.maybe_title ?? mediaFile?.token}
        </span>
        <span className="ml-2 text-sm text-white/60">
          {dayjs(mediaFile?.updated_at).format("MMM DD, YYYY HH:mm:SS")}
        </span>
      </div>
    );
  };

  return (
    <TransitionDialogue
      title={generateTitle()}
      titleIcon={faFilm}
      className="max-w-4xl"
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
      <div className="flex gap-[29px] px-5 pb-5">
        <div className="w-[616px]">
          <video controls width={616} crossOrigin="anonymous">
            <source
              src={`${environmentVariables.value.GOOGLE_API}/vocodes-public${mediaFile?.public_bucket_path}`}
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="w-[355px]">
          <div className="mb-2 text-sm">Share movie to</div>
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
          <div className="my-4 flex w-full gap-2">
            <div className="w-full">
              <Input type="text" value={shareUrl} readOnly />
            </div>

            <Button icon={faLink} onClick={handleCopyLink} variant="primary">
              {buttonLabel}
            </Button>
          </div>
          <Button
            icon={faArrowDownToLine}
            className="my-4 w-full"
            onClick={() => {
              window.open(downloadLink, "_blank");
            }}
            variant="secondary">
            Download
          </Button>
          <Button
            className="mb-4 w-full"
            onClick={() => {
              window.open(openUrl, "_blank");
            }}
            variant="secondary">
            View on Media Page
          </Button>
        </div>
      </div>
    </TransitionDialogue>
  );
}
