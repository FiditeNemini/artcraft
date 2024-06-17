import { useState } from "react";
import { twMerge } from "tailwind-merge";
import EnvironmentVariables from "~/Classes/EnvironmentVariables";

interface Props {
  size: number;
  email_hash?: string;
  username?: string;
  avatarIndex?: number;
  backgroundIndex?: number;
  className?: string;
}

function Gravatar(props: Props) {
  //url to the local fallback image
  const localDefaultUrl =
    props.avatarIndex === undefined
      ? "/resources/avatars/0.webp"
      : `/resources/avatars/${props.avatarIndex}.webp`;

  // submitted fallback need to be a url served from our server for gravatar to grab it
  const defaultImageUrl =
    props.avatarIndex === undefined
      ? "https://storyteller.ai/images/avatars/2000x2000/0.webp"
      : `https://storyteller.ai/images/avatars/2000x2000/${props.avatarIndex}.webp`;

  // NB: Gravatar suggests URI encoding these:
  // https://en.gravatar.com/site/implement/images/
  const encondedDefaultImage = encodeURIComponent(defaultImageUrl);

  const gravatarUrl = `${EnvironmentVariables.values.GRAVATAR_API}/avatar/${props.email_hash}?s=${props.size}&d=${encondedDefaultImage}`;

  const [imgUrl, setImgUrl] = useState<string>(gravatarUrl);

  const altText = props.username ? `${props.username}'s gravatar` : "gravatar";

  function getBackgroundColor(backgroundIndex?: number): string {
    switch (backgroundIndex) {
      case 0:
        return "#E66462";
      case 1:
        return "#FD881B";
      case 2:
        return "#E7C13C";
      case 3:
        return "#4BA905";
      case 4:
        return "#25B8A0";
      case 5:
        return "#0078D1";
      case 6:
        return "#7F52C1";
      case 7:
        return "#FF66AC";
      case 8:
        return "#259FEC";
      default:
        return `#1a1a27`;
    }
  }

  return (
    <div
      className={twMerge(
        "overflow-hidden rounded-full border-2 border-white",
        props.className,
      )}
    >
      <img
        crossOrigin="anonymous"
        alt={altText}
        src={imgUrl}
        height={props.size}
        width={props.size}
        style={{ backgroundColor: getBackgroundColor(props.backgroundIndex) }}
        onError={() => {
          setImgUrl((currUrl) => {
            if (currUrl !== localDefaultUrl) {
              return localDefaultUrl;
            }
            return currUrl;
          });
        }}
      />
    </div>
  );
}

export { Gravatar };
