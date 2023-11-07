import React from 'react';
import { SessionContext } from 'context';

interface Props {
  children?: any;
  sessionWrapper?: any;
}

export default function Session({ children, sessionWrapper }: Props) { 
  return <SessionContext.Provider {...{ value: { sessionWrapper } }}>
    { children }
  </SessionContext.Provider>
};