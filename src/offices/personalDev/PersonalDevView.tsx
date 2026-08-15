import React from 'react';
import { PersonalDevOfficeData } from '../../types/store';
import { DailyLifeView } from '../dailyLife/DailyLifeView';

interface Props {
  data?: PersonalDevOfficeData;
}

export const PersonalDevView: React.FC<Props> = () => {
  return <DailyLifeView />;
};
