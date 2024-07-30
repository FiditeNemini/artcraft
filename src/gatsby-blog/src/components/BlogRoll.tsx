import React from "react";

import { P } from "./MdTypography";
import { BlogRollItem } from "./BlogRollItem";
import { staiFrontmatter } from "../models/frontmatter";

export function BlogRoll({
  posts,
}: {
  posts: Queries.IndexPageQuery["allMdx"]["nodes"];
}) {
  if (posts.length > 0) {
    return (
      <ul className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6">
        {posts.map((post) => {
          return <BlogRollItem key={post.id} postFrontmatter={post.frontmatter as staiFrontmatter}/>
          
        })}
      </ul>
    );
  }
  return <P>There are no Posts!</P>;
}