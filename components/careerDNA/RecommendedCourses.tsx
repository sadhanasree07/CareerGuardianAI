"use client";

const courses=[

"NPTEL Embedded Systems",

"STM32",

"FreeRTOS",

"PCB Design Advanced",

"Embedded Linux",

"ARM Cortex-M"

];

export default function RecommendedCourses(){

return(

<div className="rounded-3xl bg-white p-8 shadow">

<h2 className="mb-8 text-2xl font-bold">

Recommended Certifications

</h2>

<div className="space-y-4">

{courses.map((course,index)=>(

<div

key={index}

className="rounded-xl border p-4"

>

🎓 {course}

</div>

))}

</div>

</div>

)

}