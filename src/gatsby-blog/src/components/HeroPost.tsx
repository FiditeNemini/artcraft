import React from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

import * as MdTypography from "./MdTypography";
import { staiFrontmatter } from "../models/frontmatter";
import { getCateogry } from "../models";
const {P, H2} = MdTypography;

export const HeroPost = ({postFrontmatter}:{postFrontmatter:staiFrontmatter})=>{
  const pfm = postFrontmatter;
  const category = getCateogry(pfm.category);
  const featuredImage =
    pfm.featuredImage?.childImageSharp?.gatsbyImageData &&
      getImage(pfm.featuredImage.childImageSharp.gatsbyImageData);

  return(
    <Link to={pfm.slug}>
      <div className="group grid grid-cols-5 overflow-hidden rounded-lg">
        <div className="col-span-full h-52 bg-panel/20 sm:h-96 lg:col-span-3 overflow-hidden">
          {featuredImage ? (
            <GatsbyImage
              alt={`${pfm.title} featured image`}
              image={featuredImage}
              className="h-full w-full object-cover transition-all duration-[400ms] group-hover:scale-110"
            />
          ):
            <div className="flex h-full w-full items-center justify-center object-cover transition-all duration-[400ms] group-hover:scale-110">
              Featured Post Image Placeholder Here
            </div>
          }
        </div>
        <div className="col-span-full flex flex-col justify-center bg-panel/5 p-4 text-center lg:col-span-2 lg:p-6 lg:text-start">
          <P className="text-md font-bold uppercase opacity-70 transition-all hover:text-link">
            {category.displayName}
          </P>
          <H2 className="text-2xl transition-all group-hover:text-link md:text-3xl">
            {pfm.title}
          </H2>
          <P className="text-md mt-3 hidden w-fit items-center gap-1.5 font-semibold opacity-70 lg:flex">
            Read More
            <FontAwesomeIcon
              icon={faChevronRight}
              className="me-2 text-xs"
            />
          </P>
        </div>
      </div>
    </Link>
  )
}