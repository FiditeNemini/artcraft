import { MediaInfo } from "~/pages/PageEnigma/models/movies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDownToLine } from "@fortawesome/pro-solid-svg-icons";
import { useRef, useState } from "react";
import { BucketConfig } from "~/api/BucketConfig";
import dayjs from "dayjs";
import Tooltip from "~/components/Tooltip";
import { environmentVariables } from "~/store";

interface Props {
  movie: MediaInfo;
  setMovieId: (id: string) => void;
}

export function CompletedCard({ movie, setMovieId }: Props) {
  const bucketConfig = useRef<BucketConfig>(new BucketConfig());
  const [loadError, setLoadError] = useState(false);
  const downloadLink = `${environmentVariables.value.GOOGLE_API}/vocodes-public${movie.public_bucket_path}`;

  const imageUrl = bucketConfig.current.getCdnUrl(
    movie.public_bucket_path + "-thumb.gif",
    360,
    20,
  );

  return (
    <button
      className="flex w-full items-center justify-between px-5 py-3 text-start transition-all duration-150 hover:bg-brand-secondary/40"
      onClick={() => {
        setMovieId(movie.token);
      }}>
      <div className="flex gap-4">
        <div className="rounded-lg">
          <img
            src={
              loadError ? "resources/images/movie-placeholder.png" : imageUrl
            }
            className="aspect-video w-36 rounded-lg object-cover"
            alt={movie.maybe_title ?? "unknown"}
            crossOrigin="anonymous"
            onError={() => setLoadError(true)}
          />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <div className="font-medium">{movie.maybe_title || "Untitled"}</div>
          <div>
            <div className="text-sm text-white/60">Anime 2D</div>
            <div className="text-sm text-white/60">
              {dayjs(movie.updated_at).format("MMM D, YYYY HH:mm")}
            </div>
          </div>
        </div>
      </div>
      <div className="pr-5">
        <Tooltip content="Download" position="top">
          <button
            onClick={() => {
              window.open(downloadLink, "_blank");
            }}
            className="text-xl text-white/50 transition-all duration-150 hover:text-white/90">
            <FontAwesomeIcon icon={faArrowDownToLine} />
          </button>
        </Tooltip>
      </div>
    </button>
  );
}
