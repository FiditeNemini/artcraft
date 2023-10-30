import React from "react";
import "./ListItems.scss";
import Button from "../../../../../../components/common/Button";
import { faMicrophone, faPlus } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ListItemsProps {
  data: any[];
  type: "voices" | "datasets";
}

export default function ListItems({ data, type }: ListItemsProps) {
  if (data.length === 0) {
    return (
      <div className="d-flex flex-column list-items p-5 align-items-center">
        {type === "voices" && (
          <>
            <h5 className="fw-semibold mb-3">
              You haven't created any voices.
            </h5>
            <Button
              icon={faPlus}
              label="Create New Voice"
              small={true}
              to="/voice-designer/create"
            />
          </>
        )}
        {type === "datasets" && (
          <>
            <h5 className="fw-semibold mb-3">
              Datasets will appear after creating voices.
            </h5>
            <Button
              icon={faPlus}
              label="Create New Voice"
              small={true}
              to="/voice-designer/create"
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {data.map((item) => {
        return (
          <div className="d-flex flex-column flex-lg-row gap-3 list-items p-3 align-items-lg-center">
            <div className="d-inline-flex flex-wrap align-items-center flex-grow-1 gap-2">
              {type === "datasets" && (
                <span className="dataset-badge mb-0">Dataset</span>
              )}
              <h5 className="fw-semibold mb-0">
                {type === "voices" && (
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className="me-2 me-lg-3"
                  />
                )}
                {item.name}
              </h5>
            </div>

            <div className="d-flex">
              <div className="d-flex gap-2">
                <Button
                  label="Edit"
                  small={true}
                  variant="secondary"
                  to={`/voice-designer/dataset/${item.modelToken}/edit`}
                />
                <Button
                  label="Delete"
                  small={true}
                  variant="danger"
                  to={`/voice-designer/dataset/${item.modelToken}/delete`}
                />
                {type === "voices" && (
                  <Button
                    label="Use Voice"
                    small={true}
                    to={`/voice-designer/dataset/${item.modelToken}`}
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
