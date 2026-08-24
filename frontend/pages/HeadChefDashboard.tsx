import { type ReactNode, useCallback, useEffect, useState } from "react";
import { getAllOrders, manageOrderStatus } from "../api/manageOrder";
import CustomSelect from "../components/global/CustomSelect";
import Loader from "../components/global/loader";
import {
  AlertCircle,
  CheckCircle,
  ChefHat,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

interface OrderItem {
  _id?: string;
  item?: string;
  nameAtOrder?: string;
  priceAtOrder?: number;
  quantity?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  tableNumber: number;
  totalAmount: number;
  items: OrderItem[];
  payment: Array<{ status?: string }>;
  createdAt: string;
}

interface PendingStatusChange {
  orderId: string;
  orderNumber: string;
  currentStatus: string;
  newStatus: string;
}

const STATUS_OPTIONS = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "served",
  "cancelled",
] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: ReactNode }> = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <Clock className="w-4 h-4" />,
  },
  accepted: {
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  preparing: {
    bg: "bg-orange-100",
    text: "text-orange-800",
    icon: <ChefHat className="w-4 h-4" />,
  },
  ready: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <UtensilsCrossed className="w-4 h-4" />,
  },
  served: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function HeadChefDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pendingChange, setPendingChange] = useState<PendingStatusChange | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const resp = await getAllOrders();
      const data = resp.data || resp.orders || resp;
      const arr = Array.isArray(data) ? data : data?.orders || [];
      setOrders(arr);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchOrders]);

  const handleStatusSelection = (order: Order, newStatus: string) => {
    setPendingChange({
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      newStatus,
    });
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;

    setUpdatingOrderId(pendingChange.orderId);

    try {
      await manageOrderStatus(pendingChange.orderId, pendingChange.newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === pendingChange.orderId
            ? { ...order, status: pendingChange.newStatus }
            : order
        )
      );
      setError(null);
      setPendingChange(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const cancelPendingChange = () => {
    setPendingChange(null);
    setUpdatingOrderId(null);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeOrdersCount = orders.filter(
    (order) => !["served", "cancelled"].includes(order.status)
  ).length;

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fffaf3_0%,#ffe8c8_100%)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-orange-100 bg-white/90 p-5 shadow-xl backdrop-blur-sm md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#ff9900]/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-[#ff9900]">
                <Sparkles className="h-4 w-4" />
                Kitchen Control
              </div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 md:text-3xl">
                <ChefHat className="h-7 w-7 text-[#ff9900]" />
                Head Chef Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-500 md:text-base">
                Review kitchen orders, update progress, and confirm every change before it goes live.
              </p>
            </div>
            <button
              onClick={() => void fetchOrders()}
              disabled={loading}
              className="flex items-center gap-2 self-start rounded-xl bg-[#ff9900] px-4 py-2.5 text-sm font-semibold text-white transition cursor-pointer hover:bg-[#ff8800] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length, accent: "text-gray-800" },
            { label: "Active Orders", value: activeOrdersCount, accent: "text-[#ff9900]" },
            { label: "Ready to Serve", value: orders.filter((order) => order.status === "ready").length, accent: "text-green-600" },
            { label: "Cancelled", value: orders.filter((order) => order.status === "cancelled").length, accent: "text-red-500" },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`mt-2 text-2xl font-bold ${card.accent}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:flex-row md:p-5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order # or table..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none ring-0 focus:border-[#ff9900]"
            />
          </div>
          <CustomSelect
            value={statusFilter}
            options={[
              { value: "all", label: "All Statuses", description: "View every order" },
              ...STATUS_OPTIONS.map((status) => ({
                value: status,
                label: status.charAt(0).toUpperCase() + status.slice(1),
                description: `Show ${status} orders`,
              })),
            ]}
            onChange={(value) => setStatusFilter(value)}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => void fetchOrders()} className="ml-auto font-semibold underline">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-sm">
            <Loader message="Loading kitchen orders..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-gray-100 bg-white py-12 text-center shadow-sm">
            <UtensilsCrossed className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter !== "all" || searchTerm ? "Try adjusting your filters" : "New orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => {
              const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.pending;

              return (
                <div key={order._id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{order.orderNumber}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Table {order.tableNumber} • ₹{order.totalAmount?.toFixed(2) ?? "0.00"}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.icon}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <p className="mb-4 text-sm text-gray-600">
                    {order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}
                  </p>

                  <div>
                    <CustomSelect
                      label="Update status"
                      value={order.status}
                      options={STATUS_OPTIONS.map((status) => ({
                        value: status,
                        label: status.charAt(0).toUpperCase() + status.slice(1),
                        description: order.status === status ? "Current status" : `Set status to ${status}`,
                      }))}
                      onChange={(value) => handleStatusSelection(order, value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-[#ff9900]/10 p-2 text-[#ff9900]">
                <ChefHat className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm status change</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Change <span className="font-semibold">{pendingChange.orderNumber}</span> from{' '}
                  <span className="font-semibold">{pendingChange.currentStatus}</span> to{' '}
                  <span className="font-semibold">{pendingChange.newStatus}</span>?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={cancelPendingChange}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmStatusChange()}
                disabled={updatingOrderId === pendingChange.orderId}
                className="flex items-center gap-2 rounded-xl bg-[#ff9900] px-4 py-2 text-sm font-semibold text-white transition cursor-pointer hover:bg-[#ff8800] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingOrderId === pendingChange.orderId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Confirm change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
