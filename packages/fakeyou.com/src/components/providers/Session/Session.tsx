import React from 'react';
import { SessionContext } from 'context';

interface Props {
  children?: any;
  sessionFetched: boolean;
  sessionWrapper?: any;
}

export default function Session({ children, sessionFetched, sessionWrapper }: Props) { 
  return <SessionContext.Provider {...{ value: { sessionFetched, sessionWrapper } }}>
    { children }
  </SessionContext.Provider>
};