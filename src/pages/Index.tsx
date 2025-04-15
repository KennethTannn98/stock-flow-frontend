
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from './Dashboard';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
};

export default Index;
