"use client";

import { useState } from "react";

import OpportunityHeader from "@/components/opportunities/OpportunityHeader";
import OpportunityFilters from "@/components/opportunities/OpportunityFilters";
import OpportunityList from "@/components/opportunities/OpportunityList";
import OpportunityMatch from "@/components/opportunities/OpportunityMatch";

export default function OpportunitiesPage(){

const [data,setData]=useState<any>(null);

async function search(filters:any){

const res=await fetch("/api/opportunities",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(filters)

});

const json=await res.json();

if(json.success){

setData(json.data);

}

}

return(

<main className="min-h-screen bg-slate-50">

<section className="mx-auto max-w-7xl px-6 py-10">

<OpportunityHeader/>

<div className="mt-10">

<OpportunityFilters
onSearch={search}
/>

</div>

{data && (

<div className="mt-10 space-y-8">

<OpportunityMatch
match={data.match}
/>

<OpportunityList
jobs={data.jobs}
/>

</div>

)}

</section>

</main>

)

}