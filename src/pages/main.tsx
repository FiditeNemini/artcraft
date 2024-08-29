import { withProtectionRoute } from "~/components/hoc";
import { authentication } from "~/signals";

export const Main = withProtectionRoute(() => {
  return (
    <div>
      <p>you are logged in as {authentication.userInfo.value?.display_name}</p>
    </div>
  );
});
