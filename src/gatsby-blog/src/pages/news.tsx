import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"

import { Layout } from "../components/layout"

export const Head: HeadFC = () => <title>News Page</title>
const NewsPage = ({data}:PageProps<Queries.NewsPageQuery>) =>{
  console.log(data)
  return(
    <Layout>
      <h1>Welcome to the Story Teller Blog</h1>
      <br/>
      <br/>
      <h2>Blog Posts (MDX)</h2>
      {data.allMdx.nodes 
        ? <NewsRoll posts={data.allMdx.nodes} />
        : <p>failed loading blog posts</p>
      }
    </Layout>
  )
}
function NewsRoll ({posts}:{posts:Queries.NewsPageQuery["allMdx"]["nodes"]}){
  if (posts.length > 0){
    return(
      <ul>
        {posts.map((post)=>{
          const postProps = post.frontmatter;
          if(postProps && postProps.slug && postProps.title){
            const featuredImage = postProps.featuredImage?.childImageSharp?.gatsbyImageData && getImage(postProps.featuredImage.childImageSharp.gatsbyImageData);
            return(
              <li key={post.id} className="border border-black my-2 p-2">
                <Link to={postProps.slug}>
                  <div className="flex justify-between">
                    <h3>{postProps.title}</h3>
                    <h4>{postProps.date}</h4>
                  </div>
                  {featuredImage &&
                    <GatsbyImage
                      alt={`${postProps.title} featured image`}
                      image={featuredImage}
                    />
                  }
                  <p className="italic">by {postProps.author ?? "unknown"}</p>
                </Link>
              </li>
            );
          }
        })}
      </ul>
    );
  }
  return <p>There are no Posts!</p>
}

export const query = graphql`
  query NewsPage {
    allMdx(filter: { frontmatter: { category: { eq: "news" } } }) {
      nodes {
        id
        frontmatter {
          title
          author
          slug
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
        internal {
          contentFilePath
        }
      }
    }
  }
`
export default NewsPage;
