import React from "react";
import {Switch, Route, useRouteMatch, Redirect, useHistory} from "react-router-dom";
import PageWorkflowControls from "./components/pageWorkflowControls";
import PageVideoProvision from "./components/pageVideoProvision";
import PageWorkflowJoblist from "./components/pageWorkflowJoblist";
import {states,State,Action} from "./videoWorkflowReducer";

export default function SubRoutes ({
  debug, t, pageState, dispatchPageState
}:{
  debug?:boolean,
  t:Function,
  pageState:State,
  dispatchPageState: (action: Action) => void
}){
  const { path } = useRouteMatch();
  const history = useHistory();
  history.listen(({pathname}, action) => {
    if ((pathname === path || pathname.match(/upload|select-media/g)) && pageState.status >= states.FILE_LOADING){
      //reset page if landed on page "Freshly"
      dispatchPageState({type: 'reset'})
    }
  })


  const commonPageProps = {
    debug, parentPath: path, t, pageState, dispatchPageState
  };

  return(
    <Switch>
      <Route exact path={`${path}/load/:mediaToken`} >
        <PageWorkflowControls {...commonPageProps}/>
      </Route>
      <Route exact path={`${path}/upload`}>
        <PageVideoProvision {...commonPageProps}/>
      </Route>
      <Route exact path={`${path}/select-media`}>
        <PageVideoProvision {...commonPageProps}/>
      </Route>
      <Route exact path={`${path}/jobs`}>
        <PageWorkflowJoblist {...commonPageProps}/>
      </Route>
      <Route path={`${path}`}>
        <Redirect to={`${path}/upload`} />
      </Route>
    </Switch>
  )
}
  