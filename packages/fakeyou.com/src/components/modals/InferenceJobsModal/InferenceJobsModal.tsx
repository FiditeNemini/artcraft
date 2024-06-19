import React, { useState } from "react"; // useState
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { TempSelect as Select, JobsClearButton } from "components/common";
import { enumToKeyArr } from "resources";
import ModalHeader from "../ModalHeader";
import { useInferenceJobs, useLocalize, useSession } from "hooks";

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
  const { canAccessStudio } = useSession();
  const { clearJobs, clearJobsStatus, someJobsAreDone } = useInferenceJobs();
  const presetFilter = enumToKeyArr(FrontendInferenceJobType)[inJobType];
  const [jobType, jobTypeSet] = useState(inJobType > -1 ? presetFilter : "All");
  const typeObj = ["All", ...Object.values(FrontendInferenceJobType)];
  const options = typeObj
    .filter(val => isNaN(Number(val)))
    .map(value => {
      if (typeof value === "string") return { value, label: value };
      return { label: "", value: "" };
    });
  const { t } = useLocalize("InferenceJobs");
  const selectedType = typeObj.indexOf(jobType) - 1;
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
      {canAccessStudio() && (
        <Select
          {...{
            onChange: ({ target }: { target: any }) => jobTypeSet(target.value),
            options,
            value: jobType,
          }}
        />
      )}
      <InferenceJobsList
        {...{
          failures,
          onSelect: () => {
            if (handleClose) handleClose();
          },
          ...(selectedType > -1 ? { jobType: selectedType } : {}),
          showHeader: false,
          showJobQueue: true,
          showNoJobs: true,
          panel: false,
          ...rest,
        }}
      />
    </>
  );
}
