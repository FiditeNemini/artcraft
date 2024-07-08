import { useCallback, useEffect, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";

import {
  AssetFilterOption,
  FilterEngineCategories,
  IMAGE_FILE_TYPE,
  OBJECT_FILE_TYPE,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";

import {
  Button,
  FilterButtons,
  Pagination,
  UploadModal3DPreview,
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

export const SetsTab = () => {
  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [
    { mediaItems: userSetObjects, status: userFetchStatus },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredSetObjects, status: feateredFetchStatus },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const diasplayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? featuredSetObjects ?? []
      : userSetObjects ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(diasplayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    feateredFetchStatus,
  ]);

  const fetchUserSetObjects = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [
          FilterEngineCategories.OBJECT,
          FilterEngineCategories.IMAGE_PLANE,
        ],
        setState: (newState: FetchMediaItemStates) => {
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Set Objects",
      }),
    [],
  );

  const fetchFeaturedSetObjects = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.OBJECT],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? newState.mediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Set Objects",
      }),
    [],
  );

  useEffect(() => {
    if (!userSetObjects) {
      fetchUserSetObjects();
    }
    if (!featuredSetObjects) {
      fetchFeaturedSetObjects();
    }
  }, [
    userSetObjects,
    fetchUserSetObjects,
    featuredSetObjects,
    fetchFeaturedSetObjects,
  ]);

  return (
    <>
      <TabTitle title="Film Sets" />

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
          Upload Set Objects
        </Button>
      </div>
      <div className="w-full grow overflow-y-auto px-4 pb-4">
        <ItemElements
          busy={isFetching}
          debug="animations tab"
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
      <UploadModal3DPreview
        onClose={() => setOpenUploadModal(false)}
        onSuccess={fetchUserSetObjects}
        isOpen={openUploadModal}
        fileTypes={[
          ...Object.values(OBJECT_FILE_TYPE),
          "PMD",
          ...Object.values(IMAGE_FILE_TYPE),
        ]}
        title="Upload Set Objects"
        type={FilterEngineCategories.OBJECT}
      />
    </>
  );
};
