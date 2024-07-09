import { useCallback, useEffect, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import {
  AssetFilterOption,
  FilterEngineCategories,
  IMAGE_FILE_TYPE,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";

import {
  Button,
  FilterButtons,
  Pagination,
  UploadModalImages,
} from "~/components";

import {
  TabTitle,
  ItemElements,
} from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";

import {
  fetchFeaturedMediaItems,
  fetchUserMediaItems,
  FetchMediaItemStates,
  isAnyStatusFetching,
} from "../utilities";

export const ImagePlanesTab = () => {
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [{ mediaItems: userImages, status: userFetchStatus }, setUserFetch] =
    useState<FetchMediaItemStates>({
      mediaItems: undefined,
      status: FetchStatus.READY,
    });
  const [
    { mediaItems: featuredImages, status: feateredFetchStatus },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const [selectedFilter, setSelectedFilter] = useState(AssetFilterOption.MINE);
  const diasplayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? featuredImages ?? []
      : userImages ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(diasplayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    feateredFetchStatus,
  ]);

  const fetchUserImages = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.IMAGE_PLANE],
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Images",
      }),
    [],
  );

  const fetchFeaturedImages = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.IMAGE_PLANE],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Images",
      }),
    [],
  );

  useEffect(() => {
    if (!userImages) {
      fetchUserImages();
    }
    if (!featuredImages) {
      fetchFeaturedImages();
    }
  }, [userImages, fetchUserImages, featuredImages, fetchFeaturedImages]);

  return (
    <>
      <TabTitle title="Image Panels" />

      <FilterButtons
        value={selectedFilter}
        onClick={(buttonIdx) => {
          setSelectedFilter(Number(buttonIdx));
        }}
      />

      <div className="w-full px-4">
        <Button
          icon={faCirclePlus}
          variant="action"
          onClick={() => setOpenUploadModal(true)}
          className="w-full py-3 text-sm font-medium"
        >
          Upload Image Panels
        </Button>
      </div>
      <div className="w-full grow overflow-y-auto px-4 pb-4">
        <ItemElements
          busy={isFetching}
          currentPage={currentPage}
          pageSize={pageSize}
          items={diasplayedItems}
        />
      </div>
      {totalPages > 1 && (
        <Pagination
          className="-mt-4 px-4"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(newPage: number) => {
            setCurrentPage(newPage);
          }}
        />
      )}
      <UploadModalImages
        onClose={() => setOpenUploadModal(false)}
        onSuccess={fetchUserImages}
        isOpen={openUploadModal}
        fileTypes={Object.values(IMAGE_FILE_TYPE)}
        title="Upload Image Panels"
        type={FilterEngineCategories.IMAGE_PLANE}
      />
    </>
  );
};
