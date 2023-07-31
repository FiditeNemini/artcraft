import {
  faBarsStaggered,
  faDeleteLeft,
  faVolumeHigh,
} from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import Panel from "components/common/Panel";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { SessionVoiceConversionResultsList } from "v2/view/_common/SessionVoiceConversionResultsList";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import PageHeaderModelView from "components/common/PageHeaderModelView";

interface VcModelViewPageProps {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
  inferenceJobsByCategory: any;
}

export default function VcModelViewPage(props: VcModelViewPageProps) {
  let { token } = useParams() as { token: string };

  const title = "Solid Snake";
  const subText = (
    <div className="d-flex align-items-center gap-2">
      <div>
        <span className="badge-model badge-model-rvc fs-6">RVCv2</span>
      </div>
      <p>
        V2V model created by <Link to="/">Vegito1089</Link>
      </p>
    </div>
  );
  const tags = ["Speaking", "English", "Character", "Singing", "Spanish"];

  return (
    <div>
      <PageHeaderModelView title={title} subText={subText} tags={tags} />

      <Panel padding mb>
        <div className="row g-5">
          <div className="col-12 col-lg-6">
            <h4 className="mb-3">
              <FontAwesomeIcon icon={faVolumeHigh} className="me-3" />
              Use Voice
            </h4>
            {/* have to replace this below with Voice conversion stuff instead of the textarea */}
            <form onSubmit={() => {}}>
              <textarea
                onChange={() => {}}
                value={""}
                className="form-control"
                placeholder="Textual shenanigans go here..."
                rows={6}
              ></textarea>
              <div className="d-flex gap-3 mt-3">
                <button className="btn btn-primary w-100">
                  <FontAwesomeIcon icon={faVolumeHigh} className="me-2" />
                  Speak
                </button>

                <button
                  className="btn btn-destructive w-100"
                  onClick={() => {}}
                >
                  <FontAwesomeIcon icon={faDeleteLeft} className="me-2" />
                  Clear
                </button>
              </div>
            </form>
          </div>
          <div className="col-12 col-lg-6">
            <h4 className="mb-3">
              <FontAwesomeIcon icon={faBarsStaggered} className="me-3" />
              Session V2V Results
            </h4>
            <div className="d-flex flex-column gap-3 session-tts-section session-vc-section">
              <SessionVoiceConversionResultsList
                inferenceJobs={
                  props.inferenceJobsByCategory.get(
                    FrontendInferenceJobType.VoiceConversion
                  )!
                }
                sessionSubscriptionsWrapper={props.sessionSubscriptionsWrapper}
              />
            </div>
          </div>
        </div>
      </Panel>
      <Panel padding>
        <h4 className="text-center text-lg-start mb-4">
          <FontAwesomeIcon icon={faBarsStaggered} className="me-3" />
          Voice Details
        </h4>
        lol
      </Panel>
    </div>
  );
}
