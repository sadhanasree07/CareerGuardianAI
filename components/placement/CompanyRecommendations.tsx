"use client";

import { useState } from "react";
import {
  Building2,
  ExternalLink,
  BookOpen,
} from "lucide-react";

import CompanyRoadmap from "./CompanyRoadmap";

function getCompanyLink(company: string) {

  const links: Record<string,string> = {

    TCS:"https://www.tcs.com/careers",

    Infosys:"https://www.infosys.com/careers",

    Wipro:"https://careers.wipro.com",

    Accenture:"https://www.accenture.com/in-en/careers",

    Cognizant:"https://careers.cognizant.com",

    Capgemini:"https://www.capgemini.com/careers",

    HCL:"https://www.hcltech.com/careers",

    LTTS:"https://www.ltts.com/careers",

    Zoho:"https://www.zoho.com/careers",

    Google:"https://careers.google.com",

    Microsoft:"https://careers.microsoft.com",

    Intel:"https://jobs.intel.com",

    Qualcomm:"https://www.qualcomm.com/company/careers",

    Bosch:"https://www.bosch.in/careers",

    Siemens:"https://jobs.siemens.com",

  };

  return (
    links[company] ??
    `https://www.google.com/search?q=${company}+careers`
  );
}

export default function CompanyRecommendations({
  companies,
}:{
  companies:any[]
}){

  const [selected,setSelected]=useState("");

  if(!companies?.length) return null;

  return(

    <div className="rounded-3xl bg-white p-8 shadow">

      <div className="flex items-center gap-3">

        <Building2 className="h-8 w-8 text-blue-600"/>

        <div>

          <h2 className="text-3xl font-bold">

            Recommended Companies

          </h2>

          <p className="text-slate-500">

            Based on your AI placement prediction

          </p>

        </div>

      </div>

      <div className="mt-8 space-y-6">

        {companies.map((company,index)=>(

          <div
            key={index}
            className="rounded-3xl border p-8"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">

                  {company.name}

                </h2>

                <p className="text-slate-500">

                  {company.role}

                </p>

              </div>

              <div className="text-right">

                <p>Match</p>

                <h2 className="text-5xl font-bold text-blue-600">

                  {company.match}%

                </h2>

              </div>

            </div>

            <div className="mt-6 h-4 rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                style={{
                  width:`${company.match}%`
                }}
              />

            </div>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href={getCompanyLink(company.name)}
                target="_blank"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-white transition hover:scale-105"
              >

                <ExternalLink className="h-5 w-5"/>

                Apply Now

              </a>

              <button
                onClick={()=>setSelected(company.name)}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-4 text-white transition hover:scale-105"
              >

                <BookOpen className="h-5 w-5"/>

                View Roadmap

              </button>

            </div>

            {selected===company.name && (

              <CompanyRoadmap
                company={company.name}
              />

            )}

          </div>

        ))}

      </div>

    </div>

  );

}