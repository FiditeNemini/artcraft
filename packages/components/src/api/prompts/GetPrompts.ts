import MakeRequest from "../MakeRequest";

export interface GetPromptsRequest {}

export interface Prompt {
  created_at: Date,
  maybe_positive_prompt?: string,
  maybe_negative_prompt?: string,
  maybe_style_name?: string,
  prompt_type: string,
  used_face_detailer: boolean,
  used_upscaler: boolean,
}

export interface GetPromptsResponse {
  prompt: Prompt
  success: boolean
}

export const GetPrompts = MakeRequest<string,GetPromptsRequest,GetPromptsResponse,{}>({
  method: "GET",
  routingFunction: (token: string) => `/v1/prompts/${ token }`,
});
