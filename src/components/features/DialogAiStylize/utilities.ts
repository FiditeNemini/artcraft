import { ArtStyleNames } from "./enums";
import {
  RandomTextsPositive,
  RandomTextsNegative,
} from "./data/randomTextList";

export const generateRandomTextPositive = (artStyleName: ArtStyleNames) => {
  const randomIndex = Math.floor(
    Math.random() * RandomTextsPositive[artStyleName].length,
  );
  const randomText = RandomTextsPositive[artStyleName][randomIndex];
  return randomText;
};

export const generateRandomTextNegative = (artStyleName: ArtStyleNames) => {
  const randomIndex = Math.floor(
    Math.random() * RandomTextsNegative[artStyleName].length,
  );
  const randomText = RandomTextsNegative[artStyleName][randomIndex];
  return randomText;
};
