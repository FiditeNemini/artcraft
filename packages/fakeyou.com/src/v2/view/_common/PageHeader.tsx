import React from "react";
import { motion } from "framer-motion";
import { image } from "../../../data/animation";

interface Props {
  headerImage: string;
  titleIcon: JSX.Element;
  title: JSX.Element;
  subtext: JSX.Element;
  showButtons: boolean;
  actionButtons?: JSX.Element;
}

function PageHeader(props: Props) {
  return (
    <div className="container-panel hero-section pt-4 pt-lg-5 pb-5">
      <div className="panel">
        <div className="row gx-3 flex-md-row-reverse">
          <div className="col-12 col-md-5 hero-img-container d-none d-md-block">
            <motion.img
              src={props.headerImage}
              className="hero-img"
              alt="Hero Image"
              variants={image}
            />
          </div>
          <div className="col-12 col-md-7">
            <div className="p-3 py-4 p-md-4">
              <h1 className="fw-bold text-center text-md-start">
                {props.titleIcon}
                {props.title}
              </h1>
              <p className="text-center text-md-start">{props.subtext}</p>
              {props.showButtons && (
                <div className="d-flex flex-column flex-md-row gap-3 justify-content-center justify-content-md-start mt-4">
                  {props.actionButtons}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PageHeader };
