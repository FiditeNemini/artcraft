import React from "react";
import { faArrowRightLong, faCompass, faTags } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import { SearchFieldClass } from "../SearchFieldClass";
import { LanguageOptions } from "./LanguageOptions";

interface Props {

}

export function ExploreVoicesModal(props: Props) {

  const options = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
  ];

  return (
    <div
      className="modal fade"
      id="exploreModal"
      aria-labelledby="ModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header p-3">
            <h5 className="modal-title fw-semibold" id="ModalLabel">
              <FontAwesomeIcon icon={faCompass} className="me-3" />
              Explore Voices
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-3 p-lg-4">
            <div className="row gx-3 gy-3">

              <div className="col-12 col-lg-3 input-icon-search">
                <label className="sub-title">Language</label>
                <LanguageOptions />
              </div>

              <div className="col-12 col-md-12 col-lg-9 input-icon-search">
                <div className="d-flex">
                  <label className="sub-title flex-grow-1">
                  Category
                  </label>
                  <a href="/" className="ms-3 fw-medium">
                  Clear category filters
                  </a>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2">
                  <div className="w-100">
                  <span className="form-control-feedback">
                    <FontAwesomeIcon icon={faTags} />
                  </span>
                  <Select
                      defaultValue={options[2]}
                      options={options}
                      classNames={SearchFieldClass}
                      className="w-100"
                  />
                </div>
                <div className="d-none d-md-flex align-items-center">
                  <FontAwesomeIcon
                      icon={faArrowRightLong}
                      className="fs-6 opacity-75"
                  />
                </div>
                <div className="w-100">
                  <span className="form-control-feedback">
                      <FontAwesomeIcon icon={faTags} />
                  </span>
                  <Select
                      defaultValue={options[2]}
                      options={options}
                      classNames={SearchFieldClass}
                      className="w-100"
                  />
                </div>
                <div className="d-none d-md-flex align-items-center">
                  <FontAwesomeIcon
                      icon={faArrowRightLong}
                      className="fs-6 opacity-75"
                  />
                </div>
                <div className="w-100">
                  <span className="form-control-feedback">
                      <FontAwesomeIcon icon={faTags} />
                  </span>
                  <Select
                      defaultValue={options[2]}
                      options={options}
                      classNames={SearchFieldClass}
                      className="w-100"
                  />
                </div>
              </div>
            </div>
            {/* <div className="col-12 col-lg-3 input-icon-search">
            <label className="sub-title">Sub-category 1</label>
            <div>
            <span className="form-control-feedback">
            <FontAwesomeIcon icon={faTags} />
            </span>
            <Select
            defaultValue={options[2]}
            options={options}
            classNames={SearchFieldClass}
            />
            </div>
            </div>
            <div className="col-12 col-lg-3 input-icon-search">
            <label className="sub-title">Sub-category 2</label>
            <div>
            <span className="form-control-feedback">
            <FontAwesomeIcon icon={faTags} />
            </span>
            <Select
            defaultValue={options[2]}
            options={options}
            classNames={SearchFieldClass}
            />
            </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
