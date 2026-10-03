"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown, type LucideIcon } from "lucide-react";

interface DropdownItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

interface NavbarDropdownProps {
  title: string;
  items: DropdownItem[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function NavbarDropdown({
  title,
  items,
  open,
  onToggle,
  onClose,
}: NavbarDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-700"
      >
        {title}

        <ChevronDown
          className={`h-4 w-4 transition duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div onMouseDown={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} className="absolute left-0 top-[calc(100%+0.35rem)] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">

          {items.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                window.location.assign(item.href);
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${item.active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"}`}
            >
              {item.icon && <item.icon className="h-4 w-4 shrink-0 text-indigo-600" />}
              {item.label}
            </Link>
          ))}

        </div>
      )}
    </div>
  );
}