import React from "react";
import { Link } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { staiFrontmatter } from "../models/frontmatter";
import { getCateogry } from "../models";
import { H4 } from "./MdTypography";

export const BlogRollItem = ({postFrontmatter: pfm}:{postFrontmatter: staiFrontmatter})=> {
  const category = getCateogry(pfm.category)
  const featuredImage =
    pfm.featuredImage?.childImageSharp?.gatsbyImageData &&
      getImage(pfm.featuredImage.childImageSharp.gatsbyImageData);

    return (
      <li className="group">
        <Link to={pfm.slug} title={pfm.title}>
          <div className="h-32 overflow-hidden rounded-lg bg-panel/5 sm:h-52">
            {featuredImage && (
              <GatsbyImage
                alt={`${pfm.title} featured image`}
                image={featuredImage}
                className="h-full w-full object-cover transition-all duration-[400ms] group-hover:scale-110"
              />
            )}
          </div>
        </Link>
          <div className="mt-3 flex flex-col">
            <div>
              <Link
                to={category.slug}
                className="text-sm font-bold uppercase opacity-70 transition-all hover:text-link"
              >
                {category.displayName}
              </Link>
            </div>
            <Link to={pfm.slug}>
              <H4 className="my-0 text-[16px] transition-all group-hover:text-link md:text-[18px]">
                {pfm.title}
              </H4>
            </Link>
          </div>
          {/* <p>{frontmatter.date}</p> */}
          {/* <p className="italic">by {frontmatter.author ?? "unknown"}</p> */}
        
      </li>
    );
}