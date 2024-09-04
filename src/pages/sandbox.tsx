import { useRef } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { ContextualToolbarImage } from "~/components/features/KonvaContainer/ContextualToolbarImage";
import { ContextualLoadingBar } from "~/components/features/KonvaContainer/ContextualLoadingBar";

import { LoadingBarStatus } from "~/components/ui/LoadingBar";

import {
  imageToolbar,
  loadingBar,
  ContextualLoadingBarProps,
} from "~/signals/konvaContextuals";

export const Sandbox = () => {
  const xImageToolbarRef = useRef(0);
  const yImageToolbarRef = useRef(0);

  const loadingBarPropsRef = useRef<ContextualLoadingBarProps>({
    position: {
      x: 0,
      y: 0,
    },
    progress: 0,
    status: LoadingBarStatus.IDLE,
    isShowing: true,
    message: "Loading...",
  });

  return (
    <div className="p-2">
      <ContextualToolbarImage />
      <ContextualLoadingBar />
      <h1>Sandbox</h1>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label>Image Toolbar Position</label>
          <input
            className="w-20 rounded-md border border-black p-2"
            type="text"
            placeholder="X"
            onChange={(e) => {
              xImageToolbarRef.current = parseInt(e.target.value);
            }}
          />
          <input
            className="w-20 rounded-md border border-black p-2"
            type="text"
            placeholder="Y"
            onChange={(e) => {
              yImageToolbarRef.current = parseInt(e.target.value);
            }}
          />
          <button
            className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
            onClick={() =>
              imageToolbar.setPosition({
                x: xImageToolbarRef.current,
                y: yImageToolbarRef.current,
              })
            }
          >
            Set Position
          </button>
          <button
            className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
            onClick={() => imageToolbar.hide()}
          >
            Hide
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label>Loading Bar Props</label>
            <input
              className="w-20 rounded-md border border-black p-2"
              type="text"
              placeholder="X"
              onChange={(e) => {
                loadingBarPropsRef.current.position.x = parseInt(
                  e.target.value,
                );
              }}
            />
            <input
              className="w-20 rounded-md border border-black p-2"
              type="text"
              placeholder="Y"
              onChange={(e) => {
                loadingBarPropsRef.current.position.y = parseInt(
                  e.target.value,
                );
              }}
            />
            <input
              className="w-20 rounded-md border border-black p-2"
              type="number"
              min={0}
              max={100}
              placeholder="%"
              onChange={(e) => {
                loadingBarPropsRef.current.progress = parseInt(e.target.value);
              }}
            />
            <button
              className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
              onClick={() =>
                loadingBar.show({
                  status: LoadingBarStatus.LOADING,
                  progress: loadingBarPropsRef.current.progress,
                  message: "Test Message...",
                  position: {
                    x: loadingBarPropsRef.current.position.x,
                    y: loadingBarPropsRef.current.position.y,
                  },
                })
              }
            >
              Show
            </button>
            <button
              className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
              onClick={() =>
                loadingBar.update({
                  status: LoadingBarStatus.LOADING,
                  progress: loadingBarPropsRef.current.progress,
                  message: loadingBarPropsRef.current.message,
                  position: {
                    x: loadingBarPropsRef.current.position.x,
                    y: loadingBarPropsRef.current.position.y,
                  },
                })
              }
            >
              Update
            </button>
            <button
              className="rounded-md border border-black bg-gray-200 p-2 hover:bg-gray-300"
              onClick={() => loadingBar.hide()}
            >
              Hide
            </button>
          </div>
          <PrintLoadingBarProps />
        </div>
      </div>
    </div>
  );
};

const PrintLoadingBarProps = () => {
  useSignals();
  return (
    <>
      <p>Status: {loadingBar.signal.value.status}</p>
      <p>Message: {loadingBar.signal.value.message}</p>
    </>
  );
};
