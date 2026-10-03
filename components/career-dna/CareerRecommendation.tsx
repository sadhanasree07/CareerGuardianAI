"use client";

import {
  BrainCircuit,
  Sparkles,
  Target,
  Download,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import jsPDF from "jspdf";

interface Props {
  recommendation: string;
  readiness: number;
  hiringProbability: number;
}

export default function CareerRecommendation({
  recommendation,
  readiness,
  hiringProbability,
}: Props) {
  const verdict =
    readiness >= 85
      ? "READY TO APPLY"
      : readiness >= 65
      ? "NEARLY READY"
      : "NEEDS IMPROVEMENT";

  const verdictColor =
    readiness >= 85
      ? "text-emerald-600"
      : readiness >= 65
      ? "text-amber-500"
      : "text-red-600";

  const cleanRecommendation = (text: string) => {
    if (!text) return "No personalized recommendation is available yet.";

    return text
      .replace(/\u00A0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\s+([,.!?;:])/g, "$1");
  };

  const finalRecommendation = cleanRecommendation(recommendation);

  function downloadReport() {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    const navy: [number, number, number] = [15, 35, 70];
    const blue: [number, number, number] = [37, 99, 235];
    const cyan: [number, number, number] = [6, 182, 212];
    const lightBlue: [number, number, number] = [239, 246, 255];
    const slate: [number, number, number] = [71, 85, 105];
    const lightSlate: [number, number, number] = [241, 245, 249];
    const green: [number, number, number] = [16, 185, 129];
    const amber: [number, number, number] = [245, 158, 11];
    const red: [number, number, number] = [239, 68, 68];
    const white: [number, number, number] = [255, 255, 255];

    const roundedBox = (x: number, y: number, width: number, height: number, fill: [number, number, number], radius = 4) => {
      pdf.setFillColor(...fill);
      pdf.roundedRect(x, y, width, height, radius, radius, "F");
    };

    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: [number, number, number] = lightSlate) => {
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.4);
      pdf.line(x1, y1, x2, y2);
    };

    const drawFooter = () => {
      const footerY = pageHeight - 13;
      drawLine(margin, footerY - 4, pageWidth - margin, footerY - 4);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...slate);
      pdf.text("CareerGuardian AI • Guardian Career DNA Assessment", margin, footerY);
      pdf.text("Protect • Verify • Grow • Succeed", pageWidth / 2, footerY + 5, { align: "center" });
      pdf.text("AI-powered career guidance", pageWidth - margin, footerY, { align: "right" });
    };

    pdf.setFillColor(...white);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.setFillColor(...blue);
    pdf.rect(0, 0, pageWidth, 5, "F");
    roundedBox(margin, 16, 17, 17, navy, 4);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...white);
    pdf.text("CG", margin + 8.5, 26.8, { align: "center" });
    pdf.setFontSize(18);
    pdf.setTextColor(...navy);
    pdf.text("CAREERGUARDIAN AI", margin + 23, 23);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...cyan);
    pdf.text("GUARDIAN CAREER DNA ASSESSMENT", margin + 23, 28.5);

    // Report label
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...slate);
    pdf.text("PERSONALIZED CAREER ANALYSIS", pageWidth - margin, 21, {
      align: "right",
    });

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Personalized Career DNA Assessment", pageWidth - margin, 26, {
      align: "right",
    });

    /*
     * Main title
     */

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(23);
    pdf.setTextColor(...navy);
    pdf.text("Career DNA Intelligence Report", margin, 55);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...slate);
    pdf.text(
      "A structured snapshot of your current career readiness and hiring signal.",
      margin,
      64
    );

    /*
     * Verdict card
     */

    const verdictY = 78;
    const cardGap = 5;
    const cardWidth = (contentWidth - cardGap * 2) / 3;
    const cardHeight = 40;

    // Verdict
    roundedBox(margin, verdictY, cardWidth, cardHeight, lightBlue, 5);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    pdf.text("CAREER VERDICT", margin + 7, verdictY + 10);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);

    if (readiness >= 85) {
      pdf.setTextColor(...green);
    } else if (readiness >= 65) {
      pdf.setTextColor(...amber);
    } else {
      pdf.setTextColor(...red);
    }

    pdf.text(verdict, margin + 7, verdictY + 25);

    // Readiness
    const readinessX = margin + cardWidth + cardGap;

    roundedBox(
      readinessX,
      verdictY,
      cardWidth,
      cardHeight,
      [248, 250, 252],
      5
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    pdf.text("JOB READINESS", readinessX + 7, verdictY + 10);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    pdf.setTextColor(...blue);
    pdf.text(`${readiness}%`, readinessX + 7, verdictY + 28);

    // Hiring probability
    const hiringX = readinessX + cardWidth + cardGap;

    roundedBox(
      hiringX,
      verdictY,
      cardWidth,
      cardHeight,
      [248, 250, 252],
      5
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    pdf.text("HIRING SIGNAL", hiringX + 7, verdictY + 10);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    pdf.setTextColor(...cyan);
    pdf.text(`${hiringProbability}%`, hiringX + 7, verdictY + 28);

    /*
     * Career readiness signal
     */

    const signalY = 135;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(...navy);
    pdf.text("Career Readiness Signal", margin, signalY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...slate);
    pdf.text(
      "Current readiness based on the available Career DNA assessment.",
      margin,
      signalY + 7
    );

    // Percentage
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(25);
    pdf.setTextColor(...blue);
    pdf.text(`${readiness}%`, margin, signalY + 29);

    // Progress background
    const progressX = margin + 40;
    const progressY = signalY + 19;
    const progressWidth = contentWidth - 40;
    const progressHeight = 7;

    pdf.setFillColor(226, 232, 240);
    pdf.roundedRect(
      progressX,
      progressY,
      progressWidth,
      progressHeight,
      3.5,
      3.5,
      "F"
    );

    // Progress foreground
    const filledWidth = Math.max(
      0,
      Math.min(progressWidth, (readiness / 100) * progressWidth)
    );

    pdf.setFillColor(...blue);

    if (filledWidth > 0) {
      pdf.roundedRect(
        progressX,
        progressY,
        filledWidth,
        progressHeight,
        3.5,
        3.5,
        "F"
      );
    }

    /*
     * Executive recommendation
     */

    const recommendationY = 180;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(...navy);
    pdf.text("Guardian AI Executive Recommendation", margin, recommendationY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(...slate);
    pdf.text(
      "Personalized guidance generated from your Career DNA.",
      margin,
      recommendationY + 7
    );

    /*
     * Recommendation box
     */

    const recBoxY = recommendationY + 17;
    const recBoxHeight = 64;

    roundedBox(
      margin,
      recBoxY,
      contentWidth,
      recBoxHeight,
      [248, 250, 252],
      6
    );

    // Accent bar
    pdf.setFillColor(...cyan);
    pdf.roundedRect(
      margin,
      recBoxY,
      3,
      recBoxHeight,
      1.5,
      1.5,
      "F"
    );

    // AI icon circle
    pdf.setFillColor(...lightBlue);
    pdf.circle(margin + 14, recBoxY + 14, 6, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(...blue);
    pdf.text("AI", margin + 14, recBoxY + 16.5, {
      align: "center",
    });

    // Recommendation heading
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...navy);
    pdf.text("PERSONALIZED GUIDANCE", margin + 25, recBoxY + 13);

    /*
     * IMPORTANT:
     * Keep the recommendation in a normal font.
     * Do NOT use letter spacing.
     */

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 41, 59);

    const recommendationLines = pdf.splitTextToSize(
      finalRecommendation,
      contentWidth - 35
    );

    const limitedRecommendation = recommendationLines.slice(0, 7);

    pdf.text(
      limitedRecommendation,
      margin + 25,
      recBoxY + 25,
      {
        maxWidth: contentWidth - 35,
        lineHeightFactor: 1.45,
      }
    );

    drawFooter();

    /*
     * ---------------------------------------------------------
     * PAGE 2 — CAREER METRICS
     * ---------------------------------------------------------
     */

    pdf.addPage();

    pdf.setFillColor(...white);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    pdf.setFillColor(...blue);
    pdf.rect(0, 0, pageWidth, 5, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(23);
    pdf.setTextColor(...navy);
    pdf.text("Career DNA Metrics", margin, 28);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(...slate);
    pdf.text(
      "A concise view of the signals generated from your profile.",
      margin,
      36
    );

    /*
     * Metric cards
     */

    const metricY = 50;
    const metricGap = 5;
    const metricWidth = (contentWidth - metricGap * 2) / 3;
    const metricHeight = 54;

    // Readiness card
    roundedBox(
      margin,
      metricY,
      metricWidth,
      metricHeight,
      lightBlue,
      6
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...navy);
    pdf.text("JOB READINESS", margin + 8, metricY + 12);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);
    pdf.setTextColor(...blue);
    pdf.text(`${readiness}%`, margin + 8, metricY + 36);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    pdf.text("Overall career preparation signal", margin + 8, metricY + 47);

    // Hiring card
    const secondCardX = margin + metricWidth + metricGap;

    roundedBox(
      secondCardX,
      metricY,
      metricWidth,
      metricHeight,
      [236, 254, 255],
      6
    );

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...navy);
    pdf.text("HIRING SIGNAL", secondCardX + 7, metricY + 12);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(30);
    pdf.setTextColor(...cyan);
    pdf.text(`${hiringProbability}%`, secondCardX + 7, metricY + 36);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...slate);
    pdf.text(
      "Profile-to-opportunity alignment signal",
      secondCardX + 7,
      metricY + 47
    );

    // Verdict card
    const verdictCardX = secondCardX + metricWidth + metricGap;
    const verdictRgb = readiness >= 85 ? green : readiness >= 65 ? amber : red;

    roundedBox(verdictCardX, metricY, metricWidth, metricHeight, [245, 247, 255], 6);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(...navy);
    pdf.text("CAREER VERDICT", verdictCardX + 7, metricY + 12);
    pdf.setFontSize(12);
    pdf.setTextColor(...verdictRgb);
    pdf.text(verdict, verdictCardX + 7, metricY + 31);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...slate);
    pdf.text("Current readiness state", verdictCardX + 7, metricY + 44);

    /*
     * Readiness scale
     */

    const scaleY = 125;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...navy);
    pdf.text("Readiness Interpretation", margin, scaleY);

    const scaleItems = [
      {
        label: "READY TO APPLY",
        description: "Strong preparation signal",
        min: 85,
        max: 100,
        color: green,
      },
      {
        label: "NEARLY READY",
        description: "Additional preparation recommended",
        min: 65,
        max: 84,
        color: amber,
      },
      {
        label: "NEEDS IMPROVEMENT",
        description: "Priority development areas identified",
        min: 0,
        max: 64,
        color: red,
      },
    ];

    scaleItems.forEach((item, index) => {
      const y = scaleY + 15 + index * 29;

      pdf.setFillColor(...item.color);
      pdf.circle(margin + 4, y + 2, 2.5, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...navy);
      pdf.text(item.label, margin + 12, y);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(...slate);
      pdf.text(item.description, margin + 12, y + 8);

      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...item.color);
      pdf.text(
        `${item.min}% – ${item.max}%`,
        pageWidth - margin,
        y,
        { align: "right" }
      );
    });

    /*
     * Recommendation summary
     */

    const summaryY = 215;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.setTextColor(...navy);
    pdf.text("Guardian AI Summary", margin, summaryY);

    roundedBox(
      margin,
      summaryY + 10,
      contentWidth,
      60,
      [248, 250, 252],
      5
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(30, 41, 59);

    const summaryLines = pdf.splitTextToSize(
      finalRecommendation,
      contentWidth - 18
    );

    pdf.text(summaryLines.slice(0, 8), margin + 9, summaryY + 23, {
      lineHeightFactor: 1.5,
    });

    drawFooter();

    /*
     * ---------------------------------------------------------
     * SAVE
     * ---------------------------------------------------------
     */

    pdf.save("CareerGuardian_Career_DNA_Report.pdf");
  }

  return (
    <section className="space-y-8">

      {/* AI Recommendation */}

      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-8 text-white shadow-2xl">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-white/20 p-4">
            <BrainCircuit className="h-8 w-8" />
          </div>

          <div>

            <h2 className="text-3xl font-bold">
              Guardian AI Recommendation
            </h2>

            <p className="text-blue-100">
              Personalized career guidance generated using your Career DNA.
            </p>

          </div>

        </div>

        <div className="mt-8 rounded-3xl bg-white/10 p-6">

          <div className="mb-4 flex items-center gap-3">

            <Sparkles className="text-yellow-300" />

            <h3 className="text-2xl font-bold">
              AI Advice
            </h3>

          </div>

          <p className="text-lg leading-8">
            {finalRecommendation}
          </p>

        </div>

      </div>

      {/* Final Verdict */}

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="flex items-center gap-4">

            <Target className="h-10 w-10 text-blue-600" />

            <div>

              <h3 className="text-2xl font-bold">
                Career Verdict
              </h3>

              <p className="text-slate-500">
                Based on Guardian AI analysis
              </p>

            </div>

          </div>

          <h1 className={`mt-8 text-5xl font-black ${verdictColor}`}>
            {verdict}
          </h1>

        </div>

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <h3 className="text-2xl font-bold">
            Career Summary
          </h3>

          <div className="mt-8 space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>Job Readiness</span>
              </div>

              <strong>{readiness}%</strong>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-600" />
                <span>Hiring Signal</span>
              </div>

              <strong>{hiringProbability}%</strong>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Assessment</span>
              </div>

              <strong className="text-emerald-600">
                Complete
              </strong>

            </div>

          </div>

        </div>

      </div>

      {/* Download */}

      <button
        onClick={downloadReport}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-500 py-5 text-lg font-bold text-white shadow-xl transition hover:scale-[1.02]"
      >

        <Download className="h-6 w-6" />

        Download Career DNA Report

      </button>

    </section>
  );
}