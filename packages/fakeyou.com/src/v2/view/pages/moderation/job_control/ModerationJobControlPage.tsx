import React, { useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { WebUrl } from "../../../../../common/WebUrl";
import { BackLink } from "../../../_common/BackLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBomb } from "@fortawesome/free-solid-svg-icons";
import {
  KillJobs,
} from "@storyteller/components/src/api/moderation/queues/KillJobs";

interface Props {
  sessionWrapper: SessionWrapper;
}

function ModerationJobControlPage(props: Props) {
  const [killPendingJobs, setKillPendingJobs] = useState<boolean>(true);
  const [killFailedJobs, setKillFailedJobs] = useState<boolean>(true);
  const [killStartedJobs, setKillStartedJobs] = useState<boolean>(true);
  const [priorityLevel, setPriorityLevel] = useState<number>(0);
  const [target, setTarget] = useState<string>('all_jobs');

  const killJobs= async () => {
    let jobStatuses = [];

    if (killPendingJobs) { jobStatuses.push('pending') }
    if (killFailedJobs) { jobStatuses.push('failed') }
    if (killStartedJobs) { jobStatuses.push('started') }

    // NB: The backend uses parameterized enums, so the request shape here is unusual
    let requestTarget: any = 'all_jobs';
    
    switch (target) {
      case 'all_jobs':
        break;
      case 'lipsync_animation':
      case 'text_to_speech':
      case 'voice_conversion':
        requestTarget = { 'category': target };
        break;
      case 'rvc_v2':
      case 'so_vits_svc':
      case 'tt2':
        requestTarget = { 'model_type': target };
        break;
    }

    const request = {
      job_statuses: jobStatuses,
      target: requestTarget,
      maybe_priority_or_lower: priorityLevel,
    };

    await KillJobs(request);
  };

  const checkboxEventStatus = (
    ev: React.FormEvent<HTMLInputElement>
  ) : boolean => {
    return (ev.target as HTMLInputElement).checked;
  }

  const handlePriorityChange = (ev: React.FormEvent<HTMLInputElement>) => {
    const level = (ev.target as HTMLInputElement).value;
    let numericLevel = parseInt(level.trim());
    if (isNaN(numericLevel)) {
      numericLevel = 0;
    } else if (numericLevel < 0) {
      numericLevel = 0;
    }
    setPriorityLevel(numericLevel);
  };

  const handleTargetChange = (ev: React.FormEvent<HTMLSelectElement>) => {
    const value = (ev.target as HTMLSelectElement).value;
    setTarget(value);
  };

  if (!props.sessionWrapper.canBanUsers()) {
    return <h1>Unauthorized</h1>;
  }

  return (
    <div>
      <div className="container py-5">
        <h1 className=" fw-bold">Job Stats</h1>
        <div className="pt-3">
          <BackLink link={WebUrl.moderationMain()} text="Back to moderation" />
        </div>
      </div>

      <div className="container-panel pt-3 pb-5">
        <div className="panel p-3 p-lg-4">
          <h2 className="panel-title fw-bold">Kill Jobs (Danger Zone)</h2>
          <h5 className="fw-semibold mb-4">(Only do this in emergencies!)</h5>

          <h5 className="fw-semibold mb-4">Job Types / Categories</h5>

          <div>
            <label className="sub-title">Category Type</label>

            <div className="form-group">
              <select
                onChange={handleTargetChange}
                className="form-select"
                value={target}
              >
                <option value="all_jobs">ALL JOBS !!!</option>
                <option value="lipsync_animation">Category: Lipsync Animation</option>
                <option value="text_to_speech">Category: Text-to-Speech (TT2, Voice Designer, etc.)</option>
                <option value="voice_conversion">Category: Voice Conversion (RVC, SVC, etc.)</option>
                <option value="rvc_v2">Model type: RVCv2</option>
                <option value="so_vits_svc">Model type: SVC</option>
                <option value="tt2">Model type: TT2</option>
              </select>
            </div>
            <br />
          </div>

          <h5 className="fw-semibold mb-4">Job Statuses</h5>

          <div className="d-flex flex-column gap-3">
            <label className="form-check-label">
              <input
                type="checkbox"
                checked={killFailedJobs}
                onChange={(ev) => setKillFailedJobs(checkboxEventStatus(ev))}
                className="form-check-input"
              />
              &nbsp; Kill Failed Jobs
            </label>
          </div>

          <div className="d-flex flex-column gap-3">
            <label className="form-check-label">
              <input
                type="checkbox"
                checked={killPendingJobs}
                onChange={(ev) => setKillPendingJobs(checkboxEventStatus(ev))}
                className="form-check-input"
              />
              &nbsp; Kill Pending Jobs
            </label>
          </div>

          <div className="d-flex flex-column gap-3">
            <label className="form-check-label">
              <input
                type="checkbox"
                checked={killStartedJobs}
                onChange={(ev) => setKillStartedJobs(checkboxEventStatus(ev))}
                className="form-check-input"
              />
              &nbsp; Kill Started Jobs
            </label>
          </div>

          <br />
          <h5 className="fw-semibold mb-4">Job Priorities</h5>

          <div>
            <label className="sub-title">Kill Priority Level(s) and Below</label>
            <div className="form-group">
              <input
                className="form-control"
                type="text"
                placeholder="Priority Level"
                value={priorityLevel}
                onChange={handlePriorityChange}
              />
            </div>
            <br />
            <div>eg. setting this to "3" will kill all priorities 3 and below (3, 2, 1, and 0).</div>
            <br />
            <ul>
              <li>Level 0 = logged out</li>
              <li>Level 1 = free account</li>
              <li>Level 2+ = premium or loyalty user</li>
            </ul>
            <br />
            <div>Try not to kill premium user workloads unless things get bad.</div>
          </div>

          <div className="py-6">
            <div className="d-flex flex-column gap-3">

              <button
                className="btn btn-destructive w-100"
                onClick={() => killJobs()}
              >
                Kill Jobs&nbsp;
                <FontAwesomeIcon icon={faBomb} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        <BackLink link={WebUrl.moderationMain()} text="Back to moderation" />
      </div>
    </div>
  );
}

export { ModerationJobControlPage };
