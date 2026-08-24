import { useEffect, useState, useCallback, useRef } from "react";
import { X, Plus, Minus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../../src/contexts/CartContext";
import { createOrder } from "../../api/manageOrder";
import { useConfirmation } from "../../src/contexts/useConfirmation";
import { useNavigate } from "react-router-dom";

export default function CartPopup() {
  const { items, isOpen, close: contextClose, updateQty, removeItem, subtotal, gst, serviceCharge, total, clearCart } = useCart();

  const { setType } = useConfirmation();

  const navigate = useNavigate();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -------- Animation states --------
  const [mounted, setMounted] = useState(false);   // should the component be rendered?
  const [active, setActive] = useState(false);     // is the panel visible (slide in/out)?
  const closingRef = useRef(false);                // prevent double-close triggers
  const closeRef = useRef(contextClose);           // always keep latest context close fn
  closeRef.current = contextClose;

  // Trigger slide-in when cart opens
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      closingRef.current = false;
      // Small delay to ensure the off-screen initial state renders first
      const timer = setTimeout(() => setActive(true), 10);
      return () => clearTimeout(timer);
    } else {
      // When context says closed (after our delayed close), unmount entirely
      setMounted(false);
      setActive(false);
    }
  }, [isOpen]);

  // Custom close handler that plays the exit animation, then calls the real close
  const handleClose = useCallback(() => {
    if (closingRef.current) return;           // ignore if already closing
    closingRef.current = true;
    setCheckoutOpen(false);
    setError(null);
    setActive(false);                         // start slide-out

    setTimeout(() => {
      closeRef.current();                     // now actually close (sets isOpen = false)
      closingRef.current = false;
    }, 300);                                   // match transition duration (duration-300)
  }, []);

  const handleNavigate = () => {
    handleClose();
    navigate("/our-menu");
  }

  // Don't render anything if not mounted
  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with blur – closes on click */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Side panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${active ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#ff9900]" />
            Your Cart
            {items.length > 0 && (
              <span className="text-sm font-normal text-gray-400">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <ShoppingCart className="w-16 h-16 text-gray-200" />
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some delicious items to get started</p>
              <button
                onClick={handleNavigate}
                className="mt-4 px-6 py-2 text-sm font-medium text-[#ff9900] border border-[#ff9900] rounded-full hover:bg-orange-50 transition-colors cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="flex gap-4 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={it.image || "/src/assets/foods-images/food-cover.jpg"}
                    alt={it.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{it.name}</div>
                    <div className="text-sm text-[#ff9900] font-medium mt-0.5">₹{it.price}</div>
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQty(it.id, it.qty - 1)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                        <button
                          onClick={() => updateQty(it.id, it.qty + 1)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeItem(it.id)}
                        className="flex items-center gap-1 text-sm text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with total and checkout – only when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 bg-white">
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">Subtotal</span>
                <span className="text-sm font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">GST (5%)</span>
                <span className="text-sm font-semibold text-gray-800">₹{gst.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base text-gray-500">Service charge (10%)</span>
                <span className="text-sm font-semibold text-gray-800">₹{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-base font-semibold text-gray-700">Total</span>
                <span className="text-2xl font-bold text-gray-800">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {!checkoutOpen ? (
              <button
                onClick={() => {
                  setError(null);
                  setCheckoutOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#ff9900] text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:from-[#ff8800] hover:to-[#ff6600] transition-all duration-200 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Table number</label>
                  <input
                    type="number"
                    min={1}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                {error && <div className="text-sm text-rose-600">{error}</div>}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setError(null);
                      if (!Number.isInteger(Number(tableNumber)) || Number(tableNumber) <= 0) {
                        setError("Table number must be a positive integer");
                        return;
                      }

                      // require auth
                      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
                      if (!token) {
                        setError("Please login to complete checkout");
                        return;
                      }

                      const payloadItems = items.map((it) => ({ item: it.id, quantity: it.qty }));
                      setLoading(true);
                      try {
                        await createOrder(payloadItems, Number(tableNumber));
                        clearCart();
                        handleClose();
                        setType("order");
                      } catch (err: any) {
                        console.error(err);
                        if (err?.response?.status === 401 || err?.response?.status === 403) {
                          setError("Please login to complete checkout");
                        } else {
                          setError(err?.response?.data?.message || "Failed to create order");
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="flex-1 bg-[#ff9900] text-white py-2 rounded-lg font-semibold cursor-pointer hover:bg-[#ff8800] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? "Placing..." : "Place Order"}
                  </button>
                  <button
                    onClick={() => setCheckoutOpen(false)}
                    disabled={loading}
                    className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-semibold cursor-pointer hover:bg-gray-100 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
                {/* If not authenticated, offer quick login button */}
                {error === "Please login to complete checkout" && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        handleClose();
                        navigate("/login");
                      }}
                      className="w-full text-sm text-white bg-blue-600 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Login to continue
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}