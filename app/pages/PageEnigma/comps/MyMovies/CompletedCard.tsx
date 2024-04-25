import { MediaInfo } from "~/pages/PageEnigma/models/movies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/pro-solid-svg-icons";
import { useRef, useState } from "react";
import { BucketConfig } from "~/api/BucketConfig";
import dayjs from "dayjs";

interface Props {
  movie: MediaInfo;
}

export function CompletedCard({ movie }: Props) {
  const bucketConfig = useRef<BucketConfig>(new BucketConfig());
  const [loadError, setLoadError] = useState(false);

  const imageUrl = bucketConfig.current.getCdnUrl(
    movie.public_bucket_path + "-thumb.gif",
    360,
    20,
  );

  return (
    <div className="mb-2 mr-2 flex items-center justify-between">
      <div className="flex gap-2">
        <div className="rounded-lg py-2 pl-5">
          <img
            src={
              loadError ? "resources/images/movie-placeholder.png" : imageUrl
            }
            className="h-[70px] w-[124px] rounded-lg"
            alt={movie.maybe_title ?? "unknown"}
            crossOrigin="anonymous"
            onError={() => setLoadError(true)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div>{movie.maybe_title}</div>
          <div className="text-white/60">Anime 2D</div>
          <div className="text-white/60">
            {dayjs(movie.updated_at).format("MMM D, YYYY HH:mm")}
          </div>
        </div>
      </div>
      <button onClick={() => console.log("download")} className="ml-2">
        <FontAwesomeIcon icon={faDownload} className="text-white/50" />
      </button>
    </div>
  );
}
