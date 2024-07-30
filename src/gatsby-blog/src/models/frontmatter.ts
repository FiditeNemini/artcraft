import { IGatsbyImageData } from "gatsby-plugin-image";

export type staiFrontmatter = {
  readonly title: string;
  readonly metaText: string | null;
  readonly slug: string;
  readonly date: string;
  readonly author: string | null;
  readonly category: string | null;
  readonly featured: boolean | null;
  readonly featuredImage: {
      readonly childImageSharp: {
          readonly gatsbyImageData: IGatsbyImageData;
      } | null;
  } | null;
}