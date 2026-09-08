import React from "react";
import { Search, X, MessageSquare, User, Calendar } from "lucide-react";
import { getAllContacts } from "../api/adminDashboard";
import Loader from "../components/global/loader";

type Contact = {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt?: string;
};

const Messages: React.FC = () => {
  const [messages, setMessages] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getAllContacts();
        const contacts = Array.isArray(response) ? response : response?.data ?? [];
        setMessages(
          [...contacts].sort(
            (a, b) =>
              new Date(b.createdAt ?? 0).getTime() -
              new Date(a.createdAt ?? 0).getTime()
          )
        );
      } catch {
        setError("Unable to load messages. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Filter messages based on search query
  const filteredMessages = messages.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.subject &&
        contact.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const clearSearch = () => setSearchQuery("");

  if (loading) {
    return <Loader fullPage message="Loading messages..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden px-6 md:px-12 lg:px-20 py-10">
      {/* Decorative blur circles */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
              Messages
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            All <span className="text-[#ff9900]">Messages</span>
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            {messages.length} message{messages.length !== 1 ? "s" : ""} received
          </p>
        </div>

        {/* Filters */}
        {!loading && !error && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Filter Messages
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search pill */}
              <div className="relative flex items-center">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, email, subject…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-10 py-2 text-sm font-medium rounded-full border transition-all duration-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#ff9900]/50 focus:border-[#ff9900] ${
                    searchQuery
                      ? "border-[#ff9900] ring-2 ring-[#ff9900]/30"
                      : "border-gray-300 hover:border-[#ff9900]"
                  }`}
                  style={{ minWidth: "240px" }}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Optional: Add a clear filter button if needed */}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-gray-500 hover:text-[#ff9900] underline cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-8">
            <svg
              className="w-10 h-10 text-red-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 font-semibold">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Messages list */}
        {!loading && !error && (
          <div className="space-y-6">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  {searchQuery
                    ? "No matching messages found."
                    : "No messages yet."}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchQuery
                    ? "Try adjusting your search terms."
                    : "Messages from your contact form will appear here."}
                </p>
              </div>
            ) : (
              filteredMessages.map((contact) => {
                const id = contact.id ?? contact._id ?? "";
                const isExpanded = expandedId === id;
                const messageLength = contact.message.length;
                const shouldTruncate = messageLength > 200;
                const displayMessage =
                  shouldTruncate && !isExpanded
                    ? contact.message.slice(0, 200) + "..."
                    : contact.message;

                return (
                  <div
                    key={id}
                    className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                          <User size={18} />
                        </div>
                        <div>
                          <h2 className="font-bold text-gray-900 text-lg">
                            {contact.name}
                          </h2>
                          <p className="text-sm text-gray-500">{contact.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {contact.createdAt && (
                          <time
                            className="flex items-center gap-1 text-xs text-gray-400"
                            dateTime={contact.createdAt}
                          >
                            <Calendar size={14} />
                            {new Date(contact.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </time>
                        )}
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50">
                      {contact.subject && (
                        <p className="text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-3">
                          {contact.subject}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                        {displayMessage}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpand(id)}
                          className="mt-3 text-sm font-semibold text-[#ff9900] hover:underline focus:outline-none transition"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;