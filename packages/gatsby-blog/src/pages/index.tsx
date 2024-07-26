import React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import { GatsbyImage, getImage } from "gatsby-plugin-image"
import "../styles/global.css";
import Layout from "../components/layout"
import * as MdTypography from "../components/MdTypography";


const IndexPage = ({data}:PageProps<Queries.IndexPageQuery>) =>{
  console.log(data)
  return(
    <Layout>
      <div className="flex flex-col gap-6">
        <div>
          <MdTypography.H1 className="mb-1 md:mb-2">Learn</MdTypography.H1>
          <MdTypography.P className="opacity-90 text-[18px] leading-6">Tutorials, tips and tricks on how to create better content.</MdTypography.P>
        </div>
        <Link to="/">
          <div className="grid grid-cols-5 rounded-lg overflow-hidden group">
              <div className="col-span-full lg:col-span-3 bg-panel/20 h-52 sm:h-96">
                <div className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[400ms] flex items-center justify-center">
                  Featured Post Image Here
                </div>
              </div>
              <div className="col-span-full lg:col-span-2 p-4 lg:p-6 text-center lg:text-start bg-panel/5 flex flex-col justify-center">
                <MdTypography.P className="text-sm font-bold opacity-70 hover:text-link transition-all uppercase">Category</MdTypography.P>
                <MdTypography.H2 className="group-hover:text-link transition-all">Featured Post Title</MdTypography.H2>
                <MdTypography.P className="hidden lg:block mt-3 font-semibold opacity-70">Read More</MdTypography.P>
              </div>
          </div>
        </Link>
        {data.allMdx.nodes 
          ? <BlogRoll posts={data.allMdx.nodes} />
          : <p>failed loading blog posts</p>
        }
      </div>
    </Layout>
  )
}
function BlogRoll ({posts}:{posts:Queries.IndexPageQuery["allMdx"]["nodes"]}){
  if (posts.length > 0){
    return(
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {posts.map((post)=>{
          const postProps = post.frontmatter;
          if(postProps && postProps.slug && postProps.title){
            const featuredImage = postProps.featuredImage?.childImageSharp?.gatsbyImageData && getImage(postProps.featuredImage.childImageSharp.gatsbyImageData);
            return(
              <li key={post.id} className="group">
                <Link to={postProps.slug}>
                  <div className="rounded-lg overflow-hidden bg-panel/5 h-32 sm:h-52">
                    {featuredImage &&
                    <GatsbyImage
                      alt={`${postProps.title} featured image`}
                      image={featuredImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[400ms]"
                    />
                    }
                  </div>
                  
                  <div className="flex flex-col mt-3">
                    <div>
                      <Link to="/" className="text-sm font-bold opacity-70 hover:text-link transition-all uppercase">Category</Link>
                    </div>
                    <MdTypography.H4 className="group-hover:text-link transition-all my-0">{postProps.title}</MdTypography.H4>
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
  return <p>There are no Posts!</p>
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
export default IndexPage;
export const Head: HeadFC = () => <title>Storyteller Blog</title>