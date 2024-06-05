import { useSignals } from "@preact/signals-react/runtime";
import { isRetreivingAudioItems } from "~/signals";
import { AudioItemElement } from "./audioItemElement";
import { faSpinnerThird } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AudioMediaItem } from "~/pages/PageEnigma/models";
import { H6 } from "~/components";

interface Props {
  currentPage: number;
  pageSize: number;
  items: AudioMediaItem[];
}

export const AudioItemElements = ({ currentPage, pageSize, items }: Props) => {
  useSignals();
  return (
    <div className="grid grid-cols-1 gap-2.5">
      {isRetreivingAudioItems.value && (
        <div className="flex w-full items-center justify-center gap-3">
          <FontAwesomeIcon icon={faSpinnerThird} spin />
          <H6>Retreiving New Audio Items</H6>
        </div>
      )}
      {items
        .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
        .map((item) => (
          <AudioItemElement key={item.media_id} item={item} />
        ))}
    </div>
  );
};
