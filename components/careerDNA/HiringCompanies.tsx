"use client";

const companies=[

"Texas Instruments",

"Qualcomm",

"NVIDIA",

"Bosch",

"Intel",

"Samsung",

"Zoho",

"Siemens"

];

export default function HiringCompanies(){

return(

<div className="rounded-3xl bg-white p-8 shadow">

<h2 className="mb-8 text-2xl font-bold">

Top Hiring Companies

</h2>

<div className="flex flex-wrap gap-3">

{companies.map((company,index)=>(

<span

key={index}

className="rounded-full bg-blue-100 px-5 py-3 font-medium"

>

{company}

</span>

))}

</div>

</div>

)

}