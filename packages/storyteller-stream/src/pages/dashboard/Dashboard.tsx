import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { Route, Switch } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardPage } from "./DashboardPage";
import { Test } from "./Test";

interface Props {
  sessionWrapper: SessionWrapper;
}

class Dashboard extends React.Component<Props> {
  // function Dashboard(props: Props) {
  // if (!props.sessionWrapper.isLoggedIn()) {
  //   return (
  //     <div className="container vh-100 d-flex align-items-center">
  //       <div className="w-100">
  //         <h1 className="text-center">Must Log In</h1>
  //       </div>
  //     </div>
  //   );
  // }
  public render() {
    return (
      <>
        <div className="bg-gradient">
          <div className="container vh-100">
            <div className="p-page-top row gx-5 h-100">
              <div className="d-none d-lg-flex col-lg-3 pb-5">
                {/* Sidebar */}
                <Sidebar />
              </div>
              <div className="col-lg-9">
                {/* Page routes */}
                <Switch>
                  <Route path="/dashboard/home">
                    <DashboardPage />
                  </Route>
                  <Route path="/test">
                    <Test />
                  </Route>
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export { Dashboard };
