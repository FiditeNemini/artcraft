import React from "react";

interface Props {
  byQueue: any,
  t: any,
  ttsQueuedCount: number
}

export default function SideNavJobs({ byQueue, t, ttsQueuedCount }: Props) {
  return <div className="d-none d-lg-block">
    <div className="sidebar-heading">Jobs Queue</div>
    <div className="ps-4 mb-3">
      <div>
        {t("queueTts")}:{" "}
        <span className="text-red">{ ttsQueuedCount }</span>
      </div>
      <div>
        {t("queueRvc")}:{" "}
        <span className="text-red">
          { byQueue.pending_rvc_jobs }
        </span>
      </div>
      <div>
        {t("queueSvc")}:{" "}
        <span className="text-red">
          { byQueue.pending_svc_jobs }
        </span>
      </div>
      <div>
        Image Generation:{" "}
        <span className="text-red">
          { byQueue.pending_stable_diffusion }
        </span>
      </div>
      <div>
        {t("queueFaceAnimator")}:{" "}
        <span className="text-red">
          { byQueue.pending_face_animation_jobs }
        </span>
      </div>
      <div>
        Voice Designer:{" "}
        <span className="text-red">
          { byQueue.pending_voice_designer }
        </span>
      </div>
    </div>
  </div>;
};