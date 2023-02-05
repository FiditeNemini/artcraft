import React from "react";

interface Props {
  titleIcon?: JSX.Element;
  title: JSX.Element;
  subText: JSX.Element;
  showButtons: boolean;
  actionButtons?: JSX.Element;
}

function PageHeader(props: Props) {
  return (
    <div className="container hero-section pt-4 pt-lg-5 pb-5 mb-3">
      <h1 className="fw-bold text-center text-md-start">
        {props.titleIcon}
        {props.title}
      </h1>
      <hr />
      <p className="text-center text-md-start">{props.subText}</p>
      {props.showButtons && (
        <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start mt-4">
          {props.actionButtons}
        </div>
      )}
    </div>
  );
}

export { PageHeader };
