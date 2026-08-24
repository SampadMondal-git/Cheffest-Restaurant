import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
  badge?: ReactNode;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  label,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value]
  );

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
    <div ref={containerRef} className={`relative ${className}`}>
      {label ? (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-[#fffaf3] px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:border-[#ff9900] focus:outline-none focus:ring-2 focus:ring-[#ff9900]/25"
      >
        <span className="text-left">{selected?.label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl hide-scrollbar">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full flex-col gap-1 px-4 py-3 text-left text-sm transition hover:bg-[#fff3e0]"
            >
              <span className="font-medium text-gray-900">{option.label}</span>
              {option.description ? (
                <span className="text-xs text-gray-500">{option.description}</span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
