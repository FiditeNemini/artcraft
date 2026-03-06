import { NewsIndex as LibNewsIndex } from "@storyteller/markdown-content";
import Seo from "../../components/seo";
import Footer from "../../components/footer";

const NewsIndex = ({ basePath }: { basePath: string }) => {
  return (
    <div className="bg-[#101014] bg-dots">
      <Seo
        title="News & Updates - ArtCraft"
        description="Latest updates, features, and announcements from the ArtCraft team."
      />
      <LibNewsIndex basePath={basePath} />
      <Footer />
    </div>
  );
};

export default NewsIndex;
