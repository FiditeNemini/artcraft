import React, { useState, useEffect } from "react";
import {
  faApple,
  faDiscord,
  faFacebook,
  faPatreon,
  faTwitch,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";
import { faArrowRightArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Link } from "react-router-dom";

function IndexPage() {
  return (
    <div data-scroll-section>
      <div className="bg-hero">
        <div
          className="shape-1-container"
          data-scroll
          data-scroll-speed="4"
          data-scroll-position="top"
        >
          <div className="shape-1"></div>
        </div>
        <div className="shape-2"></div>
        <div
          className="shape-3-container"
          data-scroll
          data-scroll-speed="3"
          data-scroll-position="top"
        >
          <div className="shape-3"></div>
        </div>
        <div
          className="shape-4-container"
          data-scroll
          data-scroll-speed="2"
          data-scroll-position="top"
        >
          <div className="shape-4"></div>
        </div>
        <div className="container">
          <div className="hero-title-container">
            <h1 className="hero-title d-flex flex-column text-center">
              <div
                className="hero-title-one align-items-center zi-2"
                data-scroll
                data-scroll-speed="3"
                data-scroll-direction="horizontal"
                data-scroll-position="top"
              >
                The <span>Future</span>
              </div>
              <div
                className="hero-title-two zi-2"
                data-scroll
                data-scroll-speed="-3"
                data-scroll-direction="horizontal"
                data-scroll-position="top"
              >
                of Production
              </div>
            </h1>

            <div className="d-flex flex-column align-items-end">
              <p
                className="lead text-end w-50 hero-sub-title"
                data-scroll
                data-scroll-speed="-4"
                data-scroll-direction="horizontal"
                data-scroll-position="top"
              >
                We’re streamers and filmmakers building the components of the
                future Hollywood studio.
              </p>
              <div
                data-scroll
                data-scroll-speed="-5"
                data-scroll-direction="horizontal"
                data-scroll-position="top"
                className="zi-10"
              >
                <a className="btn btn-primary" href="/">
                  Explore
                </a>
              </div>
            </div>

            <div className="hero-title-outline noselect">
              <h1 className="hero-title d-flex flex-column text-center">
                <div
                  className="hero-title-one align-items-center text-outline"
                  data-scroll
                  data-scroll-speed="-4"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  The Future
                </div>
                <div
                  className="hero-title-two text-outline"
                  data-scroll
                  data-scroll-speed="4"
                  data-scroll-direction="horizontal"
                  data-scroll-position="top"
                >
                  of Production
                </div>
              </h1>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-center">
          <img
            className="hero-img"
            src="/hero/hero-img.png"
            alt="Storyteller HyperJail"
          />
        </div>

        <div
          className="d-flex social-icons flex-column gap-4 align-items-center"
          data-scroll
          data-scroll-speed="8"
          data-scroll-direction="horizontal"
          data-scroll-position="top"
        >
          <a href="/">
            <FontAwesomeIcon icon={faDiscord} />
          </a>
          <a href="/">
            <FontAwesomeIcon icon={faTwitch} />
          </a>
          <a href="/">
            <FontAwesomeIcon icon={faFacebook} />
          </a>
          <a href="/">
            <FontAwesomeIcon icon={faTwitter} />
          </a>
          <a href="/">
            <FontAwesomeIcon icon={faPatreon} />
          </a>
        </div>
      </div>
      <div className="bg-light section">
        <div className="container py-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
          <br />
          <br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
          <br />
          <br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
        </div>
      </div>
      <div className="bg-light section">
        <div className="container py-5">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
          <br />
          <br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
          <br />
          <br />
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
          ornare accumsan aliquam. Suspendisse sit amet volutpat tortor,
          pulvinar volutpat augue. Donec malesuada non dolor non pharetra. Donec
          convallis ut lectus non euismod. Nunc metus nisi, posuere quis quam
          sit amet, elementum molestie velit. Pellentesque pharetra nisi vel
          ipsum bibendum, et sagittis enim pretium. Pellentesque non lacus et
          mauris mattis ultrices a non turpis. Class aptent taciti sociosqu ad
          litora torquent per conubia nostra, per inceptos himenaeos. Aliquam
          consequat consequat justo vitae iaculis.
        </div>
      </div>
    </div>
  );
}

export default IndexPage;
