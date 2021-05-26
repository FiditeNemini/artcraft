import React from 'react';
import { Link, Switch, Route } from 'react-router-dom';

interface Props {
  enableAlpha: boolean,
}

function MigrationTopNav_VersionSwitch(props: Props) {
  if (!props.enableAlpha) {
    return <nav />
  }

  return (
    <Switch>
      <Route path="/old">
        <Link to="/"
          className="button is-danger is-inverted"
          >Switch to new vocodes (custom voices, video uploads, and more!)</Link>
      </Route>
      <Route path="/">
        <Link to="/old"
          className="button is-danger is-inverted"
          >Switch to old vocodes (80+ voices)</Link>
      </Route>
    </Switch>
  );
}

export { MigrationTopNav_VersionSwitch };
