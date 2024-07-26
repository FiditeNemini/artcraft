import React from "react";
import { graphql, Link } from "gatsby";
import type { HeadFC, PageProps } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import "../styles/global.css";
import Layout from "../components/layout";
import * as MdTypography from "../components/MdTypography";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  console.log(data);
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <MdTypography.H1 className="mb-1 md:mb-2">Learn</MdTypography.H1>
          <MdTypography.P className="text-[18px] font-semibold leading-6 opacity-80">
            Tutorials, tips and tricks on how to create better content.
          </MdTypography.P>
        </div>
        <Link to="/">
          <div className="group grid grid-cols-5 overflow-hidden rounded-lg">
            <div className="col-span-full h-52 bg-panel/20 sm:h-96 lg:col-span-3">
              <div className="flex h-full w-full items-center justify-center object-cover transition-all duration-[400ms] group-hover:scale-110">
                Featured Post Image Here
              </div>
            </div>
            <div className="col-span-full flex flex-col justify-center bg-panel/5 p-4 text-center lg:col-span-2 lg:p-6 lg:text-start">
              <MdTypography.P className="text-md font-bold uppercase opacity-70 transition-all hover:text-link">
                Category
              </MdTypography.P>
              <MdTypography.H2 className="text-2xl transition-all group-hover:text-link md:text-3xl">
                Featured Post Title
              </MdTypography.H2>
              <MdTypography.P className="text-md mt-3 hidden w-fit items-center gap-1.5 font-semibold opacity-70 lg:flex">
                Read More
                <FontAwesomeIcon
                  icon={faChevronRight}
                  className="me-2 text-xs"
                />
              </MdTypography.P>
            </div>
          </div>
        </Link>
        {data.allMdx.nodes ? (
          <BlogRoll posts={data.allMdx.nodes} />
        ) : (
          <p>failed loading blog posts</p>
        )}
      </div>
    </Layout>
  );
};
function BlogRoll({
  posts,
}: {
  posts: Queries.IndexPageQuery["allMdx"]["nodes"];
}) {
  if (posts.length > 0) {
    return (
      <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6">
        {posts.map((post) => {
          const postProps = post.frontmatter;
          if (postProps && postProps.slug && postProps.title) {
            const featuredImage =
              postProps.featuredImage?.childImageSharp?.gatsbyImageData &&
              getImage(postProps.featuredImage.childImageSharp.gatsbyImageData);
            return (
              <li key={post.id} className="group">
                <Link to={postProps.slug}>
                  <div className="h-32 overflow-hidden rounded-lg bg-panel/5 sm:h-52">
                    {featuredImage && (
                      <GatsbyImage
                        alt={`${postProps.title} featured image`}
                        image={featuredImage}
                        className="h-full w-full object-cover transition-all duration-[400ms] group-hover:scale-110"
                      />
                    )}
                  </div>

                  <div className="mt-3 flex flex-col">
                    <div>
                      <Link
                        to="/"
                        className="text-sm font-bold uppercase opacity-70 transition-all hover:text-link"
                      >
                        Category
                      </Link>
                    </div>
                    <MdTypography.H4 className="my-0 text-[16px] transition-all group-hover:text-link md:text-[18px]">
                      {postProps.title}
                    </MdTypography.H4>
                    {/* <h4>{postProps.date}</h4> */}
                  </div>

                  {/* <p className="italic">by {postProps.author ?? "unknown"}</p> */}
                </Link>
              </li>
            );
          }
        })}
      </ul>
    );
  }
  return <p>There are no Posts!</p>;
}

export const query = graphql`
  query IndexPage {
    allMdx {
      nodes {
        id
        frontmatter {
          title
          author
          slug
          date(formatString: "MMMM DD, YYYY")
          featuredImage {
            childImageSharp {
              gatsbyImageData(width: 800, placeholder: BLURRED)
            }
          }
        }
        internal {
          contentFilePath
        }
      }
    }
  }
`;
export default IndexPage;
export const Head: HeadFC = () => <title>Storyteller Blog</title>;
