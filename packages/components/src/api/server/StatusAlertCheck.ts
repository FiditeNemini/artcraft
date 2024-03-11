import MakeRequest from "../MakeRequest";

export interface StatusAlertCheckRequest {}

export interface AlertObject {
  maybe_category: string,
  maybe_message: string
}

export interface StatusAlertCheckResponse {
  success?: boolean,
  maybe_alert?: AlertObject
}

export const StatusAlertCheck = MakeRequest<string, StatusAlertCheckRequest, StatusAlertCheckResponse,{}>({
  method: "GET",
  routingFunction: (mediaFileToken: string) => `/v1/status_alert_check`,
});
