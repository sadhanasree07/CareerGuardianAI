"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import CompanyReportCard from "@/components/company/CompanyReportCard";

export default function CompanyPage() {
  const params = useParams();

  const id = params.id as string;

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadCompany() {
      try {
        const response = await fetch(
          `/api/company/${encodeURIComponent(id)}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Company report not found."
          );
          return;
        }

        setCompany(data.company);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load company report."
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-slate-600">
          Loading Company Trust Report...
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Company Report Not Found
        </h1>

        <p className="mt-3 text-slate-600">
          {error ||
            "There is no verification data available yet."}
        </p>
      </div>
    );
  }

  return (
    <CompanyReportCard
      company={company}
    />
  );
}