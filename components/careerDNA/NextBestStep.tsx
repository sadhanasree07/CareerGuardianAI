"use client";

export default function NextBestStep(){

const steps=[

"Learn STM32",

"Master FreeRTOS",

"Build 2 Embedded Projects",

"Publish GitHub Portfolio",

"Apply for Embedded Internship"

];

return(

<div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white shadow-xl">

<h2 className="text-3xl font-bold">

AI Next Best Step

</h2>

<p className="mt-3 text-blue-100">

Complete these tasks to become industry-ready.

</p>

<div className="mt-8 space-y-4">

{steps.map((step,index)=>(

<div

key={index}

className="rounded-xl bg-white/20 p-4"

>

✅ {step}

</div>

))}

</div>

</div>

)

}