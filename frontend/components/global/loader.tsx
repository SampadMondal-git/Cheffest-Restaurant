import React from "react";
import { ChefHat, Sparkles } from "lucide-react";

interface LoaderProps {
  fullPage?: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ fullPage = false, message = "Loading..." }) => {
  const content = (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff9900] animate-spin"></div>
        <div className="absolute inset-2 rounded-full bg-linear-to-br from-[#ff9900] to-[#ffb84d] shadow-lg"></div>
        <ChefHat className="relative h-7 w-7 text-white sm:h-8 sm:w-8" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">{message}</h3>
        <p className="text-sm text-gray-500">Please wait while we prepare everything for you.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff9900] animate-bounce" style={{ animationDelay: "0s" }}></div>
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff9900] animate-bounce" style={{ animationDelay: "0.15s" }}></div>
        <div className="h-2.5 w-2.5 rounded-full bg-[#ff9900] animate-bounce" style={{ animationDelay: "0.3s" }}></div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
        <Sparkles className="h-3.5 w-3.5" />
        Freshly served
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,153,0,0.16),transparent_60%)] px-4 backdrop-blur-sm">
        <div className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-orange-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(255,153,0,0.16)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-linear-to-br from-[#fff7eb] via-white to-[#ffe1aa]"></div>
          <div className="relative">{content}</div>
        </div>
      </div>
    );
  }

  return <div className="flex items-center justify-center py-12">{content}</div>;
};

export default Loader;
