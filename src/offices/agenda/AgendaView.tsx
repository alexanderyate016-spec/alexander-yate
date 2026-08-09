import React from 'react';
import { ChiefOfStaffView } from '../chiefOfStaff/ChiefOfStaffView';
import { MasterState } from '../../types/store';

interface Props {
  state: MasterState;
  onNavigateToOffice?: (officeKey: string) => void;
}

export const AgendaView: React.FC<Props> = (props) => {
  return <ChiefOfStaffView {...props} />;
};

export default AgendaView;
