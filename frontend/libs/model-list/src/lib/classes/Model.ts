import { ModelCreator } from "../ModelCreator.js";
import { ModelCategory } from "../ModelConfig.js";

// NB: Do not create instances of this class directly, use subclasses.
export class Model {
  // A unique frontend-only string for the model
  readonly id: string;

  // A unique identifier that Tauri uses for the model (this 
  // might differ from our backend or other systems)
  readonly tauriId: string;

  // A long name for the model that might need to be abbreviated.
  readonly fullName: string;

  // The type of model (image, video, etc.)
  // TODO: Not sure that this is used for anything
  readonly category: ModelCategory;

  // What company made the model.
  readonly creator: ModelCreator;

  // Name for the selector
  readonly selectorName: string;

  // Description for the selector
  readonly selectorDescription: string;

  // Labels for the selector
  readonly selectorBadges: string[];

  protected constructor(args: {
    id: string;
    tauriId: string;
    fullName: string;
    category: ModelCategory;
    creator: ModelCreator;
    selectorName: string;
    selectorDescription: string;
    selectorBadges: string[];
  }) {
    this.id = args.id;
    this.tauriId = args.tauriId;
    this.fullName = args.fullName;
    this.category = args.category;
    this.creator = args.creator;
    this.selectorName = args.selectorName;
    this.selectorDescription = args.selectorDescription;
    this.selectorBadges = args.selectorBadges;
  }
}
