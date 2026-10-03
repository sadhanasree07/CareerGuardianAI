import {
  ClipboardList,
  Dna,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

const steps = [
  {
    step: "01",
    icon: ClipboardList,
    title: "Upload Recruitment",
    description:
      "Upload any government notification, WhatsApp message, website, PDF or email.",
  },
  {
    step: "02",
    icon: Dna,
    title: "AI Investigation",
    description:
      "CareerGuardian AI extracts every recruitment detail using OCR and AI analysis.",
  },
  {
    step: "03",
    icon: BadgeCheck,
    title: "12-Layer Verification",
    description:
      "Government website, recruiter email, phone, salary, domain and scam indicators are verified.",
  },
  {
    step: "04",
    icon: TrendingUp,
    title: "AI Trust Report",
    description:
      "Receive a trust score, verdict, downloadable investigation report and AI recommendations.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-2xl text-center">

          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it Works
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Recruitment Investigation in 4 Simple Steps
          </h2>

          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            CareerGuardian AI investigates every recruitment before you apply,
            protecting students from fake jobs and internship scams.
          </p>

        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {steps.map((item) => (

            <div
              key={item.step}
              className="rounded-2xl border border-border bg-card p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >

              <span className="text-sm font-bold text-primary/40">
                {item.step}
              </span>

              <span className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">

                <item.icon className="h-6 w-6" />

              </span>

              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {item.title}
              </h3>

              <p className="mt-2 leading-relaxed text-muted-foreground">
                {item.description}
              </p>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}