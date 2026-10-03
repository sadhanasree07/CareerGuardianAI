"use client";

export default function CareerReadiness(){

const score=82;

return(

<div className="rounded-3xl bg-white p-8 shadow">

<h2 className="text-2xl font-bold">

Career Readiness

</h2>

<div className="mt-8">

<div className="mb-4 flex justify-between">

<span>

Placement Ready

</span>

<span className="font-bold">

{score}%

</span>

</div>

<div className="h-4 rounded-full bg-slate-200">

<div

className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"

style={{

width:`${score}%`

}}

>

</div>

</div>

</div>

</div>

)

}