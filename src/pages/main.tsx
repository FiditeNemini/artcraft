import { withProtectionRoute } from "~/components/hoc";
import { authentication, logout } from "~/signals";
import { PanelRight, PanelBottom } from "~/components/ui";

export const Main = withProtectionRoute(() => {
  return (
    <div className="pegboard fixed grid h-full w-full grid-cols-12 grid-rows-12">
      <PanelRight>
        <p>
          you are logged in as {authentication.userInfo.value?.display_name}
        </p>
        <button onClick={() => logout()}>Logout</button>
      </PanelRight>
      <PanelBottom>
        <p>Panel Bottom</p>
      </PanelBottom>
    </div>
  );
});
