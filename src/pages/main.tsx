import { withProtectionRoute } from "~/components/hoc";
import { authentication, logout } from "~/signals";
import { RightSidePanel } from "~/components/ui";

export const Main = withProtectionRoute(() => {
  return (
    <div className="fixed grid h-full w-full grid-cols-12">
      <RightSidePanel>
        <p>
          you are logged in as {authentication.userInfo.value?.display_name}
        </p>
        <button onClick={() => logout()}>Logout</button>
      </RightSidePanel>
    </div>
  );
});
