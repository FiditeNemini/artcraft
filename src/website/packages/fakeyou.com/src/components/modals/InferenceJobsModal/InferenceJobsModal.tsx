import React from "react"; // useState
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { JobsClearButton } from "components/common";
import ModalHeader from "../ModalHeader";
import { useInferenceJobs, useLocalize } from "hooks";

interface Props {
  handleClose?: any;
  jobType?: FrontendInferenceJobType;
  showModalHeader?: boolean;
}

export default function InferenceJobsModal({
  handleClose,
  jobType: inJobType = -1,
  showModalHeader = true,
  ...rest
}: Props) {
  const { clearJobs, clearJobsStatus, someJobsAreDone } = useInferenceJobs();
  const { t } = useLocalize("InferenceJobs");
  const selectedType = 0;
  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  return (
    <>
      {showModalHeader && (
        <ModalHeader {...{ handleClose, title: t("core.jobsTitle") }}>
          <JobsClearButton
            {...{ clearJobs, clearJobsStatus, someJobsAreDone }}
          />
        </ModalHeader>
      )}
      <InferenceJobsList
        {...{
          failures,
          onSelect: () => {
            if (handleClose) handleClose();
          },
          ...(selectedType > -1 ? { jobType: selectedType } : {}),
          showHeader: false,
          showJobQueue: false,
          showNoJobs: true,
          panel: false,
          ...rest,
        }}
      />
    </>
  );
}
