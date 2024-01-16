import React from 'react';
import { SessionContext } from 'context';

interface Props {
  children?: any;
  querySession: any;
  querySubscriptions: any;
  sessionFetched: boolean;
  sessionWrapper?: any;
}

export default function Session({ children, querySession, querySubscriptions, sessionFetched, sessionWrapper }: Props) { 
  return <SessionContext.Provider {...{ value: { querySession, querySubscriptions, sessionFetched, sessionWrapper } }}>
    { children }
  </SessionContext.Provider>
};