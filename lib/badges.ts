interface BadgeUser {
  verificationCount?: number;
  resumeCount?: number;
  interviewCount?: number;
  careerDNACompleted?: boolean;
  readiness?: number;
}

export function calculateBadges(user: BadgeUser) {
  const badges: string[] = [];

  const verificationCount =
    Number(user.verificationCount || 0);

  const resumeCount =
    Number(user.resumeCount || 0);

  const interviewCount =
    Number(user.interviewCount || 0);

  // First recruitment verification
  if (verificationCount >= 1) {
    badges.push("CAREER_GUARDIAN");
  }

  // Resume improvement
  if (resumeCount >= 1) {
    badges.push("RESUME_READY");
  }

  // First interview
  if (interviewCount >= 1) {
    badges.push("INTERVIEW_STARTER");
  }

  // Five interviews
  if (interviewCount >= 5) {
    badges.push("INTERVIEW_WARRIOR");
  }

  if (user.careerDNACompleted) {
    badges.push("CAREER_DNA_BUILDER");
  }

  if (Number(user.readiness || 0) >= 80) {
    badges.push("CAREER_READY");
  }

  // Complete all core activities
  if (
    verificationCount >= 1 &&
    resumeCount >= 1 &&
    interviewCount >= 1
  ) {
    badges.push("CAREER_CLIMBER");
  }

  return badges;
}