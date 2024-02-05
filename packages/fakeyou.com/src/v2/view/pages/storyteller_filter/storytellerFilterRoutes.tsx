import React from "react";
import {Switch, Route, useRouteMatch, Redirect} from "react-router-dom";
import PageFilterControls from "./components/pageFilterControls";
import PageVideoProvision from "./components/pageVideoProvision";
import PageJobList from "./components/pageJobList";
import {State,Action} from "./storytellerFilterReducer";

export default function SubRoutes ({
  debug, t, pageState, dispatchPageState
}:{
  debug?:boolean,
  t:Function,
  pageState:State,
  dispatchPageState: (action: Action) => void
}){
  const { path } = useRouteMatch();

  return(
    <Switch>
      <Route exact path={`${path}/load/:mediaToken`} >
        <PageFilterControls {...{debug, t, pageState, dispatchPageState}}/>
      </Route>
      <Route exact path={`${path}/upload`}>
        <PageVideoProvision {...{debug, t, pageState, dispatchPageState}}/>
      </Route>
      <Route exact path={`${path}/select-media`}>
        <PageVideoProvision {...{debug, t, pageState, dispatchPageState}}/>
      </Route>
      <Route exact path={`${path}/jobs`}>
        <PageJobList {...{debug, t, pageState, dispatchPageState}}/>
      </Route>
      <Route path={`${path}`}>
        <Redirect to={`${path}/upload`} />
      </Route>
    </Switch>
  )
}
  