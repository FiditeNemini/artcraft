import { ChangeEvent, useContext, useState } from "react";

import { Textarea } from "~/components";

import { EngineContext } from "~/contexts/EngineContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from "@fortawesome/pro-solid-svg-icons";
import { RandomTexts } from "~/pages/PageEnigma/constants/RandomTexts";

export const Prompts = () => {
  const editorEngine = useContext(EngineContext);
  const [textBufferPositive, setTextBufferPositive] = useState("");
  const [textBufferNegative, setTextBufferNegative] = useState("");

  const onChangeHandlerNegative = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.negative_prompt = event.target.value;
    setTextBufferNegative(event.target.value);
  };

  const onChangeHandlerPositive = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    editorEngine.positive_prompt = event.target.value;
    setTextBufferPositive(event.target.value);
  };

  const generateRandomTextPositive = () => {
    const randomIndex = Math.floor(Math.random() * RandomTexts.length);
    const randomText = RandomTexts[randomIndex];
    setTextBufferPositive(randomText);
  };

  const generateRandomTextNegative = () => {
    const randomIndex = Math.floor(Math.random() * RandomTexts.length);
    const randomText = RandomTexts[randomIndex];
    setTextBufferNegative(randomText);
  };

  return (
    <div className="flex flex-col gap-4 rounded-t-lg bg-ui-panel py-4">
      <div className="relative w-full">
        <Textarea
          label="Enter a Prompt"
          className="mb-4 w-full"
          rows={3}
          name="positive-prompt"
          placeholder="Type here to describe your scene"
          onChange={onChangeHandlerPositive}
          resize="none"
          required
          value={textBufferPositive}
        />
        <div className="absolute right-0 top-0">
          <button
            className="text-xs text-[#FC6B68]"
            onClick={generateRandomTextPositive}>
            <FontAwesomeIcon icon={faRandom} /> Randomize
          </button>
        </div>
      </div>
      <div className="relative w-full">
        <Textarea
          label="Negative Prompt"
          className="w-full"
          rows={2}
          name="negative-prompt"
          placeholder="Type here to filter out the things you don't want in the scene"
          onChange={onChangeHandlerNegative}
          resize="none"
          value={textBufferNegative}
        />
        <div className="absolute right-0 top-0">
          <button
            className="text-xs text-[#FC6B68]"
            onClick={generateRandomTextNegative}>
            <FontAwesomeIcon icon={faRandom} /> Randomize
          </button>
        </div>
      </div>
    </div>
  );
};
