import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { verifyDomain } from "@/lib/live/domain";
import { verifyEmail } from "@/lib/live/email";
import { fuseRecruitmentEvidence, type EvidenceItem } from "@/lib/evidenceFusion";
import connectDB from "@/lib/mongodb";
import Verification from "@/models/Verification";
import User from "@/models/User";
import { calculateBadges } from "@/lib/badges";
import groq from "@/lib/groq";
import { analyzePayGuard, toPaymentFraudDetection } from "@/lib/payguard";
import { analyzeThreatNet, emptyThreatIntelligence, threatNetConfig, type ThreatIntelligence } from "@/lib/threatnet";
import { analyzeLinks, extractUrls, linkSentinelConfig } from "@/lib/linkSentinel";
import { aggregateScamRisk } from "@/lib/linkSentinel/risk";
import { assessGovernmentRegistryCrossCheck, classifyGovernmentRecruitmentClaim, governmentRegistryConfig, mergeGovernmentRegistryEvidence } from "@/lib/governmentRegistry";
import { verifyNcsReference } from "@/lib/governmentRegistryNcs";
import { buildProvenanceAssessment, type DocumentProvenance } from "@/lib/documentProvenance";
import { buildDigitalIdentityAssessment } from "@/lib/digitalIdentity";
import { calculateEvidenceCoverage, calculateEvidenceWeightedScamRisk } from "@/lib/scamRisk";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fingerprintInput = { ...body };
    delete fingerprintInput.userId;
    delete fingerprintInput.submissionId;
    const verificationFingerprint = createHash("sha256").update(JSON.stringify(fingerprintInput)).digest("hex");
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) as { id?: string } | null : null;
    const authenticatedUserId = decoded?.id;
    const { company, website, email, phone, salary, notificationNumber, applicationFee, education, jobRole, description } = body;
    const documentProvenanceInput = body.documentProvenance && typeof body.documentProvenance === "object" ? body.documentProvenance as DocumentProvenance : null;
    const qrPayloads: string[] = Array.isArray(body.decodedQrPayloads) ? (body.decodedQrPayloads as unknown[]).filter((value): value is string => typeof value === "string") : [];
    const embeddedUrls = documentProvenanceInput?.metadata?.embeddedUrls || [];
    const additionalExtractedEvidence = [...qrPayloads, ...embeddedUrls].filter((value): value is string => typeof value === "string").join("\n");
    const crossCheckInput = {
      ...body,
      rawText: [body.rawText, additionalExtractedEvidence].filter((value): value is string => typeof value === "string" && value.length > 0).join("\n"),
    };
    const domain = await verifyDomain(website || "");
    const emailResult = verifyEmail(email || "", website || "");
    const payGuardSource = { ...body, rawText: [body.rawText, body.extractedText, body.text, body.transcript].filter((value): value is string => typeof value === "string").join("\n"), sourceUrl: body.inputType === "url" ? body.website || body.url : undefined };
    const payGuard = analyzePayGuard(payGuardSource);
    const evidence = fuseRecruitmentEvidence(body, domain, emailResult, payGuard);
    const claimType = classifyGovernmentRecruitmentClaim(crossCheckInput);
    const governmentJobClaim = claimType === "GOVERNMENT" || claimType === "PSU_GOVERNMENT_LINKED";
    const ncsReference = governmentRegistryConfig.enabled
      ? await verifyNcsReference({
          governmentJobClaim,
          organization: typeof company === "string" ? company : typeof body.organization === "string" ? body.organization : "",
          department: typeof body.department === "string" ? body.department : "",
          jobTitle: typeof jobRole === "string" ? jobRole : "",
          notificationNumber: typeof notificationNumber === "string" ? notificationNumber : "",
          advertisementNumber: typeof body.advertisementNumber === "string" ? body.advertisementNumber : "",
          recruitmentNumber: typeof body.recruitmentNumber === "string" ? body.recruitmentNumber : "",
          jobId: typeof body.jobId === "string" ? body.jobId : "",
          recruitmentYear: typeof body.recruitmentYear === "string" ? body.recruitmentYear : "",
          location: typeof body.location === "string" ? body.location : "",
          applicationStartDate: typeof body.applicationStartDate === "string" ? body.applicationStartDate : "",
          applicationEndDate: typeof body.applicationClosingDate === "string" ? body.applicationClosingDate : typeof body.applicationEndDate === "string" ? body.applicationEndDate : "",
          applicationUrl: typeof body.applicationUrl === "string" ? body.applicationUrl : body.inputType === "url" ? typeof body.url === "string" ? body.url : typeof website === "string" ? website : "" : typeof documentProvenanceInput?.facts?.applicationUrl === "string" ? documentProvenanceInput.facts.applicationUrl : "",
          sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl : typeof website === "string" ? website : typeof body.url === "string" ? body.url : "",
          eligibility: typeof education === "string" ? education : "",
          salary: typeof salary === "string" ? salary : "",
          rawText: typeof crossCheckInput.rawText === "string" ? crossCheckInput.rawText : "",
        })
      : {
          source: "NCS" as const, status: governmentJobClaim ? "UNAVAILABLE" as const : "NOT_APPLICABLE" as const,
          governmentJobClaim, organization: typeof company === "string" ? company : null,
          jobTitle: typeof jobRole === "string" ? jobRole : null, notificationNumber: typeof notificationNumber === "string" ? notificationNumber : null,
          matchedFields: [], mismatchedFields: [], unavailableFields: [], ncsReferenceUrl: null, officialSourceUrl: null,
          evidence: [], confidence: 0, checkedAt: null, reason: "Government reference checking is disabled.", searchQueries: [],
        };
    const governmentVerification = governmentRegistryConfig.enabled
      ? assessGovernmentRegistryCrossCheck(crossCheckInput, ncsReference)
      : {
          isGovernmentJobClaim: false,
          claimType,
          claimedOrganization: typeof company === "string" ? company : "",
          notificationNumber: typeof notificationNumber === "string" ? notificationNumber : "",
          ncsReference,
          domainValidation: { urlChecked: typeof website === "string" ? website : "", officialTld: false, status: "NOT_APPLICABLE" as const, reason: "Government registry cross-check is disabled by configuration." },
          registryChecks: [],
          notificationMatch: { status: "NOT_APPLICABLE" as const, matchedFields: [] },
          recruitmentConsistency: { status: "NOT_APPLICABLE" as const, issues: [] },
          paymentSafety: { status: "NOT_APPLICABLE" as const, issues: [] },
          evidenceQuality: "UNAVAILABLE" as const,
          verificationStatus: "UNAVAILABLE" as const,
          redFlags: [],
          positiveSignals: [],
          recommendation: "Government registry cross-check is disabled by configuration.",
        };
    const digitalIdentity = buildDigitalIdentityAssessment({
      website: typeof website === "string" && website ? website : typeof body.url === "string" && body.url ? body.url : documentProvenanceInput?.facts?.applicationUrl || "",
      company: typeof company === "string" ? company : documentProvenanceInput?.facts?.organization || "",
      sourceType: body.sourceType || "unknown",
      jobRole: typeof jobRole === "string" ? jobRole : "",
      notificationNumber: typeof notificationNumber === "string" ? notificationNumber : "",
      jobId: typeof body.jobId === "string" ? body.jobId : "",
      location: typeof body.location === "string" ? body.location : "",
      eligibility: typeof education === "string" ? education : "",
      salary: typeof salary === "string" ? salary : "",
      recruiterEmail: typeof body.recruiterEmail === "string" ? body.recruiterEmail : typeof email === "string" ? email : "",
      recruiterName: typeof body.recruiterName === "string" ? body.recruiterName : typeof body.contactPerson === "string" ? body.contactPerson : "",
      applicationFee: typeof applicationFee === "string" ? applicationFee : typeof body.applicationFee === "string" ? body.applicationFee : "",
      description: typeof description === "string" ? description : "",
      rawText: [body.rawText, body.extractedText, body.text, body.transcript, body.cleanTranscript].filter((value): value is string => typeof value === "string").join("\n"),
      paymentRequested: Boolean(payGuard.paymentRequest || body.upi || body.bankDetailsPresent),
      personalPaymentRisk: Boolean(payGuard.paymentRequest && (payGuard.severity === "CRITICAL" || ((payGuard.upiIds.length > 0 || payGuard.bankAccounts.length > 0) && !payGuard.paymentChannel.officialEvidence))),
      paymentAmount: typeof body.paymentAmount === "string" ? body.paymentAmount : "",
      upi: typeof body.upi === "string" ? body.upi : "",
      bankDetailsPresent: Boolean(body.bankDetailsPresent),
      sourceConfidence: evidence.sourceConfidence,
      governmentReference: ncsReference,
    });
    const digitalIdentityEvidence: EvidenceItem[] = digitalIdentity.evidence.map((signal) => ({
      id: signal.signal,
      category: "digital-identity",
      state: signal.status === "MISMATCH" || signal.status === "CONTRADICTED" || signal.status === "HIGH_RISK" || signal.status === "UNVERIFIED" ? "HIGH_RISK" : signal.status === "REVIEW" || signal.status === "SUSPICIOUS" || signal.status === "PARTIAL_MATCH" ? "REVIEW" : signal.status === "MATCH" ? "PASS" : "NOT_VERIFIED",
      weight: signal.status === "MISMATCH" || signal.status === "CONTRADICTED" ? 24 : signal.status === "UNVERIFIED" ? 12 : signal.status === "SUSPICIOUS" || signal.status === "REVIEW" ? 8 : 0,
      explanation: `${signal.signal.replace(/_/g, " ")} status: ${signal.status}. ${signal.source}.`,
      source: signal.source,
    }));
    evidence.evidence.push(...digitalIdentityEvidence);
    evidence.positiveSignals.push(...digitalIdentity.positiveSignals);
    evidence.negativeSignals.push(...digitalIdentity.redFlags);
    evidence.missingSignals.push(...digitalIdentity.unavailableSignals);
    evidence.layers.unshift({
      layer: 1,
      title: "DIGITAL IDENTITY & OPPORTUNITY AUTHENTICITY",
      passed: digitalIdentity.finalStatus === "PASS",
      score: digitalIdentity.riskScore ?? 0,
      state: digitalIdentity.finalStatus === "HIGH_RISK" ? "HIGH_RISK" : digitalIdentity.finalStatus === "REVIEW" ? "REVIEW" : digitalIdentity.finalStatus === "PASS" ? "PASS" : "NOT_VERIFIED",
      message: `Domain: ${digitalIdentity.domain.status}; opportunity authorization: ${digitalIdentity.opportunityAuthorization.status}; payment identity: ${digitalIdentity.paymentIdentity.status}.`,
    });
    evidence.layers = evidence.layers.map((layer, index) => ({ ...layer, layer: index + 1 }));
    mergeGovernmentRegistryEvidence(evidence, governmentVerification);
    const paymentFraudDetection = toPaymentFraudDetection(payGuard);
    const linkContext = [body.rawText, body.extractedText, body.text, body.transcript, body.cleanTranscript, body.description, ...qrPayloads, ...embeddedUrls]
      .filter((value): value is string => typeof value === "string").join("\n").slice(0, 30000);
    const directUrl = typeof website === "string" && website ? website : typeof body.url === "string" && body.url ? body.url : documentProvenanceInput?.facts?.applicationUrl || "";
    const hasUrlEvidence = extractUrls(linkContext).length > 0 || Boolean(directUrl);
    let linkSentinel = {
      enabled: linkSentinelConfig.enabled,
      status: hasUrlEvidence ? linkSentinelConfig.enabled ? "UNAVAILABLE" : "NOT_ENABLED" : "NOT_APPLICABLE",
      reason: hasUrlEvidence ? linkSentinelConfig.enabled ? "URL analysis has not completed." : "Link Sentinel is disabled by configuration." : "No URL was found in the supplied evidence.",
      urlsAnalyzed: [] as Awaited<ReturnType<typeof analyzeLinks>>,
    };
    if (linkSentinelConfig.enabled && hasUrlEvidence) {
      try {
        linkSentinel.urlsAnalyzed = await analyzeLinks(linkContext, typeof company === "string" ? company : "", directUrl);
        linkSentinel.status = "ACTIVE";
        linkSentinel.reason = linkSentinel.urlsAnalyzed.length ? "URL evidence analyzed." : "No valid URL could be analyzed.";
      } catch (error) {
        linkSentinel.status = "UNAVAILABLE";
        linkSentinel.reason = "Link analysis could not complete.";
        console.error("[LinkSentinel] Integration unavailable:", error instanceof Error ? error.message : "Unknown error");
      }
    }
    const hasCredentialEvidence = evidence.evidence.some((item) => item.id === "credentials" && item.state === "HIGH_RISK" && item.weight > 0);
    const personalPayment = payGuard.paymentRequest && (payGuard.upiIds.length > 0 || payGuard.bankAccounts.length > 0);
    const suspiciousQrPayment = payGuard.paymentRequest && payGuard.qr.detected && !payGuard.paymentChannel.officialEvidence;
    const maliciousRedirect = linkSentinel.urlsAnalyzed.some((link) => link.phishingSignals.some((signal) => /MALICIOUS|PHISHING/i.test(signal)));
    const finalLayer = () => evidence.layers[evidence.layers.length - 1] ?? null;
    const previousRisk = evidence.riskScore;
    evidence.riskScore = aggregateScamRisk(previousRisk, linkSentinel.urlsAnalyzed, {
      criticalFinancialOrCredential: payGuard.severity === "CRITICAL" || hasCredentialEvidence,
      personalPayment,
      suspiciousQrPayment,
      maliciousRedirect,
    });
    const contribution = evidence.riskScore - previousRisk;
    if (linkSentinel.urlsAnalyzed.length || contribution > 0) {
      evidence.trustScore = Math.round((100 - evidence.riskScore) * evidence.verificationConfidence / 100);
      if (evidence.riskScore >= 60) evidence.verdict = "HIGH RISK";
      else if (evidence.verdict === "LOW RISK" && contribution >= 8) evidence.verdict = "REVIEW";
      const riskLayer = finalLayer();
      if (riskLayer) {
        riskLayer.state = evidence.verdict === "HIGH RISK" ? "HIGH_RISK" : evidence.verdict === "LOW RISK" ? "PASS" : "REVIEW";
        riskLayer.passed = evidence.verdict === "LOW RISK";
        riskLayer.score = evidence.trustScore;
      }
      if (linkSentinel.urlsAnalyzed.length) {
          const lookalikeImpersonation = linkSentinel.urlsAnalyzed.some((link) => link.domainAnalysis.organizationDomainStatus === "MISMATCH" && link.domainAnalysis.isTyposquatting && link.domainAnalysis.similarityScore >= 85);
          const explanation = lookalikeImpersonation
            ? "High risk because the submitted domain does not exactly match the verified official domain and closely imitates it through domain manipulation."
            : `${linkSentinel.urlsAnalyzed.length} recruitment URL(s) were weighted by domain verification, manipulation, redirects, and payment-risk evidence.`;
          if (riskLayer) riskLayer.message += ` Link Sentinel evidence-weighted risk adjustment: ${contribution >= 0 ? "+" : ""}${contribution} point(s). ${explanation}`;
          if (contribution > 0 || lookalikeImpersonation) {
            evidence.evidence.push({ id: "link-sentinel", category: "url-security", state: evidence.riskScore >= 70 ? "HIGH_RISK" : "REVIEW", weight: Math.max(0, contribution), explanation, source: "Link Sentinel" });
          }
          if (lookalikeImpersonation) evidence.negativeSignals.push("The submitted domain closely imitates the verified official domain through domain manipulation.");
      } else if (riskLayer) {
        riskLayer.message += " Critical financial or credential evidence elevated security risk independently of URL analysis.";
      }
    }
    const threatText = [body.rawText, body.extractedText, body.text, body.transcript, body.cleanTranscript, body.description, ...qrPayloads, ...embeddedUrls]
      .filter((value): value is string => typeof value === "string").join("\n").slice(0, 30000);
    let threatIntelligence: ThreatIntelligence & { enabled: boolean } = threatNetConfig.enabled
      ? { ...emptyThreatIntelligence("ACTIVE_ANALYZING"), enabled: true }
      : { ...emptyThreatIntelligence("NOT_ENABLED", "ThreatNet is disabled by configuration."), enabled: false };
    try {
      if (threatNetConfig.enabled) {
        const result = await analyzeThreatNet({ text: threatText, company, jobRole, website, phone, notificationNumber });
        threatIntelligence = result ? { enabled: true, ...result } : { ...emptyThreatIntelligence("UNAVAILABLE", "ThreatNet analysis did not return a result."), enabled: true };
      }
    } catch (error) {
      threatIntelligence = { ...emptyThreatIntelligence("UNAVAILABLE", "ThreatNet database or analysis service is unavailable."), enabled: true };
      console.error("[ThreatNet] Integration unavailable:", error instanceof Error ? error.message : "Unknown error");
    }
    const previousCoverage = evidence.evidenceCoverage;
    const confidenceSupport = evidence.verificationConfidence - Math.round(previousCoverage * 0.55);
    const moduleCoverage = calculateEvidenceCoverage({
      documentUploaded: Boolean(documentProvenanceInput?.fileInfo?.sizeBytes),
      governmentClaim: governmentVerification.isGovernmentJobClaim,
      registryAvailable: governmentVerification.isGovernmentJobClaim && governmentVerification.ncsReference.status !== "UNAVAILABLE",
      registryNotificationAvailable: governmentVerification.isGovernmentJobClaim && ["EXACT_MATCH", "STRONG_MATCH", "PARTIAL_MATCH", "NO_MATCH", "NOT_FOUND"].includes(governmentVerification.ncsReference.status),
      urlProvided: hasUrlEvidence,
      linkAnalysisActive: linkSentinel.status === "ACTIVE",
      textAvailable: threatText.trim().length >= 20,
      paymentAnalysisActive: threatText.trim().length >= 20,
      threatStatus: threatIntelligence.status,
      sourceProvided: evidence.sourceType !== "unknown",
    });
    evidence.evidenceCoverage = Math.round((previousCoverage + moduleCoverage) / 2);
    evidence.verificationConfidence = Math.max(5, Math.min(95, Math.round(evidence.evidenceCoverage * 0.55 + confidenceSupport)));
    const riskAssessment = calculateEvidenceWeightedScamRisk({
      governmentClaim: governmentVerification.isGovernmentJobClaim,
      governmentVerification,
      notificationNumber: typeof notificationNumber === "string" ? notificationNumber : "",
      notificationMatchStatus: governmentVerification.notificationMatch.status,
      recruitmentConsistencyStatus: governmentVerification.recruitmentConsistency.status,
      links: linkSentinel.urlsAnalyzed,
      payment: { paymentRequested: payGuard.paymentRequest, severity: payGuard.severity, organizationMatch: paymentFraudDetection.organizationMatch, upiIds: payGuard.upiIds, bankAccounts: payGuard.bankAccounts },
      provenance: documentProvenanceInput || undefined,
      threat: threatIntelligence,
      evidence: evidence.evidence,
    });
    evidence.riskScore = riskAssessment.score;
    const insufficientCoverage = evidence.evidenceCoverage < 40 || evidence.verificationConfidence < 55;
    const riskStatus = riskAssessment.status === "LOW RISK" && insufficientCoverage ? "REVIEW REQUIRED" : riskAssessment.status;
    evidence.verdict = evidence.riskScore >= 70 ? "HIGH RISK" : evidence.riskScore >= 20 || insufficientCoverage ? "REVIEW" : "LOW RISK";
    evidence.trustScore = Math.round((100 - evidence.riskScore) * evidence.verificationConfidence / 100);
    const finalRiskLayer = finalLayer();
    if (finalRiskLayer) {
      finalRiskLayer.state = evidence.verdict === "HIGH RISK" ? "HIGH_RISK" : evidence.verdict === "LOW RISK" ? "PASS" : "REVIEW";
      finalRiskLayer.passed = evidence.verdict === "LOW RISK";
      finalRiskLayer.score = evidence.trustScore;
      finalRiskLayer.message = `Evidence-weighted Scam Risk ${evidence.riskScore}% (${riskStatus}); Verification Confidence ${evidence.verificationConfidence}%; Evidence Coverage ${evidence.evidenceCoverage}%.`;
    }
    evidence.recommendedAction = riskStatus === "HIGH RISK" || riskStatus === "CRITICAL RISK"
      ? "Do not pay or share sensitive information. Verify the opportunity through independently sourced official contact details."
      : riskStatus === "REVIEW REQUIRED"
        ? "Some evidence is unavailable or needs comparison. Confirm the organization, notification and URL using an independently sourced official channel before acting."
        : evidence.recommendedAction;
    const submittedProvenance = documentProvenanceInput;
    const documentProvenance = submittedProvenance
      ? {
          ...submittedProvenance,
          assessment: buildProvenanceAssessment({
            provenance: submittedProvenance,
            claimedOrganization: governmentVerification.claimedOrganization || (typeof company === "string" ? company : ""),
            claimedNotificationNumber: governmentVerification.notificationNumber || (typeof notificationNumber === "string" ? notificationNumber : ""),
            governmentVerification,
            paymentFraudDetection,
            linkSentinel,
            existingVerdict: evidence.verdict,
          }),
        }
      : undefined;
    let aiExplanation = "";
    try {
      const explanationResponse = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: 'You are CareerGuardian AI Trust Engine. Explain the supplied structured recruitment assessment accurately. Respond in selectedApplicationLanguage when possible. Distinguish supporting, risk, missing, and conflicting evidence. Missing evidence does not mean fraud. A call, personal phone, informal language, accent, grammar, or lack of a public posting is not fraud by itself. Treat transcription as evidence, not proof. Use only supplied timestamped excerpts; do not invent quotes, timestamps, or speaker identities. Prioritize actual payment demands, credential requests, domain conflicts, impersonation, and contradictions. Never change supplied scores or verdict. Return JSON only with a summary string.'
          },
          {
            role: "user",
            content: JSON.stringify({
              sourceType: evidence.sourceType,
              inputType: body.inputType || "unknown",
              inputMethod: body.inputMethod || "unknown",
              selectedApplicationLanguage: body.selectedApplicationLanguage || "en",
              extractedData: { company, jobRole, website, email, phone, salary, applicationFee },
              recording: body.inputType === "recording" ? {
                transcript: typeof body.transcript === "string" ? body.transcript.slice(0, 20000) : "",
                transcriptSegments: (body.transcriptSegments || []).slice(0, 80),
                keyEvidence: body.keyEvidence || [], repeatedEvidence: body.repeatedEvidence || [],
                recordingRiskSignals: body.recordingRiskSignals,
                transcriptLanguage: body.transcriptLanguage,
                duration: body.recordingDuration,
                additionalEvidenceSource: body.additionalEvidenceSource || "",
              } : undefined,
              evidence: evidence.evidence,
              paymentFraudDetection,
              positiveSignals: evidence.positiveSignals,
              negativeSignals: evidence.negativeSignals,
              missingSignals: evidence.missingSignals,
              riskScore: evidence.riskScore,
              riskStatus,
              riskAssessment,
              verificationConfidence: evidence.verificationConfidence,
              sourceConfidence: evidence.sourceConfidence,
              evidenceCoverage: evidence.evidenceCoverage,
              verdict: evidence.verdict,
              recommendedAction: evidence.recommendedAction,
            }),
          },
        ],
      });
      const reply = explanationResponse.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(reply);
      if (typeof parsed.summary === "string") aiExplanation = parsed.summary.slice(0, 1200);
    } catch {
      aiExplanation = "";
    }
    const layers = evidence.layers;
    // The original response fields remain available for existing consumers.
    const verdict = evidence.verdict;
    const digitalIdentityLayerSummary = {
      ...digitalIdentity,
      evidence: digitalIdentity.evidence,
      relationshipSummary: `${digitalIdentity.domain.status} / ${digitalIdentity.infrastructure.relationship} / ${digitalIdentity.opportunityAuthorization.status}`,
    };
    await connectDB();
    const savedVerification = await Verification.create({
      userId: authenticatedUserId || "demo-user", company: company || "", jobRole: jobRole || "",
      trustScore: evidence.trustScore, status: verdict, layers, website: website || "",
      email: email || "", phone: phone || "", salary: salary || "",
      riskStatus, riskAssessment,
      notificationNumber: notificationNumber || "", applicationFee: applicationFee || "",
      education: education || "", description: description || "",
      sourceType: evidence.sourceType, riskScore: evidence.riskScore,
      inputType: body.inputType || "unknown", inputMethod: body.inputMethod || "unknown",
      verificationConfidence: evidence.verificationConfidence, sourceConfidence: evidence.sourceConfidence,
      evidenceCoverage: evidence.evidenceCoverage, evidence: evidence.evidence,
      paymentFraudDetection,
      threatIntelligence,
      linkSentinel,
      governmentVerification,
      documentProvenance,
      digitalIdentityOpportunityAuthenticity: digitalIdentityLayerSummary,
      payGuard: evidence.payGuard,
      positiveSignals: evidence.positiveSignals, negativeSignals: evidence.negativeSignals,
      missingSignals: evidence.missingSignals, independentConfirmation: evidence.independentConfirmation,
      recommendedAction: evidence.recommendedAction,
      aiExplanation,
      mediaType: body.mediaType,
      mediaMetadata: body.mediaMetadata,
      recordingDuration: body.recordingDuration,
      transcript: typeof body.transcript === "string" ? body.transcript.slice(0, 200000) : undefined,
      cleanTranscript: typeof body.cleanTranscript === "string" ? body.cleanTranscript.slice(0, 200000) : undefined,
      transcriptLanguage: body.transcriptLanguage,
      selectedApplicationLanguage: body.selectedApplicationLanguage,
      transcriptSegments: Array.isArray(body.transcriptSegments) ? body.transcriptSegments.slice(0, 1500) : undefined,
      keyEvidence: Array.isArray(body.keyEvidence) ? body.keyEvidence.slice(0, 80) : undefined,
      repeatedEvidence: Array.isArray(body.repeatedEvidence) ? body.repeatedEvidence.slice(0, 80) : undefined,
      recordingRiskSignals: body.recordingRiskSignals,
      recordingSummary: body.recordingSummary,
    });
    let unlockedBadges: string[] = [];
    let creditsAwarded = 0;
    let creditsBalance: number | null = null;
    let premiumUnlocked = false;
    if (authenticatedUserId) {
      const user = await User.findOneAndUpdate(
        {
          _id: authenticatedUserId,
          creditAwardedVerificationIds: { $ne: verificationFingerprint },
        },
        {
          $inc: { verificationCount: 1, credits: 10 },
          $addToSet: { creditAwardedVerificationIds: verificationFingerprint },
        },
        { new: true }
      );
      const currentUser = user || await User.findById(authenticatedUserId);
      if (user) creditsAwarded = 10;
      if (currentUser) {
        if (Number(currentUser.credits || 0) >= 100 && !currentUser.premiumUnlocked) {
          currentUser.premiumUnlocked = true;
          currentUser.plan = "PREMIUM";
          currentUser.premiumUnlockedAt = new Date();
        } else if (Number(currentUser.credits || 0) >= 100) {
          currentUser.plan = "PREMIUM";
          currentUser.premiumUnlockedAt = currentUser.premiumUnlockedAt || new Date();
        }
        unlockedBadges = calculateBadges(currentUser);
        currentUser.badges = unlockedBadges;
        await currentUser.save();
        creditsBalance = Number(currentUser.credits || 0);
        premiumUnlocked = creditsBalance >= 100 && Boolean(currentUser.premiumUnlocked) && currentUser.plan === "PREMIUM";
      }
    }
    return NextResponse.json({
      success: true, trustScore: evidence.trustScore, verdict, layers, unlockedBadges,
      verificationId: String(savedVerification._id),
      creditsAwarded, creditsBalance, premiumUnlocked,
      riskScore: evidence.riskScore, verificationConfidence: evidence.verificationConfidence,
      riskStatus, riskAssessment,
      sourceConfidence: evidence.sourceConfidence, sourceType: evidence.sourceType,
      evidenceCoverage: evidence.evidenceCoverage, evidence: evidence.evidence,
      paymentFraudDetection,
      threatIntelligence,
      linkSentinel,
      governmentVerification,
      documentProvenance,
      digitalIdentityOpportunityAuthenticity: digitalIdentityLayerSummary,
      inputType: body.inputType || "unknown", inputMethod: body.inputMethod || "unknown",
      sourceLabel: evidence.sourceLabel, positiveSignals: evidence.positiveSignals,
      negativeSignals: evidence.negativeSignals, missingSignals: evidence.missingSignals,
      independentConfirmation: evidence.independentConfirmation,
      recommendedAction: evidence.recommendedAction,
      aiExplanation,
      ...(body.inputType === "recording" ? {
        mediaType: body.mediaType, recordingDuration: body.recordingDuration,
        mediaMetadata: body.mediaMetadata,
        transcript: body.transcript, cleanTranscript: body.cleanTranscript,
        transcriptLanguage: body.transcriptLanguage, selectedApplicationLanguage: body.selectedApplicationLanguage,
        transcriptSegments: body.transcriptSegments, keyEvidence: body.keyEvidence,
        repeatedEvidence: body.repeatedEvidence, recordingRiskSignals: body.recordingRiskSignals,
        recordingSummary: body.recordingSummary,
      } : {}),
    });
  } catch (error) {
    console.error("Verification Error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, message: "Verification failed." }, { status: 500 });
  }
}

