
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Sliders } from 'lucide-react';

export const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (err) {
    return dateString;
  }
};

export const getTransactionBadgeColor = (type: string) => {
  switch (type) {
    case 'IN':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'OUT':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'ADJUSTMENT':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    default:
      return '';
  }
};

export const getTransactionIcon = (type: string) => {
  switch (type) {
    case 'IN':
      return <ArrowDown className="h-4 w-4 mr-1" />;
    case 'OUT':
      return <ArrowUp className="h-4 w-4 mr-1" />;
    case 'ADJUSTMENT':
      return <Sliders className="h-4 w-4 mr-1" />;
    default:
      return null;
  }
};
