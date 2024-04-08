import { withProtectionRoute } from "~/modules/withProtectedRoute";
import { PageEnigma } from "~/pages/PageEnigma";

const IdealEnigma = withProtectionRoute(()=><PageEnigma />);
export default IdealEnigma;