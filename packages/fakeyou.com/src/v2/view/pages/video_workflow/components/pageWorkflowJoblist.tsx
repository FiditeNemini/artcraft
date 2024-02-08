import React, { memo } from 'react'
import { NavLink } from 'react-router-dom';
import { states, Action, State } from "../videoWorkflowReducer";
import { Button, Spinner } from 'components/common';

import CompWorkflowJobList from './compWorkflowJoblist';

export default memo (function PageWorkflowJoblist({
  t, pageState, dispatchPageState, parentPath
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string
  dispatchPageState: (action: Action) => void;
}) {

  return(
    <>
      <div className="row mb-3">
        <NavLink to={`${parentPath}`}>
          <Button
            label={t("button.generateNewWorkflow")}
            variant="primary"
          />
        </NavLink>
      </div>
      {pageState.status === states.WORKFLOW_ENQUEUEING &&
        <div>
          <h2> Requesting Filter Job</h2>
          <Spinner />
        </div>
      }
      <CompWorkflowJobList showNoJobs />
    </>
  );
});