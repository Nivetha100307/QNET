import React from 'react';
import { SessionResponse } from '../services';
import { RepeaterPage } from '../modules/repeater/RepeaterPage';

interface EntanglementSwappingModuleProps {
  session: SessionResponse;
  sessionHistory: SessionResponse[];
  onSelectSession: (session: SessionResponse) => void;
}

export const EntanglementSwappingModule: React.FC<EntanglementSwappingModuleProps> = ({
  session,
  sessionHistory,
  onSelectSession
}) => {
  return (
    <RepeaterPage
      session={session}
      sessionHistory={sessionHistory}
      onSelectSession={onSelectSession}
    />
  );
};
