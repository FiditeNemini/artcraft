import React from "react";
import { graphql } from "gatsby";
import type { HeadFC, PageProps } from "gatsby";

import * as MdTypography from "../components/MdTypography";
import { BlogRoll, HeroPost, Layout } from "../components";

import "../styles/global.css";
import { staiFrontmatter } from "../models/frontmatter";

const {P, H1} = MdTypography;

export const Head: HeadFC = () => <title>Storyteller Blog</title>;
const IndexPage = ({ data }: PageProps<Queries.IndexPageQuery>) => {
  const allPosts = data.allMdx.nodes;
  const heroPost = allPosts.find((post)=>post?.frontmatter?.featured);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <H1 className="mb-1 md:mb-2">Learn</H1>
          <P className="text-[18px] font-semibold leading-6 opacity-80">
            Tutorials, tips and tricks on how to create better content.
          </P>
        </div>
        {heroPost && <HeroPost postFrontmatter={heroPost.frontmatter as staiFrontmatter} />}
        {allPosts ? (
          <BlogRoll posts={data.allMdx.nodes} />
        ) : (
          <P>Failed loading blog posts</P>
        )}
      </div>
    </Layout>
  );
};

export const query = graphql`
  query IndexPage {
    allMdx {
      nodes {
        id
        frontmatter {
          title
          slug
          date(formatString: "MMMM DD, YYYY")
          author
          category    
          featured      
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

