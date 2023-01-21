import React from "react";

interface Props {
  title: string;
  body: string | JSX.Element;
  clearNotice: () => void;
}

function GenericNotice(props: Props) {
  return (
    <>
      <div className="container">
        <div
          className="alert alert-secondary alert-dismissible fade show"
          role="alert"
        >
          <button
            className="btn-close"
            onClick={() => props.clearNotice()}
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
          <strong>{props.title}</strong> {props.body}
        </div>
      </div>
    </>
  );
}

export { GenericNotice };
