import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import * as cartAPI from "../../api/cart";

type AuthUser = {
  _id?: string;
  id?: string;
  email?: string;
} | null;

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "rlp_cart";
const GST_RATE = 0.05;
const SERVICE_CHARGE_RATE = 0.10;

const normalizeStorageId = (id: string) =>
  id
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_");

const getCartStorageKey = (user: AuthUser) => {
  if (!user) return STORAGE_KEY;
  const id = user._id ?? user.id ?? user.email ?? null;
  if (!id) return STORAGE_KEY;
  return `${STORAGE_KEY}_${normalizeStorageId(id)}`;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const storageKey = getCartStorageKey(user);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from backend when user authenticates
  useEffect(() => {
    const loadCartFromBackend = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await cartAPI.getCart();
          const backendItems = response.data?.items || [];
          setItems(backendItems);
          // Update local storage
          try {
            localStorage.setItem(storageKey, JSON.stringify(backendItems));
          } catch {
            // ignore
          }
        } catch (error) {
          console.error("Failed to load cart from backend", error);
          // Fall back to local storage
          try {
            const raw = localStorage.getItem(storageKey);
            const stored = raw ? (JSON.parse(raw) as CartItem[]) : [];
            setItems(stored);
          } catch {
            setItems([]);
          }
        }
      }
    };

    loadCartFromBackend();
  }, [isAuthenticated, user, storageKey]);

  // Sync cart to backend when items change (only for authenticated users)
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const syncCartToBackend = async () => {
      try {
        await cartAPI.updateCart(items);
      } catch (error) {
        console.error("Failed to sync cart to backend", error);
        // Still update local storage as fallback
        try {
          localStorage.setItem(storageKey, JSON.stringify(items));
        } catch {
          // ignore
        }
      }
    };

    // Debounce sync to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      syncCartToBackend();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [items, isAuthenticated, user, storageKey]);

  // Clear cart on logout
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    // Load from local storage when user logs in
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
      setItems(parsed);
    } catch {
      setItems([]);
    }
  }, [user, storageKey]);

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { ...item, qty }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  };

  const clearCart = async () => {
    setItems([]);
    if (isAuthenticated) {
      try {
        await cartAPI.clearCart();
      } catch (error) {
        console.error("Failed to clear cart on backend", error);
      }
    }
  };

  const itemCount = items.length;
  const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
  const gst = +(subtotal * GST_RATE).toFixed(2);
  const serviceCharge = +(subtotal * SERVICE_CHARGE_RATE).toFixed(2);
  const total = +(subtotal + gst + serviceCharge).toFixed(2);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, itemCount, subtotal, gst, serviceCharge, total, isOpen, open, close, toggle }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-exports-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export default CartProvider;