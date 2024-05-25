import { useEffect, useState } from "react";
import {
  GetMedia,
  MediaFile,
} from "@storyteller/components/src/api/media_files/GetMedia";
import {
  GetPrompts,
  Prompt,
} from "@storyteller/components/src/api/prompts/GetPrompts";
import { DeleteMedia } from "@storyteller/components/src/api/media_files/DeleteMedia";
import { FetchStatus } from "@storyteller/components/src/api/_common/SharedFetchTypes";
import { usePrevious } from "hooks";

export default function useMedia({
  mediaToken = "",
  onSuccess = (res: MediaFile) => {},
  onRemove = (res: any) => {},
}) {
  const [status, statusSet] = useState(FetchStatus.ready);
  const [writeStatus, writeStatusSet] = useState(FetchStatus.paused);
  const [media, mediaSet] = useState<MediaFile | undefined>();
  const [prompt, promptSet] = useState<Prompt | undefined>();
  const remove = (as_mod: boolean) => {
    writeStatusSet(FetchStatus.in_progress);
    DeleteMedia(mediaToken, {
      as_mod,
      set_delete: true,
    }).then((res: any) => {
      writeStatusSet(FetchStatus.success);
      onRemove(res);
    });
  };

  const previousToken = usePrevious(mediaToken);

  const reload = () => {
    statusSet(FetchStatus.ready);
    mediaSet(undefined);
  };

  useEffect(() => {
    if (
      status === FetchStatus.ready &&
      mediaToken &&
      (!media || previousToken !== mediaToken)
    ) {
      statusSet(FetchStatus.in_progress);
      GetMedia(mediaToken, {})
        .then(res => {
          if (res.success && res.media_file) {
            statusSet(FetchStatus.success);
            onSuccess(res.media_file);
            mediaSet(res.media_file);
            if (res.media_file.maybe_prompt_token) {
              GetPrompts(res.media_file.maybe_prompt_token, {}).then(
                promptRes => {
                  if (promptRes.prompt) {
                    promptSet(promptRes.prompt);
                  }
                }
              );
            }
          }
        })
        .catch(err => {
          statusSet(FetchStatus.error);
        });
    }

    if (media && media.token !== mediaToken) {
      mediaSet(undefined);
      statusSet(FetchStatus.ready);
    }
  }, [media, mediaToken, previousToken, prompt, onSuccess, status, statusSet]);

  return {
    media,
    mediaFile: media,
    mediaSet,
    prompt,
    remove,
    reload,
    status,
    writeStatus,
  };
}
