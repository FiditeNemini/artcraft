import { ModelCreator } from "src/index.js";
import { Model } from "./Model.js";
import { ModelCategory } from "../ModelConfig.js";

export class ImageModel extends Model {
  constructor(args: {
    id: string;
    tauriId: string;
    fullName: string;
    category: ModelCategory;
    creator: ModelCreator;
    selectorName: string;
    selectorDescription: string;
    selectorBadges: string[];
  }) {
    super(args);
  } 
}
