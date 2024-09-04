import { useRef } from "react";
import { LoadingBar, LoadingBarStatus } from "~/components/ui";

import { ContextualToolbarImage } from "~/components/features/KonvaContainer/ContextualToolbarImage";

import { imageToolbar } from "~/signals/konva";

export const Sandbox = () => {
  const { setPosition, hide } = imageToolbar;
  const xRef = useRef(0);
  const yRef = useRef(0);

  return (
    <div>
      <h1>Sandbox</h1>
      <LoadingBar
        progress={50}
        status={LoadingBarStatus.LOADING}
        isShowing={true}
        message="Loading..."
      />

      <LoadingBar
        progress={50}
        position={{ x: 300, y: 200 }}
        status={LoadingBarStatus.LOADING}
        isShowing={true}
        message="Loading..."
      />

      <ContextualToolbarImage />

      <div className="flex items-center gap-2">
        <label>Image Toolbar Position</label>
        <input
          className="w-20 rounded-md border border-black p-2"
          type="text"
          placeholder="X"
          onChange={(e) => {
            xRef.current = parseInt(e.target.value);
          }}
        />
        <input
          className="w-20 rounded-md border border-black p-2"
          type="text"
          placeholder="Y"
          onChange={(e) => {
            yRef.current = parseInt(e.target.value);
          }}
        />
        <button
          className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
          onClick={() => setPosition({ x: xRef.current, y: yRef.current })}
        >
          Set Position
        </button>
        <button
          className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
          onClick={() => hide()}
        >
          Hide
        </button>
      </div>
    </div>
  );
};
