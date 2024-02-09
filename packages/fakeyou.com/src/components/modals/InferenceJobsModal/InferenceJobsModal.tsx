import React, {
  // useState
} from "react";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
// import { TempSelect } from "components/common";
// import { enumToKeyArr } from "resources";
import ModalHeader from "../ModalHeader";

interface Props {
  handleClose?: any,
  jobType?: FrontendInferenceJobType
}

export default function InferenceJobsModal({ handleClose, jobType: inJobType = -1 }: Props) {
  // const presetFilter = enumToKeyArr(FrontendInferenceJobType)[inJobType];
  // const [jobType,jobTypeSet] = useState(inJobType > -1 ? presetFilter : "All");
  // const typeObj = ["All", ...Object.values(FrontendInferenceJobType)];

  // const options = typeObj.filter(val => isNaN(Number(val)))
  // .map((value) => {
  //   if (typeof value === "string") return { value, label: value }
  //   return { label: "", value: "" };
  // });

  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  return <>
    <ModalHeader {...{ handleClose, title: "My Jobs" }} />
    {
     // <TempSelect {...{ onChange: ({ target }: { target: any }) => jobTypeSet(target.value), options, value: jobType }} />
    }
    <InferenceJobsList {...{
        failures,
        onSelect: () => {
          if (handleClose) handleClose();
        },
        value: 0 // fixed for now
        // value: typeObj.indexOf(jobType),
      }} />
  </>;
};