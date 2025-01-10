import { UploaderStates } from "~/enums";

export interface UploaderState {
  status: UploaderStates;
  errorMessage?: string;
  data?: unknown;
}

export const initialUploaderState = {
  status: UploaderStates.ready,
};
