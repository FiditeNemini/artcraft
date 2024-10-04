import { ApiManager } from "./ApiManager";
import { v4 as uuidv4 } from "uuid";

export interface Coordinates {
  coordinates: [number, number];
  include: boolean;
}

export interface ObjectData {
  object_id: number;
  points: Coordinates[];
}

export interface Frame {
  timestamp: number;
  objects: ObjectData[];
}

export interface SegmentationRequest {
  session_id: string;
  fps: number;
  frames: Frame[];
  propogate: boolean;
}

export interface SegmentationResponse {
  session_id: string;
  fps: number;
  frames: Frame[];
  propogate: boolean;
}

export class SegmentationApi extends ApiManager {
  // returns uuid
  public async createSession(
    b64Video: string,
  ): Promise<{ session_id: string }> {
    const endpoint = `https://hax.storyteller.ai/segmentation/new_session`;
    const id = uuidv4().toString();
    return this.postForm<{ session_id: "fix-mimetype" }>({
      endpoint: endpoint,
      formRecord: {
        session_id: "fix-mimetype",
      },
      uuid: id,
      blobFileName: id,
    });
  }

  public addPointsToSession(
    session_id: string,
    fps: number,
    frames: Frame[],
    proprogate: boolean,
  ): Promise<{}> {
    const endpoint = `https://hax.storyteller.ai/segmentation/new_session`;

    const segmentationRequest: SegmentationRequest = {
      session_id: session_id,
      fps: fps,
      frames: frames,
      propogate: proprogate,
    };

    return this.post<SegmentationRequest, SegmentationResponse>({
      endpoint: endpoint,
      body: segmentationRequest,
    });
  }
}
