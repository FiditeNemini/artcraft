import MakeRequest from "../MakeRequest";

export interface DeleteWeightRequest {
  description_markdown: string,
  description_rendered_html: string,
  title: string,
  visibility: string,
  weight_category: string,
  weight_type: string
}

export interface DeleteWeightResponse {
  success: boolean
}

export const DeleteWeight = MakeRequest<string, DeleteWeightRequest, DeleteWeightResponse,{}>({
  method: "POST",
  routingFunction: (weight_token: string) => `/v1/weights/weight/${ weight_token }`,
});