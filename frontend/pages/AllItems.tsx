import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getAllItems } from "../api/manageItems";
import { getReviewsByItemId, postReview } from "../api/review";
import {
  Search,
  IndianRupee,
  Star,
  Leaf,
  Drumstick,
  CircleCheck,
  CircleOff,
  ShoppingCart,
  X,
  Eye,
  ChevronDown,
  CupSoda,
  IceCream,
  Send,
  MessageSquare,
} from "lucide-react";
import { useCart } from "../src/contexts/CartContext";
import Loader from "../components/global/loader";

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

/* ------------------ Filter Dropdown ------------------ */
interface SelectOption {
  value: string;
  label: string;
}

const _CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

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
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
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
              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${opt.value === value ? "bg-orange-50 text-orange-700 font-medium" : "text-gray-700 hover:bg-gray-100"
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

void _CustomSelect;

/* ------------------ Star Rating Input ------------------ */
const StarRatingInput = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((val) => (
      <button
        key={val}
        type="button"
        onClick={() => onChange(val)}
        className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
      >
        <Star
          size={18}
          fill={val <= rating ? "#ff9900" : "none"}
          stroke={val <= rating ? "#ff9900" : "#ff9900"}
        />
      </button>
    ))}
  </div>
);

/* -------------- Option Lists -------------- */
const categoryFilterOptions: SelectOption[] = [
  { value: "all", label: "All Items" },
  ...CATEGORIES.map((cat) => ({
    value: cat,
    label: cat
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  })),
];

/* ------------------ Reviews Section ------------------ */
const ReviewsSection = ({
  itemId,
  onReviewAdded,
}: {
  itemId: string;
  onReviewAdded: (newCount: number) => void;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const res = await getReviewsByItemId(itemId);
      setReviews(res.data || []);
    } catch {
      setError("Could not load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRating || !newComment.trim()) return;
    try {
      setSubmitting(true);
      await postReview(itemId, newRating, newComment.trim());
      await fetchReviews(); // refresh the list after posting
      onReviewAdded(reviews.length + 1); // new count = old length + 1
      setNewRating(0);
      setNewComment("");
    } catch {
      alert("Failed to post review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <MessageSquare size={16} />
        How was this item? Leave a review
      </h3>

      <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
        <StarRatingInput rating={newRating} onChange={setNewRating} />
        <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Your Comment</label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
          placeholder="Write your review..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition resize-none"
        />
        <button
          type="submit"
          disabled={submitting || !newRating || !newComment.trim()}
          className="mt-3 flex items-center gap-2 px-5 py-2 bg-[#ff9900] hover:bg-[#ff8800] cursor-pointer text-white font-medium rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
          {submitting ? "Posting..." : "Submit Review"}
        </button>
      </form>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Star size={16} className="text-[#ff9900]" /> Reviews ({reviews.length})
        </h3>
        {reviewsLoading ? (
          <div className="py-6">
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
                          className={i < review.rating ? "text-amber-500 fill-amber-500" : "text-[#ff9900]"}
                        />
                      ))}
                    </div>
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
  );
};

/* ------------------ Main User Menu Component ------------------ */
function OurMenu() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | Category>("all");
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();

  // ---- Fetch items initially and set up periodic refresh + window focus refresh ----
  useEffect(() => {
    let ignore = false;
    const loadItems = async () => {
      try {
        const res = await getAllItems();
        if (!ignore) {
          setItems(res.data);
          setLoading(false);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load menu.");
          setLoading(false);
        }
      }
    };
    // Initial load
    loadItems();

    // Poll every 30 seconds to catch external changes (e.g., admin delete review)
    const interval = setInterval(loadItems, 30000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  // Refetch when the window regains focus (e.g., user switches back to the tab)
  useEffect(() => {
    const onFocus = async () => {
      try {
        const res = await getAllItems();
        setItems(res.data);
      } catch {
        // silent fail
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Lock body scroll when the detail modal is open
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedItem]);

  // Filter & group (identical logic to admin panel)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !item.name.toLowerCase().includes(q) &&
          !item.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
      }
      if (filterCategory !== "all" && item.category !== filterCategory) return false;
      if (dietFilter !== "all" && item.type !== dietFilter) return false;
      return true;
    });
  }, [items, searchQuery, filterCategory, dietFilter]);

  const groupedItems = useMemo(() => {
    return CATEGORIES.reduce(
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
  }, [filteredItems]);

  const handleAddToCart = (item: Item) => {
    try {
      addItem({ id: item._id, name: item.name, price: item.price, image: item.images?.[0]?.secure_url });
    } catch (err) {
      console.error("Cart add failed", err);
    }
  };

  // Callback: after a review is submitted, update the item's reviewCount optimistically
  const handleReviewAdded = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, reviewCount: item.reviewCount + 1 } : item
      )
    );
    // Also update the selectedItem if the modal is still open
    setSelectedItem((prev) =>
      prev && prev._id === itemId ? { ...prev, reviewCount: prev.reviewCount + 1 } : prev
    );
  };

  const ItemCard = ({ item }: { item: Item }) => (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative"
    >
      <div
        className="relative aspect-video bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => {
          setSelectedItem(item);
          setSelectedImageIndex(0);
        }}
      >
        {item.images.length > 0 ? (
          <img
            src={item.images[0].secure_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
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
                <><Drumstick size={12} /> Non-Veg</>
              ) : item.type === "veg" ? (
                <><Leaf size={12} /> Veg</>
              ) : item.category === "drink" ? (
                <><CupSoda size={12} /> Drink</>
              ) : (
                <><IceCream size={12} /> Dessert</>
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
        <div
          className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedItem(item);
            setSelectedImageIndex(0);
          }}
        >
          <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow">
            <Eye size={16} className="text-gray-600" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(item);
            }}
            className="p-2 bg-[#ff9900] text-white rounded-full shadow hover:bg-[#ff8800] transition cursor-pointer"
            title="Add to Cart"
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
      <div
        className="p-4 flex flex-col flex-1 cursor-pointer"
        onClick={() => {
          setSelectedItem(item);
          setSelectedImageIndex(0);
        }}
      >
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
            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
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

  if (loading) {
    return <Loader fullPage message="Loading menu..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Our Menu</h1>
          <p className="text-gray-500 mt-1">Explore delicious dishes, freshly grouped for you</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search dishes or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff9900] focus:border-[#ff9900] outline-none transition text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {categoryFilterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilterCategory(opt.value as "all" | Category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer ${filterCategory === opt.value
              ? "bg-[#ff9900] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-orange-50"
              }`}
          >
            {opt.label}
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

      {/* Grouped Items */}
      {Object.keys(groupedItems).length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {searchQuery || filterCategory !== "all" || dietFilter !== "all"
            ? "No dishes match your filters."
            : "No items available at the moment."}
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
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
                      {cat === "drink" ? (
                        <><CupSoda size={18} /> Drinks</>
                      ) : cat === "dessert" ? (
                        <><IceCream size={18} /> Desserts</>
                      ) : (
                        <><span className="w-2 h-2 rounded-full bg-gray-400"></span> Other</>
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

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto hide-modal-scroll animate-in zoom-in-95 fade-in-0"
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
                  {selectedItem.reviewCount > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({selectedItem.reviewCount})</span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 md:grid md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  {selectedItem.images.length > 0 ? (
                    <img
                      src={selectedItem.images[selectedImageIndex]?.secure_url}
                      alt={selectedItem.name}
                      className="w-full h-80 object-cover"
                    />
                  ) : (
                    <div className="w-full h-80 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                {selectedItem.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {selectedItem.images.map((img, idx) => (
                      <button
                        key={img.public_id}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-16 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === idx ? "border-[#ff9900]" : "border-transparent hover:border-gray-200"
                          }`}
                      >
                        <img src={img.secure_url} alt={`${selectedItem.name}-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {(selectedItem.type || selectedItem.category === "drink" || selectedItem.category === "dessert") && (
                      <span
                        className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${selectedItem.type === "non-veg"
                          ? "bg-red-100 text-red-700"
                          : selectedItem.type === "veg"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {selectedItem.type === "non-veg" ? (
                          <><Drumstick size={14} /> Non-Veg</>
                        ) : selectedItem.type === "veg" ? (
                          <><Leaf size={14} /> Veg</>
                        ) : selectedItem.category === "drink" ? (
                          <><CupSoda size={14} /> Drink</>
                        ) : (
                          <><IceCream size={14} /> Dessert</>
                        )}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">{selectedItem.category.replace("-", " ")}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Price</div>
                    <div className="text-3xl font-extrabold text-[#ff9900] flex items-center">
                      <IndianRupee size={22} className="mr-1" /> {selectedItem.price}
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{selectedItem.description || "No description."}</p>

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

                <div className="mb-6">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-[#ff9900] hover:bg-[#ff8800] text-white font-semibold rounded-lg shadow-md transition cursor-pointer"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>

                <ReviewsSection
                  itemId={selectedItem._id}
                  onReviewAdded={() => handleReviewAdded(selectedItem._id)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OurMenu;