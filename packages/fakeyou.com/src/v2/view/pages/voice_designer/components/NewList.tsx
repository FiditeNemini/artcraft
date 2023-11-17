import React from "react";
import Button from "components/common/Button";
import { faMicrophone, faPlus } from "@fortawesome/pro-solid-svg-icons";

import "./ListItems/ListItems.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from "components/common/Skeleton";

interface ListItemsProps {
  data: any[];
  isLoading: boolean;
}

interface ListItem {
  badge: "voice" | "dataset";
  buttons: any;
  index: number;
  isCreating?: boolean;
  name: string;
}

const Working = () => (
  <div className="d-flex align-items-center gap-2 py-1">
    <p className="fw-medium opacity-75">Voice is being created...</p>
    <div className="spinner-border spinner-border-sm text-light" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const ItemRow = ({
  badge,
  buttons,
  index,
  isCreating,
  name,
  ...rest
}: ListItem) => {
  return (
    <div className="d-flex flex-column flex-lg-row gap-3 list-items p-3 align-items-lg-center">
      <div className="d-inline-flex flex-wrap align-items-center flex-grow-1">
        {badge === "dataset" ? (
          <div className="d-flex flex-column flex-lg-row align-items-start gap-2">
            <span className="dataset-badge mb-0">Dataset</span>
            <h5 className="fw-semibold mb-0">{name}</h5>
          </div>
        ) : null}
        {badge === "voice" ? (
          <div className="d-inline-flex align-items-center">
            <h5 className="fw-semibold d-flex mb-0 align-items-start">
              <span>
                <FontAwesomeIcon icon={faMicrophone} className="me-2 me-lg-3" />
              </span>
              {name}
            </h5>
          </div>
        ) : null}
      </div>
      <div className="d-flex">
        {isCreating ? (
          <Working />
        ) : (
          <div className="d-flex gap-2">
            {buttons && buttons.length
              ? buttons.map((action: any, key: number) => {
                  return (
                    <Button
                      {...{
                        ...action,
                        key,
                        name: `item-row:${index},button:${key}`,
                      }}
                    />
                  );
                })
              : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default function NewList({ data, isLoading }: ListItemsProps) {
  const DataPlaceholder = () => (
    <div className="d-flex flex-column list-items p-5 align-items-center">
      <h5 className="fw-semibold mb-3">You haven't created any voices.</h5>
      <Button
        icon={faPlus} // 1
        label="Create New Voice" // 2
        small={true}
        to="/voice-designer/create" // 3
      />
    </div>
  );

  if (isLoading) {
    const loaderView = (
      <div className="list-items p-3">
        <h3 className="mb-0">
          <Skeleton type="medium" rounded />
        </h3>
      </div>
    );

    return (
      <div className="d-flex flex-column gap-3">
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>{loaderView}</React.Fragment>
        ))}
      </div>
    );
  }

  return data.length ? (
    <div className="d-flex flex-column gap-3">
      {data.map((item, key) => (
        <ItemRow {...{ key, ...item, index: key }} />
      ))}
    </div>
  ) : (
    <DataPlaceholder />
  );
}
