import React from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { getAllOrders } from '../../api/manageOrder';
import {
  exportRevenueExcel,
  getRevenueDashboard,
  getRevenuePaymentBreakdown,
} from '../../api/revenue';

// ─── Types ───────────────────────────────────────────────────────────────

interface RevenuePoint {
  month: string;
  revenue: number;      // in rupees
  orders: number;
  avgOrderValue: number;
}

interface PaymentMethod {
  label: string;
  amount: number;
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface PendingOrder {
  table: number | string;
  orderNumber: string;
  amount: number;
  status: 'Pending' | 'Unpaid';
}

interface OrderItem {
  nameAtOrder?: string;
  quantity?: number;
  priceAtOrder?: number;
}

interface Order {
  _id: string;
  tableNumber?: number;
  orderNumber?: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
  payment?: { method?: string; status?: string }[];
  items?: OrderItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString('en-IN')}`;

const formatLakhs = (value: number) => {
  const lakhs = value / 100000;
  return `₹${lakhs.toFixed(2)}L`;
};

const getMonthLabel = (label: string) => {
  const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(label);
  return monthIndex >= 0
    ? new Date(2020, monthIndex, 1).toLocaleString('en-IN', { month: 'long' })
    : label;
};

const getPercentageChange = (current: number, previous: number) => {
  if (!previous) return current ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// ─── Component ──────────────────────────────────────────────────────────

const RestaurantDashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = React.useState<'6m' | '12m' | 'all'>('6m');
  const [hoveredPoint, setHoveredPoint] = React.useState<RevenuePoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [revenueHistoryData, setRevenueHistoryData] = React.useState<RevenuePoint[]>([]);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [topItems, setTopItems] = React.useState<TopItem[]>([]);
  const [pendingOrders, setPendingOrders] = React.useState<PendingOrder[]>([]);
  const [metrics, setMetrics] = React.useState<Record<string, { value: number; changePercent: number }>>({});
  const [todayOrderCount, setTodayOrderCount] = React.useState(0);
  const [monthlyOrderCount, setMonthlyOrderCount] = React.useState(0);
  const [monthlyOrderChange, setMonthlyOrderChange] = React.useState(0);
  const [todayAverageOrderValue, setTodayAverageOrderValue] = React.useState(0);
  const [todayOrderChange, setTodayOrderChange] = React.useState(0);
  const [todayAverageChange, setTodayAverageChange] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const loadDashboard = React.useCallback(async () => {
    try {
      setError(null);
      const [revenueResponse, paymentResponse, ordersResponse] = await Promise.all([
        getRevenueDashboard({ range: 'this-year', limit: 100 }),
        getRevenuePaymentBreakdown({ range: 'this-month' }),
        getAllOrders(),
      ]);
      const overview = revenueResponse?.overview ?? {};
      const series = revenueResponse?.trend?.series ?? [];
      const orders: Order[] = ordersResponse?.data ?? [];
      const servedOrders = orders.filter((order) => order.status === 'served');
      const itemMap = new Map<string, TopItem>();
      const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const previousMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
      const currentMonthOrders = servedOrders.filter((order) => {
        const createdAt = new Date(order.createdAt ?? 0);
        return createdAt >= currentMonthStart;
      });
      const todayKey = new Date().toDateString();
      const yesterdayKey = new Date(Date.now() - 86400000).toDateString();
      const todayOrders = orders.filter((order) => new Date(order.createdAt ?? 0).toDateString() === todayKey);
      const monthlyOrders = orders.filter((order) => new Date(order.createdAt ?? 0) >= currentMonthStart);
      const previousMonthOrders = orders.filter((order) => {
        const createdAt = new Date(order.createdAt ?? 0);
        return createdAt >= previousMonthStart && createdAt < currentMonthStart;
      });
      const yesterdayOrders = orders.filter((order) => new Date(order.createdAt ?? 0).toDateString() === yesterdayKey);
      const todayTotal = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
      const yesterdayTotal = yesterdayOrders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0);
      const monthlyOrderStats = new Map<string, { orders: number; revenue: number }>();

      orders.forEach((order) => {
        const date = new Date(order.createdAt ?? 0);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        const current = monthlyOrderStats.get(monthKey) ?? { orders: 0, revenue: 0 };
        current.orders += 1;
        current.revenue += Number(order.totalAmount ?? 0);
        monthlyOrderStats.set(monthKey, current);
      });

      currentMonthOrders.forEach((order) => {
        (order.items ?? []).forEach((item) => {
          const name = item.nameAtOrder || 'Unnamed item';
          const current = itemMap.get(name) ?? { name, quantity: 0, revenue: 0 };
          current.quantity += Number(item.quantity ?? 0);
          current.revenue += Number(item.priceAtOrder ?? 0) * Number(item.quantity ?? 0);
          itemMap.set(name, current);
        });
      });

      setRevenueHistoryData(series.map((point: { label: string; value: number }) => {
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].indexOf(point.label);
        const monthKey = `${new Date().getFullYear()}-${monthIndex}`;
        const stats = monthlyOrderStats.get(monthKey) ?? { orders: 0, revenue: 0 };
        return {
        month: getMonthLabel(point.label),
        revenue: Number(point.value ?? 0),
        orders: stats.orders,
        avgOrderValue: stats.orders ? stats.revenue / stats.orders : 0,
      }; }));
      setPaymentMethods((paymentResponse ?? []).map((method: PaymentMethod) => ({
        label: method.label,
        amount: Number(method.amount ?? 0),
      })));
      setTopItems(Array.from(itemMap.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5));
      setPendingOrders(orders
        .filter((order) => ['pending', 'failed'].includes(order.payment?.[0]?.status ?? 'pending'))
        .sort((a, b) => Number(new Date(b.createdAt ?? 0)) - Number(new Date(a.createdAt ?? 0)))
        .slice(0, 10)
        .map((order) => ({
          table: order.tableNumber ?? '-',
          orderNumber: order.orderNumber ? `#${order.orderNumber.replace(/^#/, '')}` : order._id,
          amount: Number(order.totalAmount ?? 0),
          status: order.payment?.[0]?.status === 'failed' ? 'Unpaid' : 'Pending',
        })));
      setMetrics(Object.fromEntries((overview.metrics ?? []).map((metric: { key: string; value: number; changePercent: number }) => [
        metric.key,
        { value: Number(metric.value ?? 0), changePercent: Number(metric.changePercent ?? 0) },
      ])));
      setTodayOrderCount(todayOrders.length);
      setMonthlyOrderCount(monthlyOrders.length);
      setMonthlyOrderChange(getPercentageChange(monthlyOrders.length, previousMonthOrders.length));
      setTodayAverageOrderValue(todayOrders.length
        ? todayTotal / todayOrders.length
        : 0);
      setTodayOrderChange(getPercentageChange(todayOrders.length, yesterdayOrders.length));
      setTodayAverageChange(getPercentageChange(
        todayOrders.length ? todayTotal / todayOrders.length : 0,
        yesterdayOrders.length ? yesterdayTotal / yesterdayOrders.length : 0,
      ));
      setLastUpdated(new Date());
    } catch {
      setError('Unable to load live dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(loadDashboard);
    const refreshTimer = window.setInterval(loadDashboard, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [loadDashboard]);

  const totalPending = pendingOrders.reduce((sum, order) => sum + order.amount, 0);

  const metric = (key: string) => metrics[key] ?? { value: 0, changePercent: 0 };

  // Filter data based on selected time filter
  const filteredData = React.useMemo(() => {
    if (timeFilter === 'all') return revenueHistoryData;
    const months = timeFilter === '6m' ? 6 : 12;
    return revenueHistoryData.slice(-months);
  }, [revenueHistoryData, timeFilter]);

  const handleExport = async () => {
    try {
      await exportRevenueExcel({ range: 'this-year' });
    } catch {
      setError('Unable to export the revenue report.');
    }
  };

  // Chart dimensions
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxRevenue = Math.max(...filteredData.map(d => d.revenue), 1);

  // Generate path for the line
  const points = filteredData
    .map((d, i) => {
      const x = padding.left + (i / (filteredData.length - 1 || 1)) * innerWidth;
      const y = padding.top + innerHeight - (d.revenue / maxRevenue) * innerHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = points
    ? `${points} ${padding.left + innerWidth},${padding.top + innerHeight} ${padding.left},${padding.top + innerHeight}`
    : '';

  // Compute payment percentages
  const totalPayments = paymentMethods.reduce((sum, p) => sum + p.amount, 0);

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* ─── Header ───────────────────────────────────────────── */}
          <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Real‑time revenue &amp; order overview</p>
              {lastUpdated && (
                <p className="mt-1 text-xs text-slate-400">Updated {lastUpdated.toLocaleTimeString()}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={loadDashboard}
                aria-label="Refresh dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-amber-400 hover:text-amber-600 cursor-pointer"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-amber-400 hover:text-amber-600 cursor-pointer"
              >
                <FileSpreadsheet size={16} />
                Export Excel
              </button>
            </div>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* ─── KPI Cards ────────────────────────────────────────── */}
          <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard
              label="Today's Revenue"
              value={formatCurrency(metric('todayRevenue').value)}
              change={metric('todayRevenue').changePercent}
            />
            <KpiCard
              label="Orders Today"
              value={todayOrderCount.toLocaleString('en-IN')}
              change={todayOrderChange}
            />
            <KpiCard
              label="Monthly Orders"
              value={monthlyOrderCount.toLocaleString('en-IN')}
              change={monthlyOrderChange}
            />
            <KpiCard
              label="Avg. Order Value Today"
              value={formatCurrency(todayAverageOrderValue)}
              change={todayAverageChange}
            />
            <KpiCard
              label="Monthly Revenue"
              value={formatLakhs(metric('monthRevenue').value)}
              change={metric('monthRevenue').changePercent}
            />
          </section>

          {/* ─── Revenue History + Payment Breakdown ────────────── */}
          <section className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            {/* Revenue History */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Revenue History
                  </p>
                  <h2 className="text-base font-semibold text-slate-800">
                    Monthly performance
                  </h2>
                </div>
                <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-medium">
                  {(['6m', '12m', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTimeFilter(filter)}
                      className={`rounded-md px-3 py-1 transition-colors ${
                        timeFilter === filter
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                      }`}
                    >
                      {filter === '6m' ? '6 Months' : filter === '12m' ? '12 Months' : 'All Time'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div className="relative mt-4 overflow-x-auto">
                {filteredData.length > 0 ? (
                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full"
                    style={{ minWidth: '320px' }}
                    onMouseMove={(event) => {
                      const bounds = event.currentTarget.getBoundingClientRect();
                      const chartX = ((event.clientX - bounds.left) / bounds.width) * width;
                      const position = Math.max(0, Math.min(1, (chartX - padding.left) / innerWidth));
                      const index = Math.round(position * (filteredData.length - 1));
                      setHoveredIndex(index);
                      setHoveredPoint(filteredData[index]);
                    }}
                    onMouseLeave={() => {
                      setHoveredIndex(null);
                      setHoveredPoint(null);
                    }}
                  >
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
                      const y = padding.top + innerHeight - frac * innerHeight;
                      return (
                        <line
                          key={frac}
                          x1={padding.left}
                          x2={padding.left + innerWidth}
                          y1={y}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeWidth="0.5"
                          strokeDasharray="4 4"
                        />
                      );
                    })}

                    {/* Area fill */}
                    <path d={`M ${areaPoints}`} fill="url(#revenueGrad)" opacity="0.1" />

                    {/* Line */}
                    <path
                      d={`M ${points}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {hoveredIndex !== null && (
                      <line
                        x1={padding.left + (hoveredIndex / (filteredData.length - 1 || 1)) * innerWidth}
                        x2={padding.left + (hoveredIndex / (filteredData.length - 1 || 1)) * innerWidth}
                        y1={padding.top}
                        y2={padding.top + innerHeight}
                        stroke="#f59e0b"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                        opacity="0.7"
                        pointerEvents="none"
                      />
                    )}

                    {/* Data points with tooltip on hover */}
                    {filteredData.map((d, i) => {
                      const x = padding.left + (i / (filteredData.length - 1 || 1)) * innerWidth;
                      const y = padding.top + innerHeight - (d.revenue / maxRevenue) * innerHeight;
                      return (
                        <g key={d.month}>
                          <circle
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#f59e0b"
                            stroke="white"
                            strokeWidth="1.5"
                          />
                        </g>
                      );
                    })}

                    {/* X-axis labels */}
                    {filteredData.map((d, i) => {
                      const x = padding.left + (i / (filteredData.length - 1 || 1)) * innerWidth;
                      return (
                        <text
                          key={d.month}
                          x={x}
                          y={height - 4}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#94a3b8"
                        >
                          {d.month}
                        </text>
                      );
                    })}

                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fde68a" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-slate-400">
                    No data
                  </div>
                )}
              </div>

              {/* Tooltip */}
              {hoveredPoint && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-sm">
                  <p className="font-semibold text-slate-800">{hoveredPoint.month}</p>
                  <div className="mt-1 grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Revenue</span>
                      <p className="font-medium text-slate-900">{formatLakhs(hoveredPoint.revenue)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Orders</span>
                      <p className="font-medium text-slate-900">{hoveredPoint.orders}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Avg. Order</span>
                      <p className="font-medium text-slate-900">{formatCurrency(hoveredPoint.avgOrderValue)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Payment Breakdown
              </p>
              <h2 className="text-base font-semibold text-slate-800">
                Revenue by method
              </h2>

              <div className="mt-4 space-y-4">
                {paymentMethods.map((method) => {
                  const percentage = (method.amount / totalPayments) * 100;
                  const colors: Record<string, string> = {
                    Cash: '#f59e0b',
                    UPI: '#3b82f6',
                    Card: '#10b981',
                  };
                  return (
                    <div key={method.label} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{method.label}</span>
                        <span className="text-slate-600">
                          {formatCurrency(method.amount)}
                          <span className="ml-2 text-xs text-slate-400">
                            ({percentage.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors[method.label] || '#94a3b8',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ─── Top Items + Pending Orders ──────────────────────── */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Top Selling Items */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Top Selling Items
              </p>
              <h2 className="text-base font-semibold text-slate-800">
                Most ordered this month
              </h2>

              <div className="mt-4 space-y-3">
                {topItems.map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>{item.quantity} sold</span>
                      <span className="font-medium text-slate-800">
                        {formatCurrency(item.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Orders */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    Pending Orders
                  </p>
                  <h2 className="text-base font-semibold text-slate-800">
                    Unpaid payments
                  </h2>
                </div>
                <div className="rounded-xl bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                  Total: {formatCurrency(totalPending)}
                </div>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                      <th className="pb-2 pr-3 font-medium">Table</th>
                      <th className="pb-2 pr-3 font-medium">Order</th>
                      <th className="pb-2 pr-3 font-medium text-right">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingOrders.map((order) => (
                      <tr key={order.orderNumber} className="hover:bg-slate-50/60">
                        <td className="py-2.5 pr-3 font-medium text-slate-800">
                          Table {order.table}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-600">{order.orderNumber}</td>
                        <td className="py-2.5 pr-3 text-right font-medium text-slate-900">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="py-2.5">
                          <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="mt-8 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Cheffest — Restaurant Management
          </footer>
        </div>
      </main>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────

const KpiCard: React.FC<{
  label: string;
  value: string;
  change?: number;
}> = ({ label, value, change }) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const changeDisplay = change !== undefined ? `${Math.abs(change).toFixed(1)}%` : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold text-slate-900">{value}</p>
      {changeDisplay && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700'
                : isNegative
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {changeDisplay}
          </span>
          <span className="text-slate-400">vs prev.</span>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;