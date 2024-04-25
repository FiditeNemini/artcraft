import { useEffect, useRef, useState } from "react";
import { ScenePicker, SceneTypes } from "../ScenePicker";

interface NewSceneFromTemplateProps {
  onSceneSelect: (token: string) => void;
}

export const NewSceneFromTemplate = ({
  onSceneSelect,
}: NewSceneFromTemplateProps) => {
  // Dummy Data - replace with API data
  const dummyScenes: SceneTypes[] = [
    {
      token: "m_9pf7a7v0138zx58f4x6ejsehjcvfq6",
      name: "Dragon",
      thumbnail: "/resources/placeholders/scene_placeholder.png",
    },
    {
      token: "m_nmzvdqr6kr8eqpmxqdzkqj0yknrjwv",
      name: "Dancing Girl",
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
      <div className="relative flex max-h-[500px] flex-col">
        <div
          className="overflow-y-auto overflow-x-hidden"
          ref={scrollContainerRef}>
          <ScenePicker scenes={dummyScenes} onSceneSelect={handleSceneSelect} />
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-10 bg-gradient-to-t from-ui-panel to-transparent transition-opacity duration-200"
          style={{ opacity: bottomGradientOpacity }}
        />
      </div>
    </div>
  );
};
