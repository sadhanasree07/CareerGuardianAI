import { NextRequest, NextResponse } from "next/server";
import { verifyDomain } from "@/lib/live/domain";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";
import groq from "@/lib/groq";
import { buildGuardianTrustAssessment } from "@/lib/guardianTrustAssessment";

const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";
const hostOf = (value: string) => {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch { return ""; }
};
const safePublicUrl = (value: string) => {
  const host = hostOf(value);
  return Boolean(host && !/(^localhost$|\.localhost$|\.local$|\.internal$|\.test$|\.invalid$|\.example$)/i.test(host)
    && !/^(127\.|10\.|192\.168\.|0\.|169\.254\.)/.test(host)
    && !/^172\.(1[6-9]|2\d|3[01])\./.test(host));
};
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const samePhone = (a: string, b: string) => a.replace(/\D/g, "").slice(-10) === b.replace(/\D/g, "").slice(-10);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const company = clean(body.company);
    const claimedWebsite = clean(body.claimedWebsite, 500);
    const claimedEmail = clean(body.claimedEmail, 254).toLowerCase();
    const claimedPhone = clean(body.claimedPhone, 50);
    const claimedRole = clean(body.claimedRole);
    const independentWebsite = clean(body.independentWebsite, 500);
    const independentEmail = clean(body.independentEmail, 254).toLowerCase();
    const independentPhone = clean(body.independentPhone, 50);
    const independentRole = clean(body.independentRole);
    const opportunityUrl = clean(body.opportunityUrl, 500);
    const confirmationSource = clean(body.confirmationSource, 120);
    const initialRisk = Math.max(0, Math.min(100, Number(body.initialRisk) || 0));
    const initialConfidence = Math.max(0, Math.min(100, Number(body.initialConfidence) || 0));
    const initialSourceConfidence = Math.max(0, Math.min(100, Number(body.initialSourceConfidence) || 0));
    const initialCoverage = Math.max(0, Math.min(100, Number(body.initialCoverage) || 0));
    const initialVerdict = clean(body.initialVerdict, 30).toUpperCase();

    if (!company || (!independentWebsite && !independentEmail && !independentPhone && !independentRole && !opportunityUrl && !confirmationSource)) {
      return NextResponse.json({ success: false, message: "Enter the company and at least one detail found independently." }, { status: 400 });
    }
    if (independentWebsite && !safePublicUrl(independentWebsite)) {
      return NextResponse.json({ success: false, message: "Enter a public website using a normal domain name." }, { status: 400 });
    }
    if (opportunityUrl && !safePublicUrl(opportunityUrl)) {
      return NextResponse.json({ success: false, message: "Enter a public opportunity URL using a normal domain name." }, { status: 400 });
    }

    const refWebsiteHost = hostOf(independentWebsite);
    const claimedWebsiteHost = hostOf(claimedWebsite);
    const domainCheck = independentWebsite ? await verifyDomain(independentWebsite) : null;
    const opportunityDomainCheck = opportunityUrl ? await verifyDomain(opportunityUrl) : null;
    const websiteMatch = claimedWebsiteHost && refWebsiteHost ? claimedWebsiteHost === refWebsiteHost : null;
    const emailDomain = (email: string) => email.split("@")[1] || "";
    const emailMatch = claimedEmail && independentEmail ? claimedEmail === independentEmail : null;
    const emailDomainMatch = claimedEmail && independentWebsite ? emailDomain(claimedEmail) === refWebsiteHost : null;
    const phoneMatch = claimedPhone && independentPhone ? samePhone(claimedPhone, independentPhone) : null;
    const roleMatch = claimedRole && independentRole ? normalize(claimedRole) === normalize(independentRole) : null;

    const assessment = buildGuardianTrustAssessment({
      initialRisk, initialConfidence, initialSourceConfidence, initialCoverage, initialVerdict,
      websiteMatch, emailMatch, emailDomainMatch, phoneMatch, roleMatch,
      hasIndependentWebsite: Boolean(independentWebsite), hasIndependentContact: Boolean(independentEmail || independentPhone),
      hasRoleReference: Boolean(independentRole), hasOpportunityUrl: Boolean(opportunityUrl), hasConfirmationSource: Boolean(confirmationSource),
      companyWebsiteReachable: domainCheck ? domainCheck.passed : null,
      opportunityUrlReachable: opportunityDomainCheck ? opportunityDomainCheck.passed : null,
    });
    const result = {
      completedAt: new Date().toISOString(),
      ...assessment,
      provenance: {
        referenceDetails: "USER PROVIDED AS INDEPENDENTLY FOUND; not authenticated by CareerGuardian",
        confirmationSource: confirmationSource || "Not provided",
        checkedAt: new Date().toISOString(),
      },
    };

    let aiExplanation = "";
    try {
      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b", temperature: 0, response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "Explain only the supplied structured cross-check. User-provided references are not independently authenticated. Reachability is not identity. Do not claim registry or job posting verification. Never change scores or verdict. Return JSON with summary." },
          { role: "user", content: JSON.stringify({ company, result }) },
        ],
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}");
      if (typeof parsed.summary === "string") aiExplanation = parsed.summary.slice(0, 900);
    } catch { /* Deterministic outcome remains available without AI. */ }

    let saved = false;
    const verificationId = clean(body.verificationId, 100);
    const token = request.cookies.get("token")?.value;
    const user = token ? verifyToken(token) as { id?: string } | null : null;
    if (verificationId && user?.id) {
      await connectDB();
      const record = await Verification.findById(verificationId);
      if (!record || String(record.userId) !== String(user.id)) {
        return NextResponse.json({ success: false, message: "This verification is unavailable for the signed-in account." }, { status: 403 });
      }
      record.guardianTrustCheck = { ...result, aiExplanation };
      record.riskScore = assessment.riskScore;
      record.verificationConfidence = assessment.verificationConfidence;
      record.trustScore = assessment.trustScore;
      record.status = assessment.verdict;
      record.recommendedAction = result.recommendedAction;
      await record.save();
      saved = true;
    }
    return NextResponse.json({ success: true, ...result, aiExplanation, saved });
  } catch (error) {
    console.error("Guardian trust check error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "The company and opportunity cross-check could not be completed." }, { status: 500 });
  }
}
