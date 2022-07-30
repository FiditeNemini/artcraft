import React from "react";

interface Props {
  title: string;
  body: string | JSX.Element;
  clearNotice: () => void;
}

function GenericNotice(props: Props) {
  return (
    <>
      <div className="container pt-3">
        <div
          className="alert alert-primary alert-dismissible fade show"
          role="alert"
        >
          <button
            className="btn-close"
            onClick={() => props.clearNotice()}
            data-bs-dismiss="alert"
            aria-label="Close"
          ></button>
          <h2>
            {props.title}
          </h2>
          {props.body}
        </div>
      </div>
    </>
  );
}

export { GenericNotice };
