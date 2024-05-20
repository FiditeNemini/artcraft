import { ChangeEvent, useContext, useEffect, useState } from "react";

import { Textarea } from "~/components";

import { EngineContext } from "~/pages/PageEnigma/contexts/EngineContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRandom } from "@fortawesome/pro-solid-svg-icons";
import {
  RandomTextsPositive,
  RandomTextsNegative,
} from "~/pages/PageEnigma/constants/RandomTexts";
import { ArtStyle } from "~/pages/PageEnigma/Editor/api_manager";

interface Props {
  selection: ArtStyle;
}

export const Prompts = ({ selection }: Props) => {
  const editorEngine = useContext(EngineContext);
  const [textBufferPositive, setTextBufferPositive] = useState("");
  const [textBufferNegative, setTextBufferNegative] = useState("");

  const [isUserInputPositive, setIsUserInputPositive] = useState(false);
  const [isUserInputNegative, setIsUserInputNegative] = useState(false);

  useEffect(() => {
    if (editorEngine === null) {
      return;
    }

    if (!isUserInputPositive) {
      const randomIndexPositive = Math.floor(
        Math.random() * RandomTextsPositive[selection].length,
      );
      const randomTextPositive =
        RandomTextsPositive[selection][randomIndexPositive];
      editorEngine.positive_prompt = randomTextPositive;
      setTextBufferPositive(randomTextPositive);
    }

    if (!isUserInputNegative) {
      const randomIndexNegative = Math.floor(
        Math.random() * RandomTextsNegative[selection].length,
      );
      const randomTextNegative =
        RandomTextsNegative[selection][randomIndexNegative];
      editorEngine.negative_prompt = randomTextNegative;
      setTextBufferNegative(randomTextNegative);
    }
  }, [selection, editorEngine, isUserInputPositive, isUserInputNegative]);

  const onChangeHandlerNegative = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (editorEngine === null) {
      console.log("Editor is null");
      return;
    }
    setIsUserInputNegative(true);
    editorEngine.negative_prompt = event.target.value;
    setTextBufferNegative(event.target.value);
  };

  const onChangeHandlerPositive = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (editorEngine == null) {
      console.log("Editor is null");
      return;
    }
    setIsUserInputPositive(true);
    editorEngine.positive_prompt = event.target.value;
    setTextBufferPositive(event.target.value);
  };

  const generateRandomTextPositive = () => {
    const randomIndex = Math.floor(
      Math.random() * RandomTextsPositive[selection].length,
    );
    const randomText = RandomTextsPositive[selection][randomIndex];
    if (editorEngine !== null) {
      editorEngine.positive_prompt = randomText;
    }
    setIsUserInputPositive(false);
    setTextBufferPositive(randomText);
  };

  const generateRandomTextNegative = () => {
    const randomIndex = Math.floor(
      Math.random() * RandomTextsNegative[selection].length,
    );
    const randomText = RandomTextsNegative[selection][randomIndex];
    if (editorEngine !== null) {
      editorEngine.negative_prompt = randomText;
    }
    setIsUserInputNegative(false);
    setTextBufferNegative(randomText);
  };

  return (
    <div className="flex flex-col gap-3 rounded-t-lg bg-ui-panel px-4">
      <div className="relative w-full">
        <Textarea
          label="Enter a Prompt"
          className="w-full"
          rows={2}
          name="positive-prompt"
          placeholder="Type here to describe your scene"
          onChange={onChangeHandlerPositive}
          resize="none"
          required
          value={textBufferPositive}
        />
        <div className="absolute right-0 top-[2px]">
          <button
            className="flex items-center text-xs font-medium text-[#FC6B68] transition-colors duration-100 hover:text-[#FC6B68]/85 "
            onClick={generateRandomTextPositive}
          >
            <FontAwesomeIcon icon={faRandom} className="me-2" />
            Randomize
          </button>
        </div>
      </div>
      <div className="relative w-full">
        <Textarea
          label="Negative Prompt"
          className="w-full"
          rows={1}
          name="negative-prompt"
          placeholder="Type here to filter out the things you don't want in the scene"
          onChange={onChangeHandlerNegative}
          resize="none"
          value={textBufferNegative}
        />
        <div className="absolute right-0 top-[2px]">
          <button
            className="flex items-center text-xs font-medium text-[#FC6B68] transition-colors duration-100 hover:text-[#FC6B68]/85"
            onClick={generateRandomTextNegative}
          >
            <FontAwesomeIcon icon={faRandom} className="me-2" />
            Randomize
          </button>
        </div>
      </div>
    </div>
  );
};
