import React from "react";

interface PageHeaderModelViewProps {
  titleIcon?: React.ReactNode;
  title: string;
  subText: React.ReactNode;
  tags?: string[];
}

export default function PageHeaderModelView(props: PageHeaderModelViewProps) {
  return (
    <div className="container-panel hero-section pt-3 pb-4">
      <div className="panel p-3 py-4 p-md-4">
        <div className="row g-3">
          <div className="col-12 col-lg-8">
            <h2 className="fw-bold">
              {props.titleIcon}
              {props.title}
            </h2>
            <p>{props.subText}</p>
          </div>
          <div className="col-12 col-lg-4 d-flex flex-wrap justify-content-lg-end gap-2">
            {props.tags &&
              props.tags.map((tag, index) => (
                <div key={index}>
                  <span className="badge badge-tag">{tag}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
