import { NextResponse } from "next/server";
import Recovery from "@/models/Recovery";
import { verifyToken } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

function getUserId(request: Request) {
  const token = request.headers.get("cookie")?.match(/(?:^|; )token=([^;]+)/)?.[1];
  const decoded = token ? verifyToken(token) as { id?: string } | null : null;
  return decoded?.id || null;
}

export async function GET(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectDB();
    const recoveryCase = await Recovery.findOne({ userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, case: recoveryCase || null });
  } catch (error) {
    console.error("Recovery API GET failed:", error);
    return NextResponse.json({ success: false, message: "Recovery service is temporarily unavailable." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, message: "Sign in to save a recovery case." }, { status: 401 });

    const body = await request.json();
    const requiredStrings = ["organization", "description", "incidentDate"] as const;
    if (requiredStrings.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
      return NextResponse.json({ success: false, message: "Organization, incident description, and incident date are required." }, { status: 400 });
    }
    if (body.confirmed !== true || !["YES", "NO", "NOT_SURE"].includes(body.lostMoney)) {
      return NextResponse.json({ success: false, message: "Confirm the case details and select whether money was lost." }, { status: 400 });
    }
    const incidentDate = new Date(body.incidentDate);
    if (Number.isNaN(incidentDate.getTime())) {
      return NextResponse.json({ success: false, message: "Enter a valid incident date." }, { status: 400 });
    }
    const amount = body.amount === "" || body.amount === undefined || body.amount === null ? null : Number(body.amount);
    if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
      return NextResponse.json({ success: false, message: "Enter a valid non-negative amount." }, { status: 400 });
    }

    const stringValue = (value: unknown, maxLength: number) => typeof value === "string" ? value.trim().slice(0, maxLength) : "";
    const caseId = stringValue(body.caseId, 48);
    if (!/^CG-\d{4}-[A-F0-9-]{8,36}$/i.test(caseId)) {
      return NextResponse.json({ success: false, message: "Unable to create a valid case reference. Please try again." }, { status: 400 });
    }

    const verified = body.verifiedContext && typeof body.verifiedContext === "object" ? body.verifiedContext : {};
    await connectDB();
    const recoveryCase = await Recovery.create({
      userId,
      caseId,
      organization: stringValue(body.organization, 200),
      recruiter: stringValue(body.recruiter, 200),
      jobTitle: stringValue(body.jobTitle, 200),
      incidentDescription: stringValue(body.description, 5000),
      paymentMethod: stringValue(body.paymentMethod, 50),
      amount,
      incidentDate,
      phone: stringValue(body.phone, 100),
      email: stringValue(body.email, 254),
      location: stringValue(body.location, 200),
      notes: stringValue(body.notes, 5000),
      lostMoney: body.lostMoney,
      verifiedContext: {
        organization: stringValue(verified.organization || verified.company, 200),
        trustScore: Number.isFinite(Number(verified.trustScore)) ? Number(verified.trustScore) : null,
        verdict: stringValue(verified.verdict, 80),
      },
      status: "ASSESSING",
      timeline: [{ event: "Recovery plan prepared", date: new Date() }],
    });
    return NextResponse.json({ success: true, case: { caseId: recoveryCase.caseId, status: recoveryCase.status } }, { status: 201 });
  } catch (error) {
    console.error("Recovery API POST failed:", error);
    return NextResponse.json({ success: false, message: "Recovery service is temporarily unavailable. Your entered information has not been submitted. Please try again." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = getUserId(request);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const allowedStatuses = ["NEW", "ASSESSING", "ACTION_REQUIRED", "BANK_NOTIFIED", "EVIDENCE_COLLECTED", "COMPLAINT_READY", "REPORTED", "RECOVERY_IN_PROGRESS", "CLOSED"];
    if (typeof body.caseId !== "string" || !/^CG-\d{4}-[A-F0-9-]{8,36}$/i.test(body.caseId) || !allowedStatuses.includes(body.status) || typeof body.event !== "string") {
      return NextResponse.json({ success: false, message: "Invalid recovery case update." }, { status: 400 });
    }

    const event = body.event.trim().slice(0, 160);
    const update: Record<string, unknown> = {
      status: body.status,
      $push: { timeline: { event, date: new Date() } },
    };
    if (Array.isArray(body.evidence)) {
      update.evidence = body.evidence.slice(0, 50).map((item: Record<string, unknown>) => ({
        category: typeof item.category === "string" ? item.category.slice(0, 80) : "Other Document",
        name: typeof item.name === "string" ? item.name.slice(0, 255) : "Evidence file",
        type: typeof item.type === "string" ? item.type.slice(0, 120) : "",
        size: Number.isFinite(Number(item.size)) ? Math.max(0, Number(item.size)) : 0,
        addedAt: item.addedAt ? new Date(String(item.addedAt)) : new Date(),
        description: typeof item.description === "string" ? item.description.slice(0, 500) : "",
        status: "Metadata only; file not stored",
      }));
    }

    await connectDB();
    const updatedCase = await Recovery.findOneAndUpdate({ userId, caseId: body.caseId }, update, { new: true }).select("caseId status timeline evidence");
    if (!updatedCase) return NextResponse.json({ success: false, message: "Recovery case not found." }, { status: 404 });
    return NextResponse.json({ success: true, case: updatedCase });
  } catch (error) {
    console.error("Recovery API PATCH failed:", error);
    return NextResponse.json({ success: false, message: "Recovery service is temporarily unavailable." }, { status: 500 });
  }
}