import React from 'react';
import { Button } from 'components/common';
import { FrontendInferenceJobType, InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faCircleQuestion, faHourglass1, faRemove, faSkull, faTrophy, faWarning } from "@fortawesome/free-solid-svg-icons";

interface JobListItem extends InferenceJob {
  jobType: FrontendInferenceJobType,
  jobStatusDescription?: any,
  onSelect?: any
  t?: any
}

export default function JobItem({ maybeFailureCategory, maybeResultToken, onSelect, jobState, jobStatusDescription, jobType: inputType, t }: JobListItem) {
  const processFail = (fail = "") => {
    switch (fail) {
      case "face_not_detected": return "Face not detected, try another picture";
      default: return "Uknown failure";
    }
  };
  const jobType = FrontendInferenceJobType[inputType];
  const jobStatus = jobStatusDescription(jobState);
	const jobStatusClass = jobStatus.toLowerCase().replace("_","-");
  const statusIcons = [
    faCircleQuestion, // UNKNOWN
    faHourglass1, // PENDING
    faHourglass1, // STARTED
    faWarning, // COMPLETE_SUCCESS
    faRemove, // COMPLETE_FAILURE
    faTrophy, // ATTEMPT_FAILED
    faSkull // DEAD
  ];

  return <div {...{ className: `face-animator-job job-status-${jobStatusClass}` }}>
    <FontAwesomeIcon {...{ className: "job-status-icon", icon: statusIcons[jobState] }}/>
    <div {...{ className: "job-details" }}>
      <h6>
        { t(`${jobType}.${jobStatus}`) }
      </h6>
      <span>
        { maybeFailureCategory ?`${ processFail(maybeFailureCategory) }` : t(`subtitles.${jobStatus}`) }
      </span>
    </div>
    {
      maybeResultToken ?  <Button {...{
          href: `media/${maybeResultToken}`,
          icon: faChevronRight,
          iconFlip: true,
          // label: t("inputs.viewResult"),
          onClick: onSelect
        }} />: null
      }
  </div>;
};