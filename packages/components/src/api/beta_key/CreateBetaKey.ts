import MakeRequest from "../MakeRequest";

export interface CreateBetaKeyRequest {
  maybe_referrer_username: string;
  number_of_keys: number;
  uuid_idempotency_token: string;
}

export interface CreateBetaKeyResponse {
  beta_keys: string[];
  success: boolean;
}

export const CreateBetaKey = MakeRequest<
  string,
  CreateBetaKeyRequest,
  CreateBetaKeyResponse,
  {}
>({
  method: "POST",
  routingFunction: () => "/v1/beta_keys/new",
});
