import React from 'react';
import { CVData } from '../types/cv';
import DefaultCV from './default/web/CV';
import PrideCV from './pride/web/CV';

export const getTemplateComponent = (templateName: string = 'default'): React.FC<{ data: CVData }> => {
  switch (templateName) {
    case 'pride':
      return PrideCV;
    case 'default':
    default:
      return DefaultCV;
  }
};
