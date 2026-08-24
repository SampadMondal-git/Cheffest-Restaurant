import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllItems } from "../../api/manageItems"; // adjust path if needed
import { getReviewsByItemId, postReview } from "../../api/review"; // adjust path
import {
    Star,
    X,
    IndianRupee,
    Eye,
    ShoppingCart,
    Leaf,
    Drumstick,
    CircleCheck,
    CircleOff,
    Send,
    MessageSquare,
    CupSoda,
    IceCream,
} from "lucide-react";
import { useCart } from "../../src/contexts/CartContext";
import Loader from "../global/loader";

// ----- Types -----
type Item = {
    _id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    type?: string;
    images: { secure_url: string; public_id: string }[];
    tags: string[];
    averageRating?: number;
    reviewCount?: number;
    isAvailable?: boolean;
};

type Review = {
    _id: string;
    rating: number;
    comment: string;
    user?: { name: string };
    createdAt: string;
};

// ----- Fractional Star Rating (read‑only) -----
const StarRating = ({ rating, size = 18 }: { rating: number; size?: number }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starIndex) => {
            const fillFraction = Math.min(1, Math.max(0, rating - starIndex + 1));
            const fillWidth = fillFraction * size;
            return (
                <div key={starIndex} className="relative" style={{ width: size, height: size }}>
                    <Star size={size} fill="none" stroke="#ff9900" className="absolute inset-0" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: fillWidth }}>
                        <Star size={size} fill="#ff9900" stroke="none" className="absolute left-0 top-0" />
                    </div>
                </div>
            );
        })}
    </div>
);

// ----- Interactive Star Input (for review form) -----
const InteractiveStars = ({ value, onChange }: { value: number; onChange: (r: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
            <button key={s} type="button" onClick={() => onChange(s)} className="transition">
                <Star
                    size={18}
                    fill={s <= value ? "#ff9900" : "none"}
                    stroke={s <= value ? "#ff9900" : "#ff9900"}
                />
            </button>
        ))}
    </div>
);

// ----- Reviews Section (reusable) -----
const ReviewsSection = ({
    itemId,
    onReviewAdded,
}: {
    itemId: string;
    onReviewAdded: (newCount: number) => void;
}) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newRating, setNewRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            setReviewsLoading(true);
            const res = await getReviewsByItemId(itemId);
            const data = res?.data ?? res ?? [];
            setReviews(Array.isArray(data) ? data : []);
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
        if (!newRating) return;
        try {
            setSubmitting(true);
            await postReview(itemId, newRating, newComment.trim());
            await fetchReviews();
            onReviewAdded(reviews.length + 1);
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
                <MessageSquare size={16} /> How was this item? Leave a review
            </h3>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <InteractiveStars value={newRating} onChange={setNewRating} />
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
                    disabled={submitting || !newRating}
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
                                    <StarRating rating={review.rating} size={12} />
                                </div>
                                {review.user?.name && (
                                    <p className="text-xs text-gray-600">{review.user.name}</p>
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

// ----- Main Menu (Popular Dishes) Component -----
function Menu() {
    const navigate = useNavigate();

    const { addItem } = useCart();

    // State
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Detail modal state
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [relatedItems, setRelatedItems] = useState<Item[]>([]);

    // Fetch all items on mount
    useEffect(() => {
        async function fetchMenu() {
            try {
                const response = await getAllItems();
                const apiItems = response?.data ?? response ?? [];
                setItems(Array.isArray(apiItems) ? apiItems : []);
            } catch (err) {
                console.error("Failed to fetch menu items:", err);
                setError("Unable to load menu items.");
            } finally {
                setLoading(false);
            }
        }
        fetchMenu();
    }, []);

    // Lock scroll when modal open
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

    // Top 3 highest‑rated items
    const popularItems = [...items]
        .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
        .slice(0, 3);

    // Open detail modal
    const openDetailModal = (item: Item) => {
        setSelectedItem(item);
        setSelectedImageIndex(0);
        const related = items.filter(
            (i) => i._id !== item._id && i.tags.some((tag) => item.tags.includes(tag))
        );
        setRelatedItems(related.slice(0, 4));
    };

    const closeDetailModal = () => {
        setSelectedItem(null);
        setRelatedItems([]);
    };

    // Update review count locally after a new review
    const handleReviewAdded = (itemId: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item._id === itemId
                    ? { ...item, reviewCount: (item.reviewCount ?? 0) + 1 }
                    : item
            )
        );
        setSelectedItem((prev) =>
            prev && prev._id === itemId
                ? { ...prev, reviewCount: (prev.reviewCount ?? 0) + 1 }
                : prev
        );
    };

    // ----- Render a single dish card -----
    const renderDishCard = (item: Item) => {
        const imageUrl =
            item.images?.[0]?.secure_url ||
            "https://via.placeholder.com/400x300?text=No+Image"; // fallback

        return (
            <div
                key={item._id}
                className="bg-white w-full rounded-xl shadow-md overflow-hidden hover:shadow-xl transition"
            >
                <img
                    src={imageUrl}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-64 sm:h-72 md:h-74 object-cover cursor-pointer"
                    onClick={() => openDetailModal(item)}
                />
                <div className="px-4 py-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">{item.name}</h3>
                        <span className="text-[#ff9900] font-bold">&#8377; {item.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {item.description || "Delicious menu item with fresh ingredients."}
                    </p>
                    <div className="flex flex-wrap justify-between items-center mt-2 gap-2">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            {item.type && (
                                <span className="rounded-full border border-[#ff9900] px-2 py-1 text-xs uppercase">
                                    {item.type}
                                </span>
                            )}
                            <StarRating rating={item.averageRating ?? 0} size={14} />
                            <span className="font-semibold">{(item.averageRating ?? 0).toFixed(1)}</span>
                        </div>
                        <button
                            onClick={() => openDetailModal(item)}
                            className="bg-[#ff9900] text-white text-sm font-semibold px-4 py-2 rounded-md cursor-pointer hover:bg-[#ff8800]"
                        >
                            View details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ----- Main return -----
    if (loading) {
        return <Loader fullPage message="Loading popular dishes..." />;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center py-24">
                <p className="text-lg font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="menu-container flex justify-center items-center flex-col py-8 sm:py-12 gap-4 px-4 sm:px-8 md:px-12 text-center">
                {/* ---------- Premium Heading ---------- */}
                <div className="relative flex items-center justify-center w-full my-2">
                    {/* subtle gradient line */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-linear-to-r from-transparent via-[#ff9900]/40 to-transparent"></div>
                    <h1 className="relative bg-white px-6 py-1.5 text-sm sm:text-base uppercase font-bold tracking-[0.4rem] sm:tracking-[0.6rem] text-[#ff9900] border-2 border-[#ff9900] rounded-full shadow-md">
                        Our Menu
                    </h1>
                </div>

                {/* subheading */}
                <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-gray-800 mt-2">
                    Popular Dishes
                </h2>
                <p className="max-w-3xl text-sm sm:text-base md:text-lg text-gray-600">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus est cupiditate
                    consequatur, incidunt natus, laudantium, non odio facere pariatur quidem deserunt
                    quibusdam ipsum illo suscipit.
                </p>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-2 sm:px-4 md:px-8 lg:px-24 py-8 sm:py-12">
                    {popularItems.length > 0 ? (
                        popularItems.map(renderDishCard)
                    ) : (
                        <p className="text-gray-600 col-span-full">No dishes available yet.</p>
                    )}
                </div>

                <button
                    onClick={() => navigate("/our-menu")}
                    className="bg-[#ff9900] text-white px-6 py-4 font-bold rounded-lg cursor-pointer hover:bg-[#ff8800]"
                >
                    See All Dishes
                </button>
            </div>

            {/* ---------- Detail Modal ---------- */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] sm:max-h-[92vh] overflow-y-auto hide-modal-scroll animate-in zoom-in-95 fade-in-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white z-10 p-3 sm:p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Eye size={18} className="text-[#ff9900] sm:size-5 md:size-5.5" />
                                <div>
                                    <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900">
                                        {selectedItem.name}
                                    </h2>
                                    <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
                                        {selectedItem.category?.replace("-", " ")}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="inline-flex items-center gap-1 sm:gap-2 bg-amber-50 text-[#ff8800] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                                    <Star size={12} className="sm:size-3.5 md:size-3.5" fill="none" stroke="#ff9900" />
                                    <span className="font-semibold">
                                        {(selectedItem.averageRating ?? 0).toFixed(1)}
                                    </span>
                                    {selectedItem.reviewCount ? (
                                        <span className="text-[10px] sm:text-xs text-gray-500 ml-0.5 sm:ml-1">
                                            ({selectedItem.reviewCount})
                                        </span>
                                    ) : null}
                                </div>
                                <button
                                    onClick={closeDetailModal}
                                    className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    <X size={18} className="sm:size-5 md:size-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 md:grid md:grid-cols-12 gap-6">
                            {/* Left: Image Gallery */}
                            <div className="md:col-span-5">
                                <div className="rounded-xl overflow-hidden bg-gray-100">
                                    {selectedItem.images.length > 0 ? (
                                        <img
                                            src={selectedItem.images[selectedImageIndex]?.secure_url}
                                            alt={selectedItem.name}
                                            className="w-full h-64 sm:h-72 md:h-80 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-64 sm:h-72 md:h-80 flex items-center justify-center text-gray-400">
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
                                                className={`h-12 sm:h-14 md:h-16 rounded-lg overflow-hidden border-2 transition ${selectedImageIndex === idx
                                                        ? "border-[#ff9900]"
                                                        : "border-transparent hover:border-gray-200"
                                                    }`}
                                            >
                                                <img
                                                    src={img.secure_url}
                                                    alt={`${selectedItem.name}-${idx}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Details */}
                            <div className="md:col-span-7 flex flex-col mt-4 md:mt-0">
                                <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(selectedItem.type ||
                                            selectedItem.category === "drink" ||
                                            selectedItem.category === "dessert") && (
                                                <span
                                                    className={`inline-flex items-center justify-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-semibold rounded-full ${selectedItem.type === "non-veg"
                                                            ? "bg-red-100 text-red-700"
                                                            : selectedItem.type === "veg"
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-blue-100 text-blue-700"
                                                        }`}
                                                >
                                                    {selectedItem.type === "non-veg" ? (
                                                        <><Drumstick size={12} className="sm:size-3.5" /> Non-Veg</>
                                                    ) : selectedItem.type === "veg" ? (
                                                        <><Leaf size={12} className="sm:size-3.5" /> Veg</>
                                                    ) : selectedItem.category === "drink" ? (
                                                        <><CupSoda size={12} className="sm:size-3.5" /> Drink</>
                                                    ) : (
                                                        <><IceCream size={12} className="sm:size-3.5" /> Dessert</>
                                                    )}
                                                </span>
                                            )}
                                        <span className="text-xs sm:text-sm text-gray-500">
                                            {selectedItem.category?.replace("-", " ")}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs sm:text-sm text-gray-500">Price</div>
                                        <div className="text-2xl sm:text-3xl font-extrabold text-[#ff9900] flex items-center">
                                            <IndianRupee size={18} className="sm:size-5 md:size-5.5 mr-1" /> {selectedItem.price}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm sm:text-base text-gray-700 mb-4">
                                    {selectedItem.description || "No description provided."}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {selectedItem.tags.length > 0 ? (
                                        selectedItem.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                                            >
                                                #{tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs sm:text-sm text-gray-400">No tags</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 sm:gap-6 mb-6">
                                    {selectedItem.isAvailable ? (
                                        <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm">
                                            <CircleCheck size={14} className="sm:size-4" /> <span className="font-medium">Available</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs sm:text-sm">
                                            <CircleOff size={14} className="sm:size-4" /> <span className="font-medium">Sold Out</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <button
                                        onClick={() => {
                                            try { addItem({ id: selectedItem._id, name: selectedItem.name, price: selectedItem.price, image: selectedItem.images?.[0]?.secure_url }); } catch {}
                                            closeDetailModal();
                                        }}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-[#ff9900] hover:bg-[#ff8800] text-white font-semibold rounded-lg shadow-md transition cursor-pointer text-sm sm:text-base"
                                    >
                                        <ShoppingCart size={16} />
                                        Add to Cart
                                    </button>
                                </div>

                                {/* Reviews */}
                                <ReviewsSection
                                    itemId={selectedItem._id}
                                    onReviewAdded={() => handleReviewAdded(selectedItem._id)}
                                />

                                {/* Related Dishes */}
                                {relatedItems.length > 0 && (
                                    <div className="border-t border-gray-200 pt-5 mt-4">
                                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                                            You Might Also Like
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {relatedItems.map((rel) => (
                                                <div
                                                    key={rel._id}
                                                    className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                                                    onClick={() => openDetailModal(rel)}
                                                >
                                                    <div className="aspect-video bg-gray-100">
                                                        {rel.images.length > 0 ? (
                                                            <img
                                                                src={rel.images[0].secure_url}
                                                                alt={rel.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-1">
                                                            {rel.name}
                                                        </p>
                                                        <p className="text-[#ff9900] text-xs sm:text-sm font-bold flex items-center">
                                                            <IndianRupee size={12} className="mr-0.5" /> {rel.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Menu;