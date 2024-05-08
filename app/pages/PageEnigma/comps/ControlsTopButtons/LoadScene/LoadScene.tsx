import {
  useContext,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { ScenePicker, SceneTypes } from "../ScenePicker";
import { Label, LoadingSpinner } from "~/components";
import {
  GetMediaByUser,
  GetMediaListResponse,
} from "~/api/media_files/GetMediaByUser";
import {
  ListFeaturedMediaFiles,
  ListFeaturedMediaFilesResponse,
} from "~/api/media_files/ListFeaturedMediaFiles";
import { MediaInfo, MediaFileType } from "~/pages/PageEnigma/models";
import { AuthenticationContext } from "~/contexts/Authentication";
import dayjs from "dayjs";

interface LoadSceneProps {
  onSceneSelect: (token: string) => void;
}

export enum FetchStatus {
  paused,
  // ready triggers a new fetch
  ready,
  in_progress,
  success,
  error,
}

export enum Filters {
  Featured,
  Mine,
  Bookmarked,
}

export const LoadScene = ({ onSceneSelect }: LoadSceneProps) => {
  const [scenes, setScenes] = useState<SceneTypes[]>([]);
  const [featured, featuredSet] = useState<SceneTypes[]>([]);
  const { authState } = useContext(AuthenticationContext);
  const sceneLoading = useRef(false);
  const [isSceneLoading, setIsSceneLoading] = useState(true);
  const [featuredStatus, featuredStatusSet] = useState(FetchStatus.ready);

  useEffect(() => {
    if (!authState.userInfo || scenes.length || sceneLoading.current) {
      return;
    }
    sceneLoading.current = true;

    const updateScenes = (results: MediaInfo[]) =>
      results.map((scene: MediaInfo) => ({
        token: scene.token,
        name: scene.maybe_title ?? "Untitled",
        updated_at: dayjs(scene.updated_at).format("MMM D, YYYY HH:mm:ss"),
        thumbnail: scene.cover_image.maybe_cover_image_public_bucket_path
          ? scene.cover_image.maybe_cover_image_public_bucket_path
          : undefined,
      }));
    // console.log("load scene");
    GetMediaByUser(
      authState.userInfo.username,
      {},
      {
        filter_engine_categories: MediaFileType.Scene,
      },
    )
      .then((res: GetMediaListResponse) => {
        if (res.success && res.results) {
          setScenes(updateScenes(res.results));
          setIsSceneLoading(false);
        }
      })
      .catch(() => {
        return {
          success: false,
          error_reason: "Unknown error",
        };
      });
    if (featuredStatus === FetchStatus.ready) {
      featuredStatusSet(FetchStatus.in_progress);
      ListFeaturedMediaFiles(
        "",
        {},
        {
          filter_engine_categories: "scene",
          // page_index: page,
          page_size: 100,
        },
      ).then((res: ListFeaturedMediaFilesResponse) => {
        if (res.success && res.results) {
          featuredStatusSet(FetchStatus.success);
          featuredSet(updateScenes(res.results));
        }
      });
    }
  }, [featuredStatus, scenes, authState.userInfo]);

  const handleSceneSelect = (selectedScene: SceneTypes) => {
    onSceneSelect(selectedScene.token);
  };
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (element) {
      const atBottom =
        element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
      const hasOverflow = element.scrollHeight > element.clientHeight;

      setBottomGradientOpacity(hasOverflow && !atBottom ? 1 : 0);
    }
  };

  useLayoutEffect(() => {
    const element = scrollContainerRef.current;
    if (element) {
      handleScroll();
      element.addEventListener("scroll", handleScroll);

      return () => {
        element.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isSceneLoading]);

  return (
    <div className="flex flex-col gap-0.5">
      <Label>My Scenes</Label>
      <div className="relative flex max-h-[500px] min-h-[140px] flex-col">
        {isSceneLoading ? (
          <div className="flex items-center justify-center gap-3 py-12">
            <LoadingSpinner />
            <span className="font-medium opacity-70">Loading scenes...</span>
          </div>
        ) : (
          <>
            {scenes.length !== 0 || featured.length !== 0 ? (
              <div
                className="overflow-y-auto overflow-x-hidden"
                ref={scrollContainerRef}>
                <ScenePicker
                  scenes={[...scenes, ...featured]}
                  onSceneSelect={handleSceneSelect}
                  showDate={true}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 py-12">
                <span className="font-medium opacity-50">
                  You have no saved scenes yet.
                </span>
              </div>
            )}
          </>
        )}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t from-ui-panel to-transparent transition-opacity duration-200"
          style={{ opacity: bottomGradientOpacity }}
        />
      </div>
    </div>
  );
};
