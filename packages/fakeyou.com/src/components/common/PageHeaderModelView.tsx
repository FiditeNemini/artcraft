import React from "react";
import Panel from "./Panel";

interface PageHeaderModelViewProps {
  titleIcon?: React.ReactNode;
  title: string;
  subText: React.ReactNode;
  tags?: string[];
  ratingBtn?: React.ReactNode;
  ratingStats?: React.ReactNode;
  extras?: React.ReactNode;
}

export default function PageHeaderModelView(props: PageHeaderModelViewProps) {
  return (
    <div className="pt-3 pb-4">
      <Panel padding>
        <div className="row gy-3">
          <div className="col-12 col-lg-8">
            <h2 className="fw-bold">
              {props.titleIcon}
              {props.title}
            </h2>
            <p>{props.subText}</p>
          </div>
          <div className="col-12 col-lg-4">
            <div className="d-flex gap-2 flex-wrap justify-content-lg-end">
              {props.tags &&
                props.tags.map((tag, index) => (
                  <div key={index}>
                    <span className="badge badge-tag">{tag}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <hr className="my-4" />

        <div className="d-flex flex-column flex-lg-row flex-column-reverse gap-3">
          <div className="d-flex gap-3">
            {props.ratingBtn}
            <div className="d-lg-none">{props.extras}</div>
          </div>
          {props.ratingStats}
          <div className="flex-grow-1 d-none d-lg-flex justify-content-end">
            {props.extras}
          </div>
        </div>
      </Panel>
    </div>
  );
}
