import React from 'react';
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import SubRoutes from "./routes";
import { Container } from 'components/common';

export default function ComponentsLibrary({
  sessionWrapper
}:{
  sessionWrapper:SessionWrapper
}){
  return (
    <Container type="panel" className="my-5">
      <SubRoutes />
    </Container>
  );
}