import {NextResponse} from "next/server";

import connectDB from "@/lib/mongodb";

import Verification from "@/models/Verification";
import CareerDNA from "@/models/CareerDNA";
import Resume from "@/models/Resume";
import Interview from "@/models/Interview";
import Placement from "@/models/Placement";
export async function GET(){

try{

await connectDB();

const verification=
await Verification.findOne()
  .select("-transcript -cleanTranscript -transcriptSegments -keyEvidence -repeatedEvidence -recordingRiskSignals -mediaMetadata -guardianTrustCheck")
  .sort({createdAt:-1});

const career=
await CareerDNA.findOne().sort({createdAt:-1});

const resume=
await Resume.findOne().sort({createdAt:-1});

const interview=
await Interview.findOne().sort({createdAt:-1});

const verificationScore=
verification?.trustScore||0;

const careerScore=
career?.report?.readiness||0;

const resumeScore=
resume?.resumeScore||0;

const interviewScore=
interview?.score||0;

const placement =
  await Placement.findOne()
    .sort({ createdAt: -1 });

const placementScore =
  placement?.placementScore || 0;

const guardianScore=Math.round(

verificationScore*0.10+

careerScore*0.35+

resumeScore*0.25+

interviewScore*0.30

);

return NextResponse.json({

success:true,

verification,

career,

resume,

interview,

placement,

placementScore,

guardianScore,

verificationScore,

careerScore,

resumeScore,

interviewScore,

});

}catch(err){

console.error(err);

return NextResponse.json({

success:false,

},{status:500});

}

}
