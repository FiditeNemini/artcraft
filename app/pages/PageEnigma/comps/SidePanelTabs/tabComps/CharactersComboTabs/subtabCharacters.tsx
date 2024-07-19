import { useCallback, useEffect, useMemo, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { faCirclePlus } from "@fortawesome/pro-solid-svg-icons";
import {
  AssetFilterOption,
  CHARACTER_MIXAMO_FILE_TYPE,
  CHARACTER_MMD_FILE_TYPE,
  FeatureFlags,
  FilterEngineCategories,
  MediaFileAnimationType,
} from "~/enums";
import { FetchStatus } from "~/pages/PageEnigma/enums";
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
import {
  fetchFeaturedMediaItems,
  fetchFeaturedMediaItemsSearchResults,
  FetchMediaItemStates,
  fetchUserMediaItems,
  fetchUserMediaItemsSearchResults,
  isAnyStatusFetching,
} from "../../utilities";
import {
  filterMixamoCharacters,
  filterMMDCharacters,
} from "./filterCharacterTypes";

export const CharactersTab = ({
  animationType,
  demoCharacterItems = [],
}: {
  animationType: MediaFileAnimationType;
  demoCharacterItems?: MediaItem[];
}) => {
  useSignals();

  const showSearchObjectComponent = usePosthogFeatureFlag(
    FeatureFlags.SHOW_SEARCH_OBJECTS,
  );
  const showUploadButton = usePosthogFeatureFlag(FeatureFlags.DEV_ONLY);
  const filterCharacterType = useMemo(
    () =>
      animationType === MediaFileAnimationType.Mixamo
        ? filterMixamoCharacters
        : filterMMDCharacters,
    [animationType],
  );

  const [openUploadModal, setOpenUploadModal] = useState(false);

  const [searchTermFeatured, setSearchTermFeatured] = useState("");
  const [searchTermUser, setSearchTermUser] = useState("");

  const [
    { mediaItems: userCharacters, status: userFetchStatus },
    setUserFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredCharacters, status: featuredFetchStatus },
    setFeaturedFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: featuredSearchResults, status: featuredSearchFetchStatus },
    setFeaturedSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });
  const [
    { mediaItems: userSearchResults, status: userSearchFetchStatus },
    setUserSearchFetch,
  ] = useState<FetchMediaItemStates>({
    mediaItems: undefined,
    status: FetchStatus.READY,
  });

  const [selectedFilter, setSelectedFilter] = useState(
    AssetFilterOption.FEATURED,
  );
  const allFeaturedCharacters = [
    ...demoCharacterItems,
    ...(featuredCharacters ?? []),
  ];
  const displayedItems =
    selectedFilter === AssetFilterOption.FEATURED
      ? allFeaturedCharacters ?? []
      : userCharacters ?? [];

  const [currentPage, setCurrentPage] = useState<number>(0);

  const pageSize = 21;
  const totalPages = Math.ceil(displayedItems.length / pageSize);

  const isFetching = isAnyStatusFetching([
    userFetchStatus,
    featuredFetchStatus,
    featuredSearchFetchStatus,
    userSearchFetchStatus,
  ]);

  const fetchUserCharacters = useCallback(
    () =>
      fetchUserMediaItems({
        filterEngineCategories: [FilterEngineCategories.CHARACTER],
        setState: (newState: FetchMediaItemStates) => {
          const filterNewMediaItems = newState.mediaItems
            ? newState.mediaItems.filter(filterCharacterType)
            : undefined;
          setUserFetch((curr) => ({
            status: newState.status,
            mediaItems: filterNewMediaItems
              ? filterNewMediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching User Characters",
      }),
    [filterCharacterType],
  );

  const fetchFeaturedCharacters = useCallback(
    () =>
      fetchFeaturedMediaItems({
        filterEngineCategories: [FilterEngineCategories.CHARACTER],
        setState: (newState: FetchMediaItemStates) => {
          const filterNewMediaItems = newState.mediaItems
            ? newState.mediaItems.filter(filterCharacterType)
            : undefined;
          setFeaturedFetch((curr) => ({
            status: newState.status,
            mediaItems: filterNewMediaItems
              ? filterNewMediaItems
              : curr.mediaItems,
          }));
        },
        defaultErrorMessage: "Unknown Error in Fetching Featured Characters",
      }),
    [filterCharacterType],
  );

  const fetchFeaturedSearchResults = useCallback(
    async (searchTerm: string) => {
      const filterCharacterItems = (searchTerm: string) =>
        demoCharacterItems.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const filteredCharacterItems = filterCharacterItems(searchTerm);
      fetchFeaturedMediaItemsSearchResults({
        filterEngineCategories: [FilterEngineCategories.CHARACTER],
        setState: (newState: FetchMediaItemStates) => {
          setFeaturedSearchFetch(() => ({
            status: newState.status,
            mediaItems: newState.mediaItems
              ? [...filteredCharacterItems, ...newState.mediaItems]
              : filteredCharacterItems,
          }));
        },
        defaultErrorMessage:
          "Unknown Error in Fetching Featured Characters Search Results",
        searchTerm: searchTerm,
      });
    },
    [demoCharacterItems],
  );

  const fetchUserSearchResults = useCallback(async (searchTerm: string) => {
    fetchUserMediaItemsSearchResults({
      filterEngineCategories: [FilterEngineCategories.CHARACTER],
      setState: (newState: FetchMediaItemStates) => {
        setUserSearchFetch((curr) => ({
          status: newState.status,
          mediaItems: newState.mediaItems
            ? newState.mediaItems
            : curr.mediaItems,
        }));
      },
      defaultErrorMessage:
        "Unknown Error in Fetching User Characters Search Results",
      searchTerm: searchTerm,
    });
  }, []);

  useEffect(() => {
    if (!userCharacters) {
      fetchUserCharacters();
    }
    if (!featuredCharacters) {
      fetchFeaturedCharacters();
    }
  }, [
    userCharacters,
    fetchUserCharacters,
    featuredCharacters,
    fetchFeaturedCharacters,
  ]);

  useEffect(() => {
    if (selectedFilter === AssetFilterOption.FEATURED) {
      setCurrentPage(0);
      fetchFeaturedSearchResults(searchTermFeatured);
    } else if (selectedFilter === AssetFilterOption.MINE) {
      setCurrentPage(0);
      fetchUserSearchResults(searchTermUser);
    }
  }, [
    searchTermFeatured,
    searchTermUser,
    fetchFeaturedSearchResults,
    fetchUserSearchResults,
    selectedFilter,
  ]);

  return (
    <>
      {/* <TabTitle title="Characters" /> */}
      <div>
        <FilterButtons
          value={selectedFilter}
          onClick={(button) => {
            setSelectedFilter(Number(button));
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
            Upload Character Model (Dev Only)
          </Button>
        )}
        {showSearchObjectComponent && (
          <SearchFilter
            searchTerm={
              selectedFilter === AssetFilterOption.FEATURED
                ? searchTermFeatured
                : searchTermUser
            }
            onSearchChange={
              selectedFilter === AssetFilterOption.FEATURED
                ? setSearchTermFeatured
                : setSearchTermUser
            }
            key={selectedFilter}
            placeholder={
              selectedFilter === AssetFilterOption.FEATURED
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
          items={
            selectedFilter === AssetFilterOption.FEATURED
              ? searchTermFeatured
                ? featuredSearchResults ?? []
                : displayedItems
              : searchTermUser
                ? userSearchResults ?? []
                : displayedItems
          }
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
        onSuccess={fetchUserCharacters}
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
