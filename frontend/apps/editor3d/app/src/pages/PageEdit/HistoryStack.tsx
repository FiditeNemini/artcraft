import { Button } from "@storyteller/ui-button";
import { useImageEditCompleteEvent } from "@storyteller/tauri-events";
import {
  faClockRotateLeft,
  faTrashXmark,
  faXmark,
} from "@fortawesome/pro-solid-svg-icons";
import { Fragment, useRef } from "react";
import { twMerge } from "tailwind-merge";
import { BaseSelectorImage } from "./BaseImageSelector";
import { Tooltip } from "@storyteller/ui-tooltip";
import {
  isActionReminderOpen,
  showActionReminder,
} from "@storyteller/ui-action-reminder-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ImageBundle {
  images: BaseSelectorImage[];
}

interface HistoryStackProps {
  onClear: () => void;
  onImageSelect?: (image: BaseSelectorImage) => void;
  imageBundles: ImageBundle[];
  onNewImageBundle?: (newBundle: ImageBundle) => void;
  selectedImageToken?: string;
}

export const HistoryStack = ({
  onClear,
  onImageSelect = () => {},
  imageBundles,
  onNewImageBundle = () => {},
  selectedImageToken,
}: HistoryStackProps) => {
  useImageEditCompleteEvent(async (event) => {
    const newBundle: ImageBundle = {
      images: event.edited_images.map(
        (editedImage) =>
          ({
            url: editedImage.cdn_url,
            mediaToken: editedImage.media_token,
          }) as BaseSelectorImage,
      ),
    };

    onNewImageBundle(newBundle);
    if (newBundle.images.length > 0) {
      onImageSelect(newBundle.images[0]);
      // ensure the scroll container jumps to top for latest bundle
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 0);
    }
  });

  // This is used to force image reloads in different sessions
  // and prevent fetching CORS-tainted images from cache
  const sessionRandBuster = useRef(Math.random());
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleClear = () => {
    onClear();
  };

  return (
    <div className="h-auto w-20 rounded-lg">
      <div className="glass rounded-lg p-1.5">
        <div className="mb-2 flex w-full items-center justify-center">
          <FontAwesomeIcon
            icon={faClockRotateLeft}
            className="p-1 text-gray-400"
          />
        </div>
        <div
          ref={scrollRef}
          className={
            "scrollbar-hidden flex max-h-[50vh] flex-col items-center justify-start gap-2 overflow-y-auto"
          }
        >
          {[...imageBundles]
            .slice()
            .reverse()
            .map((bundle, index) => (
              <Fragment key={index}>
                {bundle.images.map((image) => (
                  <Button
                    key={image.mediaToken}
                    className={twMerge(
                      "relative aspect-square h-full w-full border-2 bg-transparent p-0 hover:bg-transparent hover:opacity-80",
                      selectedImageToken === image.mediaToken &&
                        "border-primary hover:opacity-100",
                    )}
                    onClick={() => {
                      onImageSelect(image);
                    }}
                  >
                    {/* TODO: Fix CORS issue here */}
                    <img
                      src={
                        image.url + "?historystack+" + sessionRandBuster.current
                      }
                      alt=""
                      crossOrigin="anonymous"
                      className="absolute inset-0 h-full w-full rounded-lg object-cover"
                    />
                  </Button>
                ))}
                {index < imageBundles.length - 1 && (
                  <hr
                    className="h-0.5 min-h-0.5 w-3/4 rounded-md border-none bg-white/15"
                    key={"hr" + index}
                  />
                )}
              </Fragment>
            ))}
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <div className="glass w-fit rounded-xl border-2 border-red/50 shadow-lg hover:border-red/80">
          <div className="relative h-full">
            <Tooltip
              content="Reset All"
              position="left"
              closeOnClick={true}
              className="ms-1 rounded-md bg-red px-3 py-1"
              delay={100}
            >
              <button
                className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-transparent text-white transition-colors hover:bg-red/50"
                onClick={() =>
                  showActionReminder({
                    reminderType: "default",
                    title: "Reset All",
                    primaryActionIcon: faTrashXmark,
                    primaryActionBtnClassName: "bg-red hover:bg-red/80",
                    message: (
                      <p className="text-sm text-white/70">
                        Are you sure you want to reset all? This will clear all
                        your work and cannot be undone.
                      </p>
                    ),
                    primaryActionText: "Reset all",
                    onPrimaryAction: () => {
                      handleClear();
                      isActionReminderOpen.value = false;
                    },
                  })
                }
              >
                <FontAwesomeIcon icon={faXmark} className="h-5 w-5 text-xl" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
