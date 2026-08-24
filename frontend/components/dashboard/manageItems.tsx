import { useEffect, useState, useRef, type ChangeEvent, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import {
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
} from "../../api/manageItems";
import {
  getReviewsByItemId,
  deleteReview,
} from "../../api/review";
import {
  Plus,
  X,
  Search,
  UploadCloud,
  Star,
  IndianRupee,
  Leaf,
  Drumstick,
  Pencil,
  Trash2,
  ChevronDown,
  CircleCheck,
  CircleOff,
  Eye,
  CupSoda,
  IceCream,
} from "lucide-react";
import Loader from "../global/loader";

/* -------------------- Types -------------------- */
type ItemImage = {
  secure_url: string;
  public_id: string;
};

type Review = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

type Item = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "starter" | "main-course" | "dessert" | "drink";
  type?: "veg" | "non-veg";
  images: ItemImage[];
  tags: string[];
  isAvailable: boolean;
  averageRating: number;
  reviewCount: number;
};

const CATEGORIES = ["starter", "main-course", "dessert", "drink"] as const;
type Category = (typeof CATEGORIES)[number];

interface FormState {
  name: string;
  description: string;
  price: string;
  category: Category;
  type: "veg" | "non-veg" | "";
  tags: string;
  isAvailable: boolean;
  image: File | null;
}

const initialForm: FormState = {
  name: "",
  description: "",
  price: "",
  category: "main-course",
  type: "non-veg",
  tags: "",
  isAvailable: true,
  image: null,
};

/* ------------------ Custom Select ------------------ */
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: CustomSelectProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition bg-white text-left flex items-center justify-between"
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder || "Select..."}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 max-h-48 overflow-y-auto animate-in fade-in-0 zoom-in-95">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${opt.value === value
                  ? "bg-orange-50 text-orange-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------ Custom Toggle ------------------ */
interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

const Toggle = ({ enabled, onChange, label }: ToggleProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${enabled ? "bg-[#ff9900]" : "bg-gray-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
    </div>
  );
};

/* -------------- Option Lists -------------- */
const categoryOptions: SelectOption[] = CATEGORIES.map((cat) => ({
  value: cat,
  label: cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " "),
}));

const typeOptions: SelectOption[] = [
  { value: "non-veg", label: "Non-Veg" },
  { value: "veg", label: "Veg" },
];

/* -------------- Component ------------------ */
function ManageItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);

  // Ref to store the currently selected item's ID (used even after detail modal is closed)
  const selectedItemIdRef = useRef<string | null>(null);

  // ----- Initial fetch & periodic updates -----
  useEffect(() => {
    const loadItems = async () => {
      try {
        const response = await getAllItems();
        setItems(response.data);
      } catch (err) {
        console.error("Failed to fetch items", err);
      }
    };
    void loadItems();

    // Poll every 30 seconds to catch external changes (e.g., new reviews)
    const interval = setInterval(loadItems, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refetch on window focus (when admin switches back to tab)
  useEffect(() => {
    const onFocus = async () => {
      try {
        const response = await getAllItems();
        setItems(response.data);
      } catch (err) {
        console.error("Failed to refetch items on focus", err);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Lock body scroll when any modal/panel is open
  useEffect(() => {
    const hasModalOpen = showAddPanel || deleteTarget || reviewToDelete || selectedItem;
    if (hasModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddPanel, deleteTarget, reviewToDelete, selectedItem]);

  const closePanel = () => {
    setShowAddPanel(false);
    setEditingItem(null);
    setPreview(null);
    setError(null);
  };

  /* ---- Filtering & Grouping ---- */
  const filteredItems = items.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !item.name.toLowerCase().includes(q) &&
        !item.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filterCategory !== "all" && item.category !== filterCategory) return false;
    if (dietFilter !== "all" && item.type !== dietFilter) return false;
    return true;
  });

  const groupedItems = CATEGORIES.reduce(
    (acc, cat) => {
      const catItems = filteredItems.filter((i) => i.category === cat);
      if (catItems.length > 0) {
        acc[cat] = {
          veg: catItems.filter((i) => i.type === "veg"),
          nonVeg: catItems.filter((i) => i.type === "non-veg"),
          other: catItems.filter((i) => i.type !== "veg" && i.type !== "non-veg"),
        };
      }
      return acc;
    },
    {} as Record<Category, { veg: Item[]; nonVeg: Item[]; other: Item[] }>
  );

  /* ---- Form Handlers ---- */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (value: string) => {
    const category = value as Category;
    setForm((prev) => ({
      ...prev,
      category,
      type: ["starter", "main-course"].includes(category) ? prev.type || "non-veg" : "",
    }));
  };

  const openAddPanel = () => {
    setEditingItem(null);
    setForm(initialForm);
    setPreview(null);
    setShowAddPanel(true);
  };

  const openEditPanel = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category as Category,
      type: item.type ?? "",
      tags: item.tags.join(", "),
      isAvailable: item.isAvailable,
      image: null,
    });
    setPreview(item.images.length > 0 ? item.images[0].secure_url : null);
    setShowAddPanel(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("category", form.category);
    if (["starter", "main-course"].includes(form.category) && form.type) {
      formData.append("type", form.type);
    }
    formData.append("isAvailable", String(form.isAvailable));

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    tagsArray.forEach((tag) => formData.append("tags", tag));

    if (form.image) {
      formData.append("images", form.image);
    }

    try {
      if (editingItem) {
        const response = await updateItem(editingItem._id, formData);
        setItems((prev) =>
          prev.map((item) => (item._id === editingItem._id ? response.data : item))
        );
      } else {
        const response = await addItem(formData);
        setItems((prev) => [...prev, response.data]);
      }
      closePanel();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteItem(deleteTarget._id);
      setItems((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete item");
    }
  };

  /* ---- Open Detail Modal (now updates card immediately) ---- */
  const openDetailModal = async (item: Item) => {
    setSelectedItem(item);
    selectedItemIdRef.current = item._id;
    setSelectedImageIndex(0);
    setReviewsLoading(true);
    try {
      const response = await getReviewsByItemId(item._id);
      const reviewsData = response.data || [];
      setReviews(reviewsData);
      // Immediately update the item's reviewCount in the global list
      setItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, reviewCount: reviewsData.length } : i
        )
      );
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedItem(null);
    selectedItemIdRef.current = null;
  };

  /* ---- Delete Review ---- */
  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await deleteReview(reviewToDelete._id);
      // Remove from local reviews array
      setReviews((prev) => prev.filter((r) => r._id !== reviewToDelete._id));

      // Update the item list using the stored item ID
      const itemId = selectedItemIdRef.current;
      if (itemId) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId
              ? { ...item, reviewCount: Math.max(0, item.reviewCount - 1) }
              : item
          )
        );
      }

      setReviewToDelete(null);
      selectedItemIdRef.current = null;
    } catch (err) {
      console.error("Failed to delete review", err);
      alert("Failed to delete review");
    }
  };

  const handleDeleteReviewClick = (review: Review) => {
    // Close the detail modal, then open the confirmation
    setSelectedItem(null);
    setReviewToDelete(review);
  };

  /* ---- Card Component ---- */
  const ItemCard = ({ item }: { item: Item }) => {
    const handleCardClick = (e: ReactMouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      openDetailModal(item);
    };

    return (
      <div
        className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative"
      >
        <div className="relative aspect-video bg-gray-100 overflow-hidden">
          {item.images.length > 0 ? (
            <img
              src={item.images[0].secure_url}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          {(item.type || item.category === "drink" || item.category === "dessert") && (
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${item.type === "non-veg"
                    ? "bg-red-100 text-red-700"
                    : item.type === "veg"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
              >
                {item.type === "non-veg" ? (
                  <>
                    <Drumstick size={12} /> Non-Veg
                  </>
                ) : item.type === "veg" ? (
                  <>
                    <Leaf size={12} /> Veg
                  </>
                ) : item.category === "drink" ? (
                  <>
                    <CupSoda size={12} /> Drink
                  </>
                ) : (
                  <>
                    <IceCream size={12} /> Dessert
                  </>
                )}
              </span>
            </div>
          )}
          <div className="absolute top-3 right-3">
            {item.isAvailable ? (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-emerald-200 text-emerald-700">
                <CircleCheck size={14} className="text-emerald-500" />
                <span className="text-xs font-semibold">Available</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm border border-rose-200 text-rose-700">
                <CircleOff size={14} className="text-rose-500" />
                <span className="text-xs font-semibold">Sold Out</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow cursor-pointer" title="Quick View" onClick={handleCardClick}>
              <Eye size={16} className="text-gray-600" />
            </div>
          </div>
          <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditPanel(item);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white transition cursor-pointer"
              title="Edit"
            >
              <Pencil size={14} className="text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(item);
              }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-red-50 transition cursor-pointer"
              title="Delete"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1 cursor-pointer" onClick={handleCardClick}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-bold text-gray-800 leading-snug line-clamp-1">{item.name}</h3>
            <div className="flex items-center text-amber-500 shrink-0">
              <Star size={14} fill="currentColor" />
              <span className="ml-1 text-sm font-medium text-gray-600">
                {item.averageRating > 0 ? item.averageRating.toFixed(1) : "New"}
              </span>
            </div>
          </div>
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">{item.description}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-[#ff9900] flex items-center">
              <IndianRupee size={16} className="mr-0.5" />{item.price}
            </span>
            <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-1 rounded">
              {item.category}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /* ---- Main Render ---- */
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Menu Items</h1>
          <p className="text-gray-500 mt-1">Browse, manage & update your menu</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search items or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition text-sm"
            />
          </div>
          <button
            onClick={openAddPanel}
            className="inline-flex items-center gap-2 bg-[#ff9900] hover:bg-[#ff8800] text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${filterCategory === "all"
              ? "bg-[#ff9900] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50"
            }`}
        >
          All Items
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition cursor-pointer ${filterCategory === cat
                ? "bg-[#ff9900] text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50"
              }`}
          >
            {cat.replace("-", " ")}
          </button>
        ))}

        <span className="w-px h-6 bg-gray-300 mx-1 hidden sm:block"></span>

        <button
          onClick={() => setDietFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${dietFilter === "all"
              ? "bg-gray-800 text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
            }`}
        >
          All
        </button>
        <button
          onClick={() => setDietFilter("veg")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1 ${dietFilter === "veg"
              ? "bg-green-600 text-white shadow-md"
              : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
            }`}
        >
          <Leaf size={14} /> Veg
        </button>
        <button
          onClick={() => setDietFilter("non-veg")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer flex items-center gap-1 ${dietFilter === "non-veg"
              ? "bg-red-600 text-white shadow-md"
              : "bg-white text-red-700 border border-red-200 hover:bg-red-50"
            }`}
        >
          <Drumstick size={14} /> Non-Veg
        </button>
      </div>

      {/* Item sections */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {searchQuery || filterCategory !== "all" || dietFilter !== "all" ? (
            <p>No items match your current filters. Try adjusting them.</p>
          ) : (
            <p>No items yet. Click "Add Item" to get started.</p>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {CATEGORIES.map((cat) => {
            const group = groupedItems[cat];
            if (!group) return null;
            return (
              <div key={cat}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 capitalize flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#ff9900] rounded-full"></span>
                  {cat.replace("-", " ")}
                </h2>
                {group.other.length > 0 && (
                  <div className={cat === "starter" || cat === "main-course" ? "mb-8" : ""}>
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                      {cat === "drink" ? (
                        <><CupSoda size={18} /> Drinks</>
                      ) : cat === "dessert" ? (
                        <><IceCream size={18} /> Desserts</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-gray-400"></span> Uncategorized</>
                      )}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.other.map((item) => (
                        <ItemCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                {group.veg.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2 mb-4">
                      <Leaf size={18} /> Veg
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.veg.map((item) => (
                        <ItemCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                {group.nonVeg.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-700 flex items-center gap-2 mb-4">
                      <Drumstick size={18} /> Non-Veg
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {group.nonVeg.map((item) => (
                        <ItemCard key={item._id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Slide-over Panel */}
      {showAddPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closePanel}
          />
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">
                {editingItem ? "Edit Item" : "Add New Item"}
              </h2>
              <button
                onClick={closePanel}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 p-6 space-y-5 overflow-hidden flex flex-col"
            >
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-3 text-center cursor-pointer hover:border-[#ff9900] transition-colors h-28 flex items-center justify-center"
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <UploadCloud size={24} />
                      <p className="text-xs mt-1">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                {editingItem && !form.image && preview && (
                  <p className="text-xs text-gray-400 mt-1">
                    Current image will be kept unless a new one is uploaded.
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  rows={2}
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition resize-none"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <CustomSelect
                    options={categoryOptions}
                    value={form.category}
                    onChange={handleCategoryChange}
                  />
                </div>
              </div>

              {/* Type & Availability */}
              <div className={`grid gap-4 ${["starter", "main-course"].includes(form.category) ? "grid-cols-2" : "grid-cols-1"}`}>
                {['starter', 'main-course'].includes(form.category) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <CustomSelect
                      options={typeOptions}
                      value={form.type}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, type: value as "veg" | "non-veg" | "" }))
                      }
                    />
                  </div>
                )}
                <div className="flex items-end pb-2">
                  <Toggle
                    enabled={form.isAvailable}
                    onChange={(value) =>
                      setForm((prev) => ({ ...prev, isAvailable: value }))
                    }
                    label="Available"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated) *</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="e.g. spicy, street-food"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</div>
              )}

              <div className="flex justify-end gap-3 pt-2 mt-auto">
                <button
                  type="button"
                  onClick={closePanel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#ff9900] hover:bg-[#ff8800] text-white font-medium rounded-lg shadow-lg shadow-orange-200 transition disabled:opacity-70 cursor-pointer"
                >
                  {loading ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Item Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Item</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{deleteTarget.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Review</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this review by{" "}
              <span className="font-semibold text-gray-800">{reviewToDelete.user.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReviewToDelete(null);
                  selectedItemIdRef.current = null;
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg shadow-red-200 transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 fade-in-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Eye size={22} className="text-[#ff9900]" />
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">{selectedItem.name}</h2>
                  <div className="text-xs text-gray-500 mt-0.5">{selectedItem.category.replace("-", " ")}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-[#ff8800] px-3 py-1 rounded-full text-sm font-semibold">
                  <Star size={14} /> {selectedItem.averageRating > 0 ? selectedItem.averageRating.toFixed(1) : "New"}
                  {selectedItem.reviewCount > 0 && <span className="text-xs text-gray-500 ml-1">({selectedItem.reviewCount})</span>}
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:grid md:grid-cols-12 gap-6">
              {/* Left: Images */}
              <div className="md:col-span-5">
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  {selectedItem.images.length > 0 ? (
                    <img
                      src={selectedItem.images[selectedImageIndex]?.secure_url}
                      alt={selectedItem.name}
                      className="w-full h-80 object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                </div>

                {selectedItem.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {selectedItem.images.map((img, idx) => (
                      <button
                        key={img.public_id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === idx ? 'border-orange-500' : 'border-transparent hover:border-gray-200'}`}
                      >
                        <img src={img.secure_url} alt={`${selectedItem.name}-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="md:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(selectedItem.type || selectedItem.category === 'drink' || selectedItem.category === 'dessert') ? (
                      <span className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${selectedItem.type === 'non-veg' ? 'bg-red-100 text-red-700' : selectedItem.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedItem.type === 'non-veg' ? (
                          <>
                            <Drumstick size={14} /> Non-Veg
                          </>
                        ) : selectedItem.type === 'veg' ? (
                          <>
                            <Leaf size={14} /> Veg
                          </>
                        ) : selectedItem.category === 'drink' ? (
                          <>
                            <CupSoda size={14} /> Drink
                          </>
                        ) : (
                          <>
                            <IceCream size={14} /> Dessert
                          </>
                        )}
                      </span>
                    ) : null}
                    <span className="text-sm text-gray-500">{selectedItem.category.replace('-', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-3xl font-extrabold text-[#ff9900] flex items-center">
                      <IndianRupee size={22} className="mr-1" /> {selectedItem.price}
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none text-gray-700 mb-4">
                  <p>{selectedItem.description || 'No description provided.'}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.tags.length > 0 ? (
                    selectedItem.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">#{tag}</span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No tags</span>
                  )}
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-2">
                    {selectedItem.isAvailable ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        <CircleCheck size={16} /> <span className="font-medium">Available</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700">
                        <CircleOff size={16} /> <span className="font-medium">Sold Out</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openEditPanel(selectedItem);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#ff9900] hover:bg-[#ff8800] text-white font-semibold rounded-lg shadow-md transition cursor-pointer"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      setDeleteTarget(selectedItem);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>

                {/* Scrollable Reviews Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Star size={16} className="text-[#ff9900]" /> Reviews ({selectedItem.reviewCount})
                  </h3>
                  {reviewsLoading ? (
                    <div className="py-4">
                      <Loader message="Loading reviews..." />
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-3 pr-2">
                      {reviews.map((review) => (
                        <div key={review._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-800 text-sm">{review.comment}</div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}
                                  />
                                ))}
                              </div>
                              <button
                                onClick={() => handleDeleteReviewClick(review)}
                                className="p-1 hover:bg-red-100 rounded transition cursor-pointer"
                                title="Delete review"
                              >
                                <Trash2 size={14} className="text-red-500" />
                              </button>
                            </div>
                          </div>
                          {review.user.name && (
                            <p className="text-xs text-gray-600 leading-relaxed">{review.user.name}</p>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <p className="text-sm">No reviews yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageItems;