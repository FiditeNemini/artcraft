import { useEffect, useMemo, useState } from "react";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  CHARACTER_MIXAMO_FILE_TYPE,
  CHARACTER_MMD_FILE_TYPE,
  FeatureFlags,
  FilterEngineCategories,
  MediaFileAnimationType,
} from "~/enums";
import { MediaItem } from "~/pages/PageEnigma/models";
import {
  Button,
  FilterButtons,
  Pagination,
  SearchFilter,
  UploadModal,
} from "~/components";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import { isAnyStatusFetching } from "../../utilities";
import {
  useUserObjects,
  useFeaturedObjects,
  useSearchFeaturedObjects,
  useSearchUserdObjects,
} from "../../hooks";
import {
  filterMixamoCharacters,
  filterMMDCharacters,
} from "./filterCharacterTypes";

const filterEngineCategories = [FilterEngineCategories.CHARACTER];

export const CharactersTab = ({
  animationType,
  demoCharacterItems = [],
}: {
  animationType: MediaFileAnimationType;
  demoCharacterItems?: MediaItem[];
}) => {
  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );
  const showUploadButton = usePosthogFeatureFlag(FeatureFlags.DEV_ONLY);

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const { userObjects, userFetchStatus, fetchUserObjects } = useUserObjects({
    filterEngineCategories: filterEngineCategories,
    defaultErrorMessage: "Unknown Error in Fetching User Characters",
  });
  const { featuredObjects, featuredFetchStatus } = useFeaturedObjects({
    filterEngineCategories: filterEngineCategories,
    defaultErrorMessage: "Unknown Error in Fetching Featured Characters",
  });
  const {
    searchTermForFeaturedObjects,
    featuredObjectsSearchResults,
    featuredObjectsSearchFetchStatus,
    updateSearchTermForFeaturedObjects,
  } = useSearchFeaturedObjects({
    demoFeaturedObjects: demoCharacterItems,
    filterEngineCategories: filterEngineCategories,
    defaultErrorMessage:
      "Unknown Error in Fetching Featured Characters Search Results",
  });

  const {
    searchTermForUserObjects,
    userObjectsSearchResults,
    userObjectsSearchFetchStatus,
    updateSearchTermForUserObjects,
  } = useSearchUserdObjects({
    filterEngineCategories: filterEngineCategories,
    defaultErrorMessage:
      "Unknown Error in Fetching User Characters Search Results",
  });

  const [filterOwnership, setFilterOwnership] = useState(
    AssetFilterOption.FEATURED,
  );
  const filterCharacterType = useMemo(
    () =>
      animationType === MediaFileAnimationType.Mixamo
        ? filterMixamoCharacters
        : filterMMDCharacters,
    [animationType],
  );
  const displayedItems =
    filterOwnership === AssetFilterOption.FEATURED
      ? searchTermForFeaturedObjects
        ? featuredObjectsSearchResults ?? []
        : [...(demoCharacterItems ?? []), ...(featuredObjects ?? [])]
      : searchTermForUserObjects
        ? userObjectsSearchResults ?? []
        : userObjects ?? [];
  const filteredDisplayItems = displayedItems.filter(filterCharacterType);

  const [currentPage, setCurrentPage] = useState<number>(0);
  const pageSize = 21;
  const totalPages = Math.ceil(filteredDisplayItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredObjectsSearchFetchStatus,
    userObjectsSearchFetchStatus,
  ]);

  useEffect(() => {
    if (searchTermForUserObjects.length > 0) {
      setCurrentPage(0);
    }
  }, [searchTermForUserObjects]);

  useEffect(() => {
    if (searchTermForFeaturedObjects.length > 0) {
      setCurrentPage(0);
    }
  }, [searchTermForFeaturedObjects]);

  return (
    <>
      <div>
        <FilterButtons
          value={filterOwnership}
          onClick={(button) => {
            setFilterOwnership(Number(button));
            setCurrentPage(0);
          }}
        />
      </div>
      <div className="flex w-full flex-col gap-3 px-4">
        {showUploadButton && (
          <Button
            icon={faCirclePlus}
            variant="action"
            onClick={() => setOpenUploadModal(true)}
            className="w-full py-3 text-sm font-medium"
          >
            Upload Character (Dev Only)
          </Button>
        )}
        {showSearchObjectComponent && (
          <SearchFilter
            searchTerm={
              filterOwnership === AssetFilterOption.FEATURED
                ? searchTermForFeaturedObjects
                : searchTermForUserObjects
            }
            onSearchChange={
              filterOwnership === AssetFilterOption.FEATURED
                ? updateSearchTermForFeaturedObjects
                : updateSearchTermForUserObjects
            }
            key={filterOwnership}
            placeholder={
              filterOwnership === AssetFilterOption.FEATURED
                ? "Search featured characters"
                : "Search my characters"
            }
          />
        )}
      </div>
      <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
        <ItemElements
          busy={isFetching}
          debug="characters tab"
          currentPage={currentPage}
          pageSize={pageSize}
          items={filteredDisplayItems}
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
      <UploadModal
        onClose={() => setOpenUploadModal(false)}
        onSuccess={fetchUserObjects}
        isOpen={openUploadModal}
        type={FilterEngineCategories.CHARACTER}
        options={{
          hasThumbnailUpload: true,
          fileSubtypes: [
            { [animationType]: animationType },
            // { Mixamo: MediaFileAnimationType.Mixamo },
            // { MikuMikuDance: MediaFileAnimationType.MikuMikuDance },
            // { MoveAi: MediaFileAnimationType.MoveAi },
            // { Rigify: MediaFileAnimationType.Rigify },
            // { Rokoko: MediaFileAnimationType.Rokoko },
          ],
        }}
        fileTypes={Object.values(
          animationType === MediaFileAnimationType.Mixamo
            ? CHARACTER_MIXAMO_FILE_TYPE
            : CHARACTER_MMD_FILE_TYPE,
        )}
        title="Upload Characters"
      />
    </>
  );
};
