import React, {
  useState
} from "react";
import { useHistory } from "react-router-dom";
import {
  Accordion,
  Button,
  TempTextArea as TextArea,
} from "components/common";

import { mapRequest, VSTType } from './helpers';
import { TableOfKeyValues } from "../../commons";
import { Action } from "../../reducer";
import EnqueueVideoStyleTransfer from "@storyteller/components/src/api/video_styleTransfer";

export const CompAdminPanel = ({
  parentPath,
  vstValues,
  dispatchPageState
}:{
  parentPath: string;
  vstValues : VSTType;
  dispatchPageState: (action: Action) => void;
})=>{
  const history = useHistory();
  const exampleJSON = JSON.stringify(mapRequest(vstValues));
  const [jsonRequest, setJsonRequest] = useState<string>(exampleJSON);
  const handleSendRequest = ()=>{
    EnqueueVideoStyleTransfer(JSON.parse(jsonRequest)).then(res => {
      if (res.success && res.inference_job_token) {
        dispatchPageState({
          type: "enqueueJobSuccess",
          payload: {
            inferenceJobToken: res.inference_job_token,
          },
        });
      } else {
        alert("Error, Check Console Log");
        console.log(res);
      }
    });
    dispatchPageState({ type: "enqueueJob" });
    history.push(`${parentPath}/jobs`);
  }

  return (
    <Accordion className="mt-4">
        <Accordion.Item title={"Admin Panel"}>
          <div className="row p-3 g-3">
            <div className="col-8">
              <TextArea
                {...{
                  label:"JSON Input",
                  rows: 10,
                  placeholder: "Paste JSON here and send request directly",
                  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setJsonRequest(e.target.value),
                  value: jsonRequest,
                  required: false,
                }}
              />
            </div>
            <div className="col-4 pt-5">
              <Button
                label="Console Log JSON Reqest"
                variant="secondary"
                onClick={()=>{
                  console.log(JSON.parse(jsonRequest));
                }}
              />
              <br/>
              <Button
                label="Send JSON"
                onClick={handleSendRequest}
              />
            </div>
          </div>
          <div className="row p-3 g-3">
            <div className="col-8">
              <TableOfKeyValues
                title="All values in the VST app state"
                keyValues={vstValues}
              />
            </div>
            <div className="col-4">
              <p className="me-3"><b>Log Debug Values: </b></p>
              <br/>
              <Button
                label="Console Log State"
                variant="secondary"
                onClick={()=>{
                  console.log(vstValues);
                }}
              />
              <br/>
              <Button
                label="Console Log Request"
                variant="secondary"
                onClick={()=>{
                  const request = mapRequest(vstValues);
                  console.log(request);
                }}
              />

            </div>
          </div>
        </Accordion.Item>
    </Accordion>
  );
}
