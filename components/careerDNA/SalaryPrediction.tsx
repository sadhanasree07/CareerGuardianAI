"use client";

import { IndianRupee } from "lucide-react";

export default function SalaryPrediction(){

return(

<div className="rounded-3xl bg-white p-8 shadow">

<div className="flex items-center gap-3">

<IndianRupee className="h-8 w-8 text-blue-600"/>

<h2 className="text-2xl font-bold">

Salary Prediction

</h2>

</div>

<div className="mt-8 grid gap-5 md:grid-cols-2">

<div className="rounded-2xl bg-blue-50 p-6">

<p className="text-slate-500">

India

</p>

<h1 className="mt-2 text-4xl font-bold">

₹6–9 LPA

</h1>

</div>

<div className="rounded-2xl bg-cyan-50 p-6">

<p className="text-slate-500">

Abroad

</p>

<h1 className="mt-2 text-4xl font-bold">

$65K–85K

</h1>

</div>

</div>

</div>

)

}