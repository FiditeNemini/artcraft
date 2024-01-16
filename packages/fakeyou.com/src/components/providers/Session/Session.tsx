import React from 'react';
import { SessionContext } from 'context';

interface Props {
  children?: any;
  querySession: any;
  sessionFetched: boolean;
  sessionWrapper?: any;
}

export default function Session({ children, querySession, sessionFetched, sessionWrapper }: Props) { 
  return <SessionContext.Provider {...{ value: { querySession, sessionFetched, sessionWrapper } }}>
    { children }
  </SessionContext.Provider>
};