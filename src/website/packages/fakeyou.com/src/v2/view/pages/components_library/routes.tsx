import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import ReadMePage from "./readme";
import ComponentSandbox from "./sandbox";
import LibraryOfCommonComponents from "./library";

export default function SubRoutes(){
  const { path } = useRouteMatch();
  const commonPageProps = {
    parentPath: path
  };
  return(
    <Switch>
      <Route exact path={`${path}/common`}>
        <LibraryOfCommonComponents {...commonPageProps}/>
      </Route>
      <Route exact path={`${path}/sandbox`}>
        <ComponentSandbox {...commonPageProps}/>
      </Route>
      <Route exact path={`${path}`}>
        <ReadMePage {...commonPageProps}/>
      </Route>
    </Switch>
  );
}