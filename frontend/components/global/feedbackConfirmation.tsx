import { Link } from "react-router-dom";

export default function FeedbackConfirmed() {
  return (
    <div className="my-12 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-[#fff6ea] rounded-2xl py-16 px-8 text-center flex flex-col items-center gap-8">

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#ff9900]">
          Thank you for your valuable feedback!
        </h1>

        {/* Check Icon */}
        <div className="w-24 h-24 rounded-full bg-[#ff9900] flex items-center justify-center">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Message */}
        <p className="text-gray-800 max-w-md">
          Thank you for choosing us, and we look forward to welcoming you soon.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="mt-4 bg-[#ff9900] hover:bg-[#ff8800] transition text-white font-semibold px-12 py-3 rounded-lg"
        >
          Back to Home
        </Link>

      </div>
    </div>
  );
}
