import { useState } from "react";

import { Input, Button } from "~/components/ui";
import { imageToolbar } from "~/signals";

export const ContextualToolbarForm = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label>Image Toolbar Position</label>
        <Input
          className="w-20"
          type="text"
          placeholder="X"
          value={x}
          onChange={(e) => {
            setX(parseInt(e.target.value) || 0);
          }}
        />
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
        <Button onClick={() => imageToolbar.hide()}>Hide</Button>
      </div>
    </div>
  );
};
