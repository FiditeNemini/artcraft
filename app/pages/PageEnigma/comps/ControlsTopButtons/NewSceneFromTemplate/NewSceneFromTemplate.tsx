import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dayjs from "dayjs";

import { MediaInfo } from "~/pages/PageEnigma/models";

import { ScenePicker, SceneTypes } from "../ScenePicker";
import { ListFeaturedScenes } from "./utilities";

interface NewSceneFromTemplateProps {
  onSceneSelect: (token: string) => void;
}

export const NewSceneFromTemplate = ({
  onSceneSelect,
}: NewSceneFromTemplateProps) => {
  const [featuredScenes, setFeaturedScenes] = useState<SceneTypes[]>([]);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (featuredScenes.length > 0) {
      //only call once on mount
      return;
    }
    // Hard coded scenes
    const dummyScenes: SceneTypes[] = [
      {
        token: "m_nmzvdqr6kr8eqpmxqdzkqj0yknrjwv",
        name: "Dancing Girl",
        thumbnail: "/resources/placeholders/scene_placeholder.png",
      },
    ];

    const modMediaInfoToScenes = (results: MediaInfo[]) =>
      results.map((scene: MediaInfo) => ({
        token: scene.token,
        name: scene.maybe_title ?? "Untitled",
        updated_at: dayjs(scene.updated_at).format("MMM D, YYYY HH:mm:ss"),
        thumbnail: scene.cover_image.maybe_cover_image_public_bucket_path
          ? scene.cover_image.maybe_cover_image_public_bucket_path
          : undefined,
      }));

    ListFeaturedScenes().then((res) => {
      if (res.success && "results" in res) {
        setFeaturedScenes([
          ...modMediaInfoToScenes(res.results),
          ...dummyScenes,
        ]);
        return;
      }
      setFeaturedScenes(dummyScenes);
    });
  }, [featuredScenes]);

  const handleSceneSelect = (selectedScene: SceneTypes) => {
    onSceneSelect(selectedScene.token);
  };

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
  }, []);

  return (
    <div className="flex flex-col gap-0.5">
      <div className="relative flex max-h-[500px] min-h-[140px] flex-col">
        <div
          className="overflow-y-auto overflow-x-hidden"
          ref={scrollContainerRef}
        >
          <ScenePicker
            scenes={featuredScenes}
            onSceneSelect={handleSceneSelect}
          />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t from-ui-panel to-transparent transition-opacity duration-200"
          style={{ opacity: bottomGradientOpacity }}
        />
      </div>
    </div>
  );
};
