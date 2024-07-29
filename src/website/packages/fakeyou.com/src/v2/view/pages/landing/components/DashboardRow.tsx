import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faArrowRight } from "@fortawesome/pro-solid-svg-icons";

interface BadgeContent {
  type: string;
  icon: IconDefinition;
  label: string;
}

interface DashboardItemProps {
  to: string;
  title: string;
  text?: string;
  imgSrc: string;
  imgAlt: string;
  badgeContent?: BadgeContent;
}

export function DashboardItem({
  to,
  title,
  text,
  imgSrc,
  imgAlt,
  badgeContent,
}: DashboardItemProps) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <Link
        to={to}
        className="panel panel-select d-flex flex-column align-items-center"
      >
        <div className="d-flex px-4 pt-4 align-items-start w-100">
          <div className="flex-grow-1">
            {badgeContent && (
              <div className="mb-1">
                <span
                  className={`badge-${badgeContent.type} d-inline-flex align-items-center mb-2 me-2`}
                >
                  <FontAwesomeIcon icon={badgeContent.icon} className="me-1" />
                  {badgeContent.label}
                </span>
                <h4 className="fw-bold text-white d-inline-flex align-items-center mb-0">
                  <span>{title}</span>
                </h4>
                <h6 className="fw-normal opacity-75 text-white">{text}</h6>
              </div>
            )}
            {!badgeContent && (
              <>
                <h3 className="fw-bold text-white mb-1">{title}</h3>
                <h6 className="fw-normal opacity-75 text-white">{text}</h6>
              </>
            )}
          </div>
          <Link to={to} className="btn btn-square mt-1">
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
        <img className="img-fluid" src={imgSrc} alt={imgAlt} />
      </Link>
    </div>
  );
}

interface DashboardRowProps {
  items: DashboardItemProps[];
  bgDotsLeft?: boolean;
  bgDotsRight?: boolean;
}

export function DashboardRow({
  items,
  bgDotsLeft,
  bgDotsRight,
}: DashboardRowProps) {
  return (
    <div className="row g-4 position-relative">
      {items.map((item, index) => (
        <DashboardItem key={index} {...item} />
      ))}
      {bgDotsLeft && (
        <img
          src="/images/landing/bg-dots.webp"
          alt="background dots"
          className="dots-right-top"
        />
      )}
      {bgDotsRight && (
        <img
          src="/images/landing/bg-dots.webp"
          alt="background dots"
          className="dots-left-bottom"
        />
      )}
    </div>
  );
}

export default DashboardRow;
