import { ApiConfig } from "@storyteller/components";

export interface EnqueueFaceAnimationRequest {
  uuid_idempotency_token: string,

  audio_token: string,
  image_token: string,
}

export interface EnqueueFaceAnimationSuccessResponse {
  success: boolean,
  inference_job_token: string,
}

export interface EnqueueFaceAnimationErrorResponse {
  success: boolean,
}

type EnqueueFaceAnimationResponse = EnqueueFaceAnimationSuccessResponse | EnqueueFaceAnimationErrorResponse;

export function EnqueueFaceAnimationIsSuccess(response: EnqueueFaceAnimationResponse): response is EnqueueFaceAnimationSuccessResponse {
  return response?.success === true;
}

export function EnqueueFaceAnimationIsError(response: EnqueueFaceAnimationResponse): response is EnqueueFaceAnimationErrorResponse {
  return response?.success === false;
}

export async function EnqueueFaceAnimation(request: EnqueueFaceAnimationRequest) : Promise<EnqueueFaceAnimationResponse> 
{
  const endpoint = new ApiConfig().enqueueFaceAnimation();
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })
  .then(res => res.json())
  .then(res => {
    if (!res) {
      return { success : false };
    }

    if (res && 'success' in res) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}
