import { useContext, useState, useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  characterFilter,
  characterItems,
  objectFilter,
  objectItems,
} from "~/pages/PageEnigma/store";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { Button } from "~/components";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { shapeItems } from "~/pages/PageEnigma/store";
import { GetMediaByUser, GetMediaListResponse } from "~/api/media_files/GetMediaByUser";
import { AssetFilterOption, AssetType, MediaItem } from "~/pages/PageEnigma/models";
import { BucketConfig } from "~/api/BucketConfig";
import { AuthenticationContext } from "~/contexts/Authentication";

interface Props {
  type: AssetType;
}

export enum FetchStatus {
  paused,
  ready,
  in_progress,
  success,
  error
}

export const ObjectsTab = ({ type }: Props) => {
  useSignals();
  const [objects,objectsSet] = useState<{ value: MediaItem[] }>({ 
    value:[{
      media_id: "",
      name: "",
      type: "",
      version: 1,
    }]
  });

  const { authState } = useContext(AuthenticationContext);

  const [status,statusSet] = useState(FetchStatus.ready);

  useEffect(() => {
    if (status === FetchStatus.ready && type !== AssetType.CHARACTER) {
      statusSet(FetchStatus.in_progress);
      GetMediaByUser(authState.userInfo.username,{},{
        filter_media_type: "glb"
      })
      .then((res: GetMediaListResponse) => {
        if (res.success && res.results) {
          statusSet(FetchStatus.success);
          objectsSet({
            value: res.results.map((item,i) => {
              let bucketConfig = new BucketConfig();
              let itemThumb = bucketConfig.getCdnUrl(item.cover_image.maybe_cover_image_public_bucket_path,600,100);
              return {
                media_id: item.token,
                name: item.maybe_title,
                type: item.media_type,
                version: 1,
                ...item.cover_image.maybe_cover_image_public_bucket_path ? {
                  thumbnail: itemThumb
                } : {}
              }
            })
          });
        }
      });
    }
  },[status,type]);

  const assetFilter =
    type === AssetType.CHARACTER ? characterFilter : objectFilter;
  const items = type === AssetType.CHARACTER ? characterItems : objects;

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="mb-4 mt-4 flex justify-start gap-2 px-4">
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.ALL ? "active" : "",
              "disabled",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.ALL)}
          >
            All
          </button>
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.MINE ? "active" : "",
              "disabled",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.MINE)}
            disabled={!items.value.some((item) => item.isMine)}
          >
            My {type === AssetType.CHARACTER ? "Characters" : "Objects"}
          </button>
          <button
            className={twMerge(
              "filter-tab",
              assetFilter.value === AssetFilterOption.BOOKMARKED
                ? "active"
                : "",
              "disabled",
            )}
            onClick={() => (assetFilter.value = AssetFilterOption.BOOKMARKED)}
            disabled={!items.value.some((item) => item.isBookmarked)}
          >
            Bookmarked
          </button>
        </div>
      </div>
      <div className="w-full px-4 pb-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          className="w-full py-3 text-sm font-medium"
        >
          Upload {type === AssetType.CHARACTER ? "Character" : "Object"}
        </Button>
      </div>
      <div className="h-full w-full overflow-y-auto px-4">
        <ItemElements items={[ ...type !== AssetType.CHARACTER ? shapeItems.value : [], ...items.value ]} assetFilter={assetFilter.value} />
      </div>
    </>
  );
};