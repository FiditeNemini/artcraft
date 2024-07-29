import React from "react";
import { MDXProvider } from "@mdx-js/react";
import { graphql, Link } from "gatsby";
import type { PageProps } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import Layout from "./layout";
import { Youtube } from "./Youtube";
import * as MdTypography from "./MdTypography";
import Button from "./Button";

const shortcodes = { Link, Youtube }; // Provide common components here

export default function PostTemplate({
  data,
  children,
}: PageProps<Queries.PostTemplateQuery>) {
  const post = data.mdx;
  const featuredImage =
    post?.frontmatter?.featuredImage?.childImageSharp?.gatsbyImageData &&
    getImage(post.frontmatter.featuredImage.childImageSharp.gatsbyImageData);

  return (
    <Layout>
      <Link
        to="/"
        className="text-md flex w-fit items-center gap-1.5 font-semibold opacity-80 hover:underline"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
        Back to Learn
      </Link>
      <MdTypography.H1 className="mb-6 mt-6">
        {post?.frontmatter?.title}
      </MdTypography.H1>
      <div className="h-[200px] w-full overflow-hidden rounded-lg bg-panel/10 sm:h-[300px] md:h-[400px] lg:h-[500px]">
        {featuredImage && (
          <GatsbyImage
            alt={`${post.frontmatter.title} featured image`}
            image={featuredImage}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="mt-8 flex gap-28 lg:mt-10">
        <div className="mdx-styles group mb-20 grow">
          <MDXProvider
            components={{
              h1: MdTypography.H1,
              h2: MdTypography.H2,
              h3: MdTypography.H3,
              h4: MdTypography.H4,
              h5: MdTypography.H5,
              h6: MdTypography.H6,
              p: MdTypography.P,
              ...shortcodes,
            }}
          >
            {children}
          </MDXProvider>
        </div>
        <div className="hidden min-w-[280px] flex-col gap-8 lg:flex">
          <div className="overflow-hidden rounded-lg bg-panel/5">
            <div className="p-4">
              <MdTypography.H2 className="mb-3 font-bold leading-5 md:text-[18px]">
                Turn your ideas into videos with ease
              </MdTypography.H2>
              <Button>Create now</Button>
            </div>
            <div className="h-40 bg-panel/5" />
          </div>
          <div className="flex items-center gap-3">
            <div className="pointer-events-none h-12 w-12 select-none overflow-hidden rounded-full border border-panel/20 bg-panel/10">
              {featuredImage && (
                <GatsbyImage
                  alt={`${post.frontmatter.title} featured image`}
                  image={featuredImage}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="text-md flex flex-col">
              <span>Written by</span>
              <span className="font-bold">
                {post?.frontmatter?.author || ""}
              </span>
            </div>
          </div>
          <hr className="w-full border-panel/15" />
          <div className="flex flex-col gap-3">
            <MdTypography.H4>Related posts</MdTypography.H4>
            <div className="flex flex-col gap-8">
              <Link to="/" className="group flex flex-col gap-2">
                <div className="h-40 overflow-hidden rounded-lg bg-panel/5">
                  <div className="flex h-full w-full items-center justify-center object-cover transition-all duration-[400ms] group-hover:scale-110">
                    Related Post Image Here
                  </div>
                </div>
                <MdTypography.H4 className="my-0 text-[17px] transition-all group-hover:text-link">
                  Title of related post
                </MdTypography.H4>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const query = graphql`
  query PostTemplate($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        author
        date(formatString: "MMMM DD, YYYY")
        featuredImage {
          childImageSharp {
            gatsbyImageData(width: 800, placeholder: BLURRED)
          }
        }
      }
    }
  }
`;
