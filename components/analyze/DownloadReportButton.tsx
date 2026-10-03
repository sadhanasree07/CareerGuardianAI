"use client";

import { FileDown } from "lucide-react";
import { generateReport } from "@/lib/report";

export default function DownloadReportButton({
  data,
}:{
  data:any;
}){

  return(

    <button
      onClick={()=>generateReport(data)}
      className="mt-8 w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-4 text-lg font-semibold text-white hover:opacity-90"
    >

      <div className="flex items-center justify-center gap-3">

        <FileDown className="h-6 w-6"/>

        Download Investigation Report

      </div>

    </button>

  );

}