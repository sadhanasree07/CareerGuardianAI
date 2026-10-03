"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function WelcomeLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(100, Math.round((elapsed / 850) * 100));
      setProgress(next);
      if (next === 100) {
        window.clearInterval(timer);
        window.setTimeout(() => setVisible(false), 220);
      }
    }, 30);
    return () => window.clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="welcome-loader" role="status" aria-label="Loading CareerGuardian AI">
      <div className="welcome-loader__mark"><ShieldCheck className="h-7 w-7" /></div>
      <p className="welcome-loader__eyebrow">CAREERGUARDIAN AI</p>
      <h1 className="welcome-loader__title">Protect your next move.</h1>
      <div className="welcome-loader__track"><span style={{ width: `${progress}%` }} /></div>
      <p className="welcome-loader__status">Securing your career workspace <strong>{progress}%</strong></p>
    </div>
  );
}
