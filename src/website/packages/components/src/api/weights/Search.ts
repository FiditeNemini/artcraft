import MakeRequest from "../MakeRequest";
import { Weight } from "./GetWeight";

export interface SearchWeightRequest {
  search_term: string;
  weight_type?: string;
  weight_category?: string;
  ietf_language_tag?: string;
}

export interface SearchWeightResponse {
  success: boolean;
  weights?: Weight[];
}

export const SearchWeight = MakeRequest<string, SearchWeightRequest, SearchWeightResponse, {}>({
  method: "POST",
  routingFunction: () => `/v1/weights/search`,
});
