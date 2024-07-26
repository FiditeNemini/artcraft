import React from "react"
import { MDXProvider } from "@mdx-js/react"
import { graphql, Link } from "gatsby"
import type { PageProps } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import Layout from "./layout"
import { Youtube } from "./Youtube"
import * as MdTypography from "./MdTypography";


const shortcodes = { Link, Youtube } // Provide common components here

export default function PostTemplate({ data, children }:PageProps<Queries.PostTemplateQuery>) {
  const post = data.mdx;
  const featuredImage =
    post?.frontmatter?.featuredImage?.childImageSharp?.gatsbyImageData &&
    getImage(post.frontmatter.featuredImage.childImageSharp.gatsbyImageData);

  return (
    <Layout>
      <Link to="/" className="font-semibold hover:underline opacity-80 text-md">Back to Learn</Link>
      <MdTypography.H1 className="mt-4 mb-6">{post?.frontmatter?.title}</MdTypography.H1>
      <div className="w-full h-[500px] rounded-lg overflow-hidden">
        {featuredImage &&
          <GatsbyImage
            alt={`${post.frontmatter.title} featured image`}
            image={featuredImage}
            className="w-full h-full object-cover"
          />
        }
      </div>
      <div className="mdx-styles mt-6">
        <MDXProvider components={{
          // Map HTML element tag to React component
          h1: MdTypography.H1,
          h2: MdTypography.H2,
          h3: MdTypography.H3,
          h4: MdTypography.H4,
          h5: MdTypography.H5,
          h6: MdTypography.H6,
          p: MdTypography.P,
          ...shortcodes
        }}>
          {children}
        </MDXProvider>
      </div>
    </Layout>
  )
}

export const query = graphql`
  query PostTemplate($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        featuredImage{
          childImageSharp {
            gatsbyImageData(
              width: 800
              placeholder: BLURRED
            )
          }
        }
      }
    }
  }
`