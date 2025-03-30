
import React from 'react';
import { useData } from '@/context/DataContext';
import Layout from '@/components/Layout';
import StatCard from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuotationStatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Users,
  Package,
  FileText,
  TrendingUp,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { clients, products, quotations, getDashboardStats } = useData();
  const stats = getDashboardStats();
  
  // Prepare data for status chart
  const statusData = [
    { name: 'Draft', value: quotations.filter(q => q.status === 'draft').length },
    { name: 'Sent', value: quotations.filter(q => q.status === 'sent').length },
    { name: 'Accepted', value: quotations.filter(q => q.status === 'accepted').length },
    { name: 'Declined', value: quotations.filter(q => q.status === 'declined').length },
  ].filter(item => item.value > 0);

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Recent quotations
  const recentQuotations = [...quotations]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-gray-500">Welcome to your sales quotation overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Quotations"
            value={stats.totalQuotations}
            icon={<FileText size={24} />}
          />
          <StatCard
            title="Total Clients"
            value={stats.totalClients}
            icon={<Users size={24} />}
          />
          <StatCard
            title="Products"
            value={stats.totalProducts}
            icon={<Package size={24} />}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            icon={<TrendingUp size={24} />}
            description="Accepted vs. total sent quotations"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value} quotations`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center items-center h-[300px]">
                  <p className="text-gray-500">No quotation data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentQuotations.length > 0 ? (
                  recentQuotations.map(quotation => {
                    const client = clients.find(c => c.id === quotation.clientId);
                    return (
                      <div key={quotation.id} className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <div className="font-medium">
                            {client ? `${client.name} ${client.surname}` : 'Unknown Client'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(quotation.createdAt)} • {formatCurrency(quotation.total)}
                          </div>
                        </div>
                        <QuotationStatusBadge status={quotation.status} />
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent quotations</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
