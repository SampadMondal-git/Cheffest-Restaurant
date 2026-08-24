import { useEffect, useState } from "react";
import { cancelOrder, getOrderByUserId } from "../../api/manageOrder";
import Loader from "../global/loader";

interface OrderItem {
    _id: string;
    nameAtOrder: string;
    quantity: number;
    priceAtOrder: number;
    item?: any;
}

interface PaymentInfo {
    method: string;
    status: string;
    _id: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    status: "pending" | "accepted" | "preparing" | "ready" | "served" | "cancelled";
    tableNumber: number;
    cGst: number;
    sGst: number;
    serviceCharge: number;
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    payment: PaymentInfo[];
    transactionId: string;
    user: string;
    __v: number;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getOrderByUserId();
                let ordersArray: Order[] = [];
                if (Array.isArray(response)) {
                    ordersArray = response;
                } else if (response && Array.isArray(response.data)) {
                    ordersArray = response.data;
                } else if (response && Array.isArray(response.orders)) {
                    ordersArray = response.orders;
                } else if (response && typeof response === "object" && response._id) {
                    ordersArray = [response];
                }
                setOrders(ordersArray);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

    const closeCancelModal = () => {
        setCancelTarget(null);
        setCancelError(null);
    };

    const confirmCancelOrder = async () => {
        if (!cancelTarget) return;

        setCancellingOrderId(cancelTarget._id);
        setCancelError(null);

        try {
            await cancelOrder(cancelTarget._id);
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order._id === cancelTarget._id ? { ...order, status: "cancelled" } : order
                )
            );
            setCancelSuccess("Order cancelled successfully.");
            closeCancelModal();
        } catch (error: any) {
            console.error(error);
            setCancelError(
                error?.response?.data?.message ||
                    "Unable to cancel the order right now. Please try again."
            );
        } finally {
            setCancellingOrderId(null);
        }
    };

    const getStatusColor = (status: Order["status"]) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
            accepted: "bg-blue-100 text-blue-800 border-blue-300",
            preparing: "bg-purple-100 text-purple-800 border-purple-300",
            ready: "bg-green-100 text-green-800 border-green-300",
            served: "bg-gray-100 text-gray-800 border-gray-300",
            cancelled: "bg-red-100 text-red-800 border-red-300",
        };
        return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
    };

    if (loading) {
        return <Loader fullPage message="Loading your orders..." />;
    }

    return (
        <div className="min-h-[65vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden px-6 md:px-12 lg:px-20 py-12">
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto relative z-10">
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            My Orders
                        </h1>
                    </div>
                    {cancelSuccess && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                            {cancelSuccess}
                        </div>
                    )}
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
                        <p className="text-gray-600 text-lg">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {orders.map((order) => {
                            const paymentMethod = order.payment?.[0]?.method || "N/A";
                            const paymentStatus = order.payment?.[0]?.status || "pending";

                            // Calculate subtotal from items
                            const subtotal = order.items.reduce(
                                (sum, item) => sum + item.priceAtOrder * item.quantity,
                                0
                            );

                            return (
                                <div
                                    key={order._id}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    {/* Header: Order Number + Status */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                Order #
                                            </span>
                                            <p className="text-lg font-bold text-gray-900">
                                                {order.orderNumber}
                                            </p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Order Meta (without total) */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                Table
                                            </span>
                                            <p className="font-medium text-gray-800">
                                                {order.tableNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                Payment
                                            </span>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {paymentMethod}
                                                {paymentStatus !== "completed" && (
                                                    <span className="ml-1 text-xs text-gray-500">
                                                        ({paymentStatus})
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                Placed On
                                            </span>
                                            <p className="font-medium text-gray-800 text-sm">
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items Summary with tax/charge breakdown */}
                                    <div className="border-t border-gray-200/60 pt-4">
                                        <span className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
                                            Items ({order.items.length})
                                        </span>
                                        <ul className="space-y-1">
                                            {order.items.slice(0, 3).map((item) => (
                                                <li
                                                    key={item._id}
                                                    className="flex justify-between text-sm text-gray-700"
                                                >
                                                    <span>
                                                        {item.quantity}× {item.nameAtOrder}
                                                    </span>
                                                    <span>
                                                        ₹{(item.priceAtOrder * item.quantity).toFixed(2)}
                                                    </span>
                                                </li>
                                            ))}
                                            {order.items.length > 3 && (
                                                <li className="text-sm text-gray-500 italic">
                                                    +{order.items.length - 3} more item(s)
                                                </li>
                                            )}
                                        </ul>

                                        {/* Charges & Total */}
                                        <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-1">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Subtotal</span>
                                                <span>₹{subtotal.toFixed(2)}</span>
                                            </div>
                                            {order.cGst > 0 && (
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>CGST (2.5%)</span>
                                                    <span>₹{order.cGst.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {order.sGst > 0 && (
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>SGST (2.5%)</span>
                                                    <span>₹{order.sGst.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {order.serviceCharge > 0 && (
                                                <div className="flex justify-between text-sm text-gray-600">
                                                    <span>Service Charge (10%)</span>
                                                    <span>₹{order.serviceCharge.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200/60">
                                                <span className="text-sm font-semibold text-gray-700">
                                                    Total
                                                </span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    ₹{order.totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction ID */}
                                    <div className="mt-4 text-xs text-gray-400 truncate">
                                        Txn: {order.transactionId}
                                    </div>

                                    {order.status === "pending" && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                type="button"
                                                disabled={cancellingOrderId === order._id}
                                                onClick={() => setCancelTarget(order)}
                                                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 border border-red-200 rounded-full hover:bg-red-200 transition disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                            >
                                                {cancellingOrderId === order._id ? "Cancelling..." : "Cancel Order"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {cancelTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCancelModal} />
                    <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900">Cancel Order</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Confirm cancellation for order <span className="font-semibold text-gray-800">{cancelTarget.orderNumber}</span>.
                            </p>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600">
                                Cancelling a pending order will stop it from being processed and mark it as cancelled.
                            </p>
                            {cancelError && (
                                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {cancelError}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 px-6 pb-6 pt-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeCancelModal}
                                className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto cursor-pointer"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancelOrder}
                                disabled={cancellingOrderId === cancelTarget._id}
                                className="w-full rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto cursor-pointer"
                            >
                                {cancellingOrderId === cancelTarget._id ? "Cancelling..." : "Confirm Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;