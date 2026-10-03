import {
  ShieldCheck,
  ScanSearch,
  Dna,
  Radar,
  FileText,
  Bot,
} from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Recruitment Trust Engine",
    description:
      "Every recruiter, company, and job posting is verified against our global trust graph before it ever reaches you.",
  },
  {
    icon: ScanSearch,
    title: "AI Scam Detection",
    description:
      "Real-time models flag fraudulent offers, fake interviews, and phishing attempts so you never fall for a scam.",
  },
  {
    icon: Dna,
    title: "Career DNA",
    description:
      "A living profile of your skills, strengths, and ambitions that powers personalized guidance and matching.",
  },
  {
    icon: Radar,
    title: "Opportunity Radar",
    description:
      "Surface high-fit roles, internships, and gigs the moment they appear, ranked by your unique Career DNA.",
  },
  {
    icon: FileText,
    title: "Resume Intelligence",
    description:
      "Instant, recruiter-grade feedback that rewrites, scores, and tailors your resume for every application.",
  },
  {
    icon: Bot,
    title: "AI Mentor",
    description:
      "A 24/7 career coach that answers questions, preps you for interviews, and keeps your roadmap on track.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border bg-secondary/30 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Platform
          </span>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to grow safely
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Six intelligent systems working together to protect, guide, and accelerate your career.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
