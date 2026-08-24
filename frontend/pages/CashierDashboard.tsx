import { useCallback, useEffect, useState } from "react";
import type { ReactElement } from "react";
import { getAllOrders, manageOrderPayment } from "../api/manageOrder";
import CustomSelect from "../components/global/CustomSelect";
import Loader from "../components/global/loader";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";

interface OrderItem {
  _id?: string;
  item?: string;
  nameAtOrder?: string;
  priceAtOrder?: number;
  quantity?: number;
}

interface Payment {
  _id?: string;
  status?: string;
  method?: string;
  amount?: number;
  transactionId?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  tableNumber: number;
  totalAmount: number;
  items: OrderItem[];
  payment: Payment[];
  createdAt: string;
}

interface PendingPaymentChange {
  orderId: string;
  orderNumber: string;
  newStatus: string;
  paymentMethod?: string;
}

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed"] as const;
const PAYMENT_METHOD_OPTIONS = ["cash", "card", "upi"] as const;
const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
};

const PAYMENT_STYLES: Record<string, { bg: string; text: string; icon: ReactElement }> = {
  pending: {
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <Clock className="h-4 w-4" />,
  },
  paid: {
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  failed: {
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <XCircle className="h-4 w-4" />,
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CashierDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingChange, setPendingChange] = useState<PendingPaymentChange | null>(null);
  const [updating, setUpdating] = useState(false);

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
    void (async () => {
      await fetchOrders();
    })();
  }, [fetchOrders]);

  const handlePaymentSelection = (
    orderId: string,
    orderNumber: string,
    newStatus: string,
    currentMethod: string = "cash"
  ) => {
    setPendingChange({ orderId, orderNumber, newStatus, paymentMethod: currentMethod });
  };

  const handlePaymentMethodChange = (paymentMethod: string) => {
    setPendingChange((prev) => (prev ? { ...prev, paymentMethod } : prev));
  };

  const handlePaymentConfirm = async () => {
    if (!pendingChange) return;

    setUpdating(true);
    setError(null);

    try {
      await manageOrderPayment(
        pendingChange.orderId,
        pendingChange.newStatus,
        pendingChange.paymentMethod
      );
      setOrders((prev) =>
        prev.map((order) =>
          order._id === pendingChange.orderId
            ? {
                ...order,
                payment: [
                  {
                    ...(order.payment?.[0] ?? {}),
                    status: pendingChange.newStatus,
                    method: pendingChange.paymentMethod ?? order.payment?.[0]?.method ?? "not selected",
                  },
                ],
              }
            : order
        )
      );
      setPendingChange(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toString().includes(searchTerm);
    return matchesSearch;
  });

  const paidCount = orders.filter((order) => (order.payment?.[0]?.status ?? "pending") === "paid").length;
  const pendingCount = orders.filter((order) => (order.payment?.[0]?.status ?? "pending") === "pending").length;
  const failedCount = orders.filter((order) => (order.payment?.[0]?.status ?? "pending") === "failed").length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(255,153,0,0.18),transparent_25%),linear-gradient(135deg,#fffaf3_0%,#ffe8c8_100%)] px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="overflow-hidden rounded-[28px] border border-orange-100 bg-white/90 p-6 shadow-[0_20px_60px_-20px_rgba(255,153,0,0.35)] backdrop-blur md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#fff3e0] px-3 py-1 text-sm font-semibold text-[#ff9900]">
                <Sparkles className="h-4 w-4" />
                Billing desk
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-800 md:text-3xl">
                  <CreditCard className="h-7 w-7 text-[#ff9900]" />
                  Cashier Dashboard
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-gray-600 md:text-base">
                  Track payments on every order and confirm changes before they go live.
                </p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 self-start rounded-xl bg-[#ff9900] px-4 py-2.5 font-semibold text-white transition cursor-pointer hover:bg-[#ff8800] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{paidCount}</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="mt-2 text-2xl font-bold text-[#ff9900]">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Failed</p>
            <p className="mt-2 text-2xl font-bold text-red-500">{failedCount}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur md:p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by order # or table"
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#ff9900]"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={fetchOrders} className="ml-auto font-semibold underline cursor-pointer">
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-orange-100 bg-white/90 p-6 shadow-sm backdrop-blur">
            <Loader message="Loading orders..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-orange-100 bg-white/90 py-12 text-center shadow-sm">
            <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-semibold text-gray-700">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">Try a different search term to locate an order.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => {
              const paymentStatus = order.payment?.[0]?.status ?? "pending";
              const paymentStyle = PAYMENT_STYLES[paymentStatus] || PAYMENT_STYLES.pending;
              const selectedStatus = pendingChange?.orderId === order._id ? pendingChange.newStatus : paymentStatus;

              return (
                <div key={order._id} className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                      <p className="mt-1 text-sm text-gray-500">Table {order.tableNumber}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${paymentStyle.bg} ${paymentStyle.text}`}>
                      {paymentStyle.icon}
                      {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
                    </span>
                  </div>

                  <div className="mb-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Items</span>
                      <span className="font-semibold text-gray-900">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <span className="font-semibold text-gray-900">{order.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payment method</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">
                      {order.payment?.[0]?.method ? PAYMENT_METHOD_LABELS[order.payment[0].method] ?? order.payment[0].method : "N/A"}
                    </span>
                  </div>

                  <div className="mt-4">
                    <CustomSelect
                      label="Update payment"
                      value={selectedStatus}
                      options={PAYMENT_STATUS_OPTIONS.map((status) => ({
                        value: status,
                        label: status.charAt(0).toUpperCase() + status.slice(1),
                        description: paymentStatus === status ? "Current payment state" : `Mark as ${status}`,
                      }))}
                      onChange={(value) =>
                        handlePaymentSelection(
                          order._id,
                          order.orderNumber,
                          value,
                          order.payment?.[0]?.method && order.payment[0].method !== "not selected"
                            ? order.payment[0].method
                            : "cash"
                        )
                      }
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
            <div className="mb-4 flex items-center gap-2 text-[#ff9900]">
              <Loader2 className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm payment change</h3>
            </div>
            <p className="text-sm text-gray-600">
              Mark <span className="font-semibold text-gray-900">{pendingChange.orderNumber}</span> as <span className="font-semibold text-[#ff9900]">{pendingChange.newStatus.charAt(0).toUpperCase() + pendingChange.newStatus.slice(1)}</span>?
            </p>

            {pendingChange.newStatus === "paid" && (
              <div className="mt-4">
                <CustomSelect
                  label="Payment method"
                  value={pendingChange.paymentMethod ?? "cash"}
                  options={PAYMENT_METHOD_OPTIONS.map((method) => ({
                    value: method,
                    label: PAYMENT_METHOD_LABELS[method],
                    description:
                      pendingChange.paymentMethod === method
                        ? "Selected method"
                        : `Use ${PAYMENT_METHOD_LABELS[method]}`,
                  }))}
                  onChange={handlePaymentMethodChange}
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setPendingChange(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition cursor-pointer hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={updating}
                className="rounded-xl bg-[#ff9900] px-4 py-2 text-sm font-semibold text-white transition cursor-pointer hover:bg-[#ff8800] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating ? "Updating..." : "Confirm change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
