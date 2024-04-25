import { useEffect, useRef, useState } from "react";
import { ScenePicker, SceneTypes } from "../ScenePicker";
import { Label } from "~/components";

interface LoadSceneProps {
  onSceneSelect: (token: string) => void;
}

export const LoadScene = ({ onSceneSelect }: LoadSceneProps) => {
  // Dummy Data - replace with API data
  const dummyScenes: SceneTypes[] = [
    {
      token: "111",
      name: "Dragon",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "222",
      name: "Dancing Girl",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "333",
      name: "Dragon",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "444",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "555",
      name: "Dragon",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "666",
      name: "Dancing Girl",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "777",
      name: "Dragon",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "888",
      name: "Dancing Girl",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "999",
      name: "Dragon",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "000",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "0001",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "0002",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "0003",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "0004",
      name: "Home Office",
      updated_at: "Apr 03, 2024 14:24:48",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
  ];

  const handleSceneSelect = (selectedScene: SceneTypes) => {
    onSceneSelect(selectedScene.token);
  };
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (element) {
      const atBottom =
        element.scrollHeight - element.scrollTop === element.clientHeight;
      const hasOverflow = element.scrollHeight > element.clientHeight;

      setBottomGradientOpacity(hasOverflow && !atBottom ? 1 : 0);
    }
  };

  useEffect(() => {
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
      <Label>My Scenes</Label>
      <div className="relative flex max-h-[500px] flex-col">
        <div
          className="overflow-y-auto overflow-x-hidden"
          ref={scrollContainerRef}>
          <ScenePicker
            scenes={dummyScenes}
            onSceneSelect={handleSceneSelect}
            showDate={true}
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
