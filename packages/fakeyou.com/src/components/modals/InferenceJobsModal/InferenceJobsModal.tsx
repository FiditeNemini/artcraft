import React, { useState } from "react";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { TempSelect } from "components/common";
import ModalHeader from "../ModalHeader";

interface Props {
  handleClose?: any,
}

export default function InferenceJobsModal({ handleClose }: Props) {
  const [jobType,jobTypeSet] = useState("All");
  const typeObj = ["All", ...Object.values(FrontendInferenceJobType)];

  const options = typeObj.filter(val => isNaN(Number(val)))
  .map((value) => {
    if (typeof value === "string") return { value, label: value }
    return { label: "", value: "" };
  });

  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  return <>
    <ModalHeader {...{ handleClose, title: "My Jobs" }} />
    <TempSelect {...{ onChange: ({ target }: { target: any }) => jobTypeSet(target.value), options, value: jobType }} />
    <InferenceJobsList {...{
        failures,
        value: typeObj.indexOf(jobType),
      }} />
  </>;
};