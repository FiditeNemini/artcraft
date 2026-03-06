import {
  NewsPost as LibNewsPost,
  getNewsPostBySlug,
} from "@storyteller/markdown-content";
import Seo from "../../components/seo";
import Footer from "../../components/footer";
import { useParams } from "react-router-dom";

const NewsPost = ({ basePath }: { basePath: string }) => {
  const { slug } = useParams();
  const post = slug ? getNewsPostBySlug(slug) : null;

  const title = post
    ? `${post.title} - ArtCraft`
    : "Article Not Found - ArtCraft";
  const desc = post ? post.description : "";

  return (
    <div className="bg-[#101014] bg-dots">
      <Seo title={title} description={desc} />
      <LibNewsPost basePath={basePath} />
      <Footer />
    </div>
  );
};

export default NewsPost;
