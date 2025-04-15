
import { useEffect, useState } from 'react';
import { Box, Package, AlertTriangle, ShoppingCart } from 'lucide-react';
import { getDashboardStats, getMonthlyTransactions, getLowStockProducts, DashboardStats, MonthlyTransaction, LowStockProduct } from '@/services/api';
import StatCard from '@/components/dashboard/StatCard';
import TransactionsChart from '@/components/dashboard/TransactionsChart';
import LowStockTable from '@/components/dashboard/LowStockTable';
import RecentActivityPanel from '@/components/dashboard/RecentActivityPanel';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<MonthlyTransaction[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, transactionsData, lowStocksData] = await Promise.all([
          getDashboardStats(),
          getMonthlyTransactions(),
          getLowStockProducts()
        ]);
        
        setStats(statsData);
        setTransactions(transactionsData);
        setLowStockProducts(lowStocksData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-primary">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <p className="text-muted-foreground">Monitor your inventory performance and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats && (
          <>
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts} 
              icon={Box} 
              description="All products in inventory"
            />
            <StatCard 
              title="Low Stock Items" 
              value={stats.totalLowStockProducts} 
              icon={Package} 
              description="Products below reorder level"
              className={stats.totalLowStockProducts > 0 ? "border-yellow-500/50" : undefined}
            />
            <StatCard 
              title="Out of Stock" 
              value={stats.totalOutOfStockProducts} 
              icon={ShoppingCart} 
              description="Products with zero inventory"
              className={stats.totalOutOfStockProducts > 0 ? "border-red-500/50" : undefined}
            />
            <StatCard 
              title="Alerts YTD" 
              value={stats.totalAlertsYTD} 
              icon={AlertTriangle} 
              description="Total alerts year to date"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <TransactionsChart transactions={transactions} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <LowStockTable products={lowStockProducts} />
        </div>
        <RecentActivityPanel />
      </div>
    </div>
  );
};

export default Dashboard;
