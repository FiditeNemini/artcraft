import { LowerPanel } from "~/modules/LowerPanel";
import { Button } from "~/components";
import Editor from "../../js/editor";

export const Timeline = ({
  editorCurrent,
}: {
  editorCurrent: Editor | null;
}) => {
  const handleButtonLoad = () => {
    document.getElementById("load-upload")?.click();
  };
  const handleButtonRender = () => {
    editorCurrent?.togglePlayback();
  };
  const handleButtonPlay = () => {};

  return (
    <LowerPanel>
      <div className="h-10 w-full border-b border-ui-panel-border"></div>
      <input
        style={{ display: "none" }}
        type="file"
        id="load-upload"
        name="load-upload"
      ></input>
      <Button onClick={handleButtonLoad}>Load</Button>
      <Button onClick={handleButtonRender}>Render</Button>
      <Button onClick={handleButtonPlay}>Play</Button>
    </LowerPanel>
  );
};
