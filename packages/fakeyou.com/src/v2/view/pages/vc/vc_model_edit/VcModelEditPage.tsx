import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { useParams } from "react-router-dom";
import { Input, TextArea, Select } from "components/common/Input/Input";
import Panel from "components/common/Panel/Panel";
import { faEye, faFilePen } from "@fortawesome/pro-solid-svg-icons";
import PageHeaderModelView from "components/layout/PageHeaderModelView/PageHeaderModelView";

interface VcModelEditPageProps {
  sessionWrapper: SessionWrapper;
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value);
};

const savebtn = <button className="btn btn-primary">Save Changes</button>;

const visibility = [
  { value: "public", label: "Public" },
  { value: "hidden", label: "Hidden" },
];

export default function VcModelEditPage(props: VcModelEditPageProps) {
  let { token } = useParams() as { token: string };
  return (
    <div>
      <PageHeaderModelView
        title="Solid Snake"
        subText="Solid Snake"
        view="edit"
        titleIcon={faFilePen}
        extras={savebtn}
        modelType="V2V"
      />

      <Panel padding>
        <div className="d-flex flex-column gap-4">
          <Input
            label="Name"
            type="text"
            placeholder="Model title"
            onChange={handleChange}
          />

          <TextArea
            rows={3}
            label="Description"
            placeholder="Description"
            onChange={() => {}}
          />

          <Select
            icon={faEye}
            defaultValue={visibility[0]}
            options={visibility}
            label="Visibility"
          />
        </div>
      </Panel>
    </div>
  );
}
