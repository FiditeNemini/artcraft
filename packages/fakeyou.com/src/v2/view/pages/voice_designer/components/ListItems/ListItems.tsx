import React from "react";
import "./ListItems.scss";
import Button from "../../../../../../components/common/Button";
import { faPlus } from "@fortawesome/pro-solid-svg-icons";

interface ListItemsProps {
  data: any[];
}

export default function ListItems({ data }: ListItemsProps) {
  if (data.length === 0) {
    return (
      <div className="d-flex flex-column list-items p-5 align-items-center">
        <h5 className="fw-semibold mb-3">You haven't created any voices.</h5>

        <Button icon={faPlus} label="Create New Voice" small={true} to="/" />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex flex-column flex-lg-row py-2 d-md-none">
        <div>
          <Button
            icon={faPlus}
            label="Create New Voice"
            to="/voice-designer/create"
          />
        </div>
      </div>
      {data.map((item) => {
        return (
          <div className="d-flex flex-column flex-lg-row gap-3 list-items p-3 align-items-lg-center">
            <h5 className="flex-grow-1 fw-semibold mb-0">{item.name}</h5>

            <div className="d-flex">
              <div className="d-flex gap-2">
                <Button label="Edit" small={true} variant="secondary" to="/" />
                <Button label="Delete" small={true} variant="danger" to="/" />
                <Button label="Use Voice" small={true} to="/" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
