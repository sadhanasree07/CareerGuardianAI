"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, ExternalLink } from "lucide-react";
import { useLanguage } from "@/src/context/LanguageContext";

interface NotificationItem {
  _id: string;
  company: string;
  jobTitle: string;
  jobUrl: string;
  matchScore: number;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json();
    if (result.success) { setItems(result.notifications); setUnreadCount(result.unreadCount); }
  }

  useEffect(() => { load().catch(() => undefined); }, []);

  useEffect(() => {
    function close(event: MouseEvent) { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function openNotification(item: NotificationItem) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: item._id }) });
    window.open(item.jobUrl, "_blank", "noopener,noreferrer");
    setItems((current) => current.map((entry) => entry._id === item._id ? { ...entry, isRead: true } : entry));
    setUnreadCount((count) => Math.max(0, count - (item.isRead ? 0 : 1)));
  }

  return <div ref={ref} className="relative shrink-0"><button type="button" aria-label={t("notifications.open")} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative flex h-10 w-10 items-center justify-center rounded-xl p-0 text-slate-600 transition hover:bg-cyan-50 hover:text-cyan-700"><Bell className="h-5 w-5" />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-black text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>{open && <div role="menu" className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-4"><strong>{t("notifications.title")}</strong><span className="text-xs text-slate-500">{unreadCount} {t("notifications.unread")}</span></div>{items.length === 0 ? <p className="p-6 text-sm text-slate-500">{t("notifications.empty")}</p> : <div className="max-h-96 overflow-y-auto">{items.map((item) => <button role="menuitem" type="button" key={item._id} onClick={() => openNotification(item)} className={`block w-full border-b p-4 text-left transition hover:bg-cyan-50 ${item.isRead ? "bg-white" : "bg-cyan-50/70"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-cyan-700">{item.company}</p><p className="mt-1 font-bold text-slate-900">{item.jobTitle}</p><p className="mt-1 text-sm text-slate-600">{item.matchScore}% {t("notifications.careerMatch")}</p></div><ExternalLink className="h-4 w-4 shrink-0 text-slate-400" /></div></button>)}</div>}</div>}</div>;
}
