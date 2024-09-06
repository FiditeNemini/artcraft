import { useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { Input, Button } from "~/components/ui";
import { uiAccess } from "~/signals";

import { ToolbarImageButtonData } from "~/components/features/ToolbarImage/data";

export const ContextualToolbarForm = () => {
  useSignals();
  const imageToolbar = uiAccess.imageToolbar;

  const {
    isShowing,
    disabled: allDisabled,
    buttonStates,
    buttonCallbacks,
  } = imageToolbar.signal.value;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-bold">Image Toolbar Props</label>
      <p className="-mt-2 pb-1">
        toolbar setup is assumed, in real implementation you may want to start
        with the setup function instead
      </p>
      <div className="flex items-center gap-2">
        <label>X:</label>
        <Input
          className="w-20"
          type="text"
          placeholder="X"
          value={x}
          onChange={(e) => {
            setX(parseInt(e.target.value) || 0);
          }}
        />
        <label>Y:</label>
        <Input
          className="w-20"
          type="text"
          placeholder="Y"
          value={y}
          onChange={(e) => {
            setY(parseInt(e.target.value) || 0);
          }}
        />
        <Button
          onClick={() =>
            imageToolbar.setPosition({
              x: x,
              y: y,
            })
          }
        >
          Set Position
        </Button>
        <Button disabled={isShowing} onClick={() => imageToolbar.show()}>
          Show
        </Button>

        <Button disabled={!isShowing} onClick={() => imageToolbar.hide()}>
          Hide
        </Button>
        <Button
          onClick={() => {
            const exec = allDisabled
              ? imageToolbar.enable
              : imageToolbar.disable;
            exec();
          }}
        >
          {allDisabled ? "Enable" : "Disable"}
        </Button>
      </div>
      <div className="flex gap-2">
        {Object.values(ToolbarImageButtonData).map((button) => (
          <Button
            key={button.name}
            icon={button.icon}
            variant={
              buttonStates[button.name].disabled ? "secondary" : "primary"
            }
            onClick={() =>
              imageToolbar.changeButtonState(
                button.name,
                !buttonStates[button.name].disabled,
              )
            }
          >
            <span className="w-12">
              {buttonStates[button.name].disabled ? "Enable" : "Disable"}
            </span>
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {Object.values(ToolbarImageButtonData).map((button) => (
          <Button
            key={button.name}
            icon={button.icon}
            variant="primary"
            disabled={buttonCallbacks[button.name] !== undefined}
            onClick={() =>
              imageToolbar.changeButtonCallback(button.name, () => {
                console.log(`${button.name} clicked`);
              })
            }
          >
            <span className="w-12">Bind</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
