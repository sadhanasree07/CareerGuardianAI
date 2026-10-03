import assert from "node:assert/strict";
import test from "node:test";
import { analyzePayGuard, toPaymentFraudDetection } from "./payguard.ts";

test("extracts UPI payee, amount, currency, and reference without treating QR presence alone as fraud", () => {
  const result = analyzePayGuard({
    company: "Indian Railways",
    rawText: "upi://pay?pa=railwayfees123%40paytm&pn=Ramesh%20Kumar&am=2500&cu=INR&tr=REF-2026-01",
    decodedQrPayloads: ["upi://pay?pa=railwayfees123%40paytm&pn=Ramesh%20Kumar&am=2500&cu=INR&tr=REF-2026-01"],
  });
  const detection = toPaymentFraudDetection(result);

  assert.equal(result.qr.detected, true);
  assert.equal(result.qrEvidence.upiId, "railwayfees123@paytm");
  assert.equal(result.qrEvidence.payeeName, "Ramesh Kumar");
  assert.equal(result.qrEvidence.amount, "2500");
  assert.equal(result.qrEvidence.currency, "INR");
  assert.equal(result.qrEvidence.transactionReference, "REF-2026-01");
  assert.equal(detection.paymentRequested, false);
  assert.equal(detection.verdict, "SAFE");
});

test("preserves the detected-but-undecodable QR state without inferring payment fraud", () => {
  const result = analyzePayGuard({ company: "Example Company", qrScanStatus: "QR_DETECTED_BUT_NOT_DECODED" });
  assert.equal(result.qr.detected, true);
  assert.equal(result.qr.status, "QR_DETECTED_BUT_NOT_DECODED");
  assert.equal(result.severity, "LOW");
});