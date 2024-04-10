import type { HeadersFunction } from "@remix-run/deno";
import { withProtectionRoute } from "~/modules/withProtectedRoute";
import { PageStylization } from "~/pages/PageStylization";

export const headers: HeadersFunction = () => ({
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Opener-Policy": "same-origin",
});

const Stylization = withProtectionRoute(() => <PageStylization />);
export default Stylization;
