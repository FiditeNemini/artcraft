import { withProtectionRoute } from "~/components/hoc";
import { authentication, logout } from "~/signals";

export const Main = withProtectionRoute(() => {
  return (
    <div className="flex flex-col items-center justify-center">
      <p>you are logged in as {authentication.userInfo.value?.display_name}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
});
