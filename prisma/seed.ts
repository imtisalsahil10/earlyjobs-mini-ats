import "dotenv/config";
import path from "node:path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const rawUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? "file:dev.db";
const adapter = new PrismaLibSql({
  url: rawUrl.startsWith("file:")
    ? `file:${path.resolve(process.cwd(), rawUrl.slice("file:".length))}`
    : rawUrl,
  authToken: process.env.TURSO_DATABASE_URL ? process.env.TURSO_AUTH_TOKEN : undefined,
});
const prisma = new PrismaClient({ adapter });

const PIPELINE = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED"] as const;

const JOBS = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Bengaluru, IN",
    minSalary: 2800000,
    maxSalary: 4200000,
    description:
      "Own the component architecture behind our candidate-facing product surfaces and mentor two mid-level engineers.",
  },
  {
    title: "Backend Engineer (Platform)",
    department: "Engineering",
    location: "Remote, IN",
    minSalary: 2400000,
    maxSalary: 3600000,
    description:
      "Design the ingestion and matching services that power resume parsing at scale.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Bengaluru, IN",
    minSalary: 1800000,
    maxSalary: 2800000,
    description: "Lead end-to-end design for the recruiter workspace.",
  },
  {
    title: "Technical Recruiter",
    department: "People",
    location: "Hyderabad, IN",
    minSalary: 900000,
    maxSalary: 1500000,
    description: "Run full-cycle hiring for engineering requisitions.",
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote, IN",
    minSalary: 1400000,
    maxSalary: 2200000,
    description: "Build the reporting layer for hiring funnel health.",
  },
  {
    title: "Customer Success Manager",
    department: "Revenue",
    location: "Mumbai, IN",
    minSalary: 1200000,
    maxSalary: 1900000,
    description: "Own onboarding and retention for our top 40 accounts.",
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Pune, IN",
    status: "ON_HOLD",
    minSalary: 2000000,
    maxSalary: 3200000,
    description: "Harden our deployment pipeline and own observability.",
  },
  {
    title: "Engineering Manager",
    department: "Engineering",
    location: "Bengaluru, IN",
    status: "CLOSED",
    minSalary: 4000000,
    maxSalary: 5500000,
    description: "Lead the platform pod of eight engineers.",
  },
];

const SOURCES = [
  "Careers Page",
  "LinkedIn",
  "Referral",
  "Naukri",
  "Agency",
  "Campus Drive",
];

const SKILL_POOL: Record<string, string[]> = {
  Engineering: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "GraphQL",
    "Docker",
    "Kubernetes",
    "AWS",
    "Go",
    "Python",
    "System Design",
  ],
  Design: [
    "Figma",
    "Design Systems",
    "User Research",
    "Prototyping",
    "Accessibility",
    "Motion Design",
  ],
  People: [
    "Sourcing",
    "Boolean Search",
    "Stakeholder Management",
    "Greenhouse",
    "Employer Branding",
  ],
  Analytics: ["SQL", "dbt", "Python", "Looker", "Experimentation", "Tableau"],
  Revenue: ["Onboarding", "Salesforce", "Churn Analysis", "QBRs", "Upselling"],
};

const TITLE_POOL: Record<string, string[]> = {
  Engineering: [
    "Software Engineer II",
    "Senior Software Engineer",
    "Full Stack Developer",
    "Platform Engineer",
    "Staff Engineer",
  ],
  Design: ["Product Designer", "Senior UX Designer", "UI Designer"],
  People: ["Recruiter", "Talent Partner", "Sourcing Specialist"],
  Analytics: ["Data Analyst", "Senior Analyst", "Analytics Engineer"],
  Revenue: ["Account Manager", "Customer Success Lead", "CSM"],
};

const FIRST_NAMES = [
  "Aarav", "Diya", "Rohan", "Ananya", "Vikram", "Meera", "Arjun", "Kavya",
  "Siddharth", "Ishita", "Karan", "Nisha", "Aditya", "Priya", "Rahul", "Sneha",
  "Manish", "Tanvi", "Varun", "Pooja", "Nikhil", "Riya", "Akash", "Shreya",
  "Harsh", "Divya", "Imran", "Fatima", "Joel", "Neha", "Sameer", "Aisha",
  "Dev", "Lakshmi", "Yash", "Ritika", "Kabir", "Swara", "Omar", "Tara",
  "Ved", "Anjali", "Raj", "Simran", "Nitin", "Payal", "Zara", "Vivek",
  "Gaurav", "Maya", "Abhinav", "Charu", "Dhruv", "Esha", "Farhan", "Gita",
  "Hari", "Indira", "Jatin", "Komal", "Laila", "Mohit",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Singh", "Gupta",
  "Mehta", "Joshi", "Rao", "Kulkarni", "Chatterjee", "Banerjee", "Desai",
  "Kapoor", "Malhotra", "Bose", "Pillai", "Khan", "Dutta", "Ghosh", "Shetty",
  "Bhat", "Agarwal", "Saxena", "Chauhan", "Menon", "Thakur", "Ahuja",
];

const CITIES = [
  "Bengaluru, IN", "Hyderabad, IN", "Pune, IN", "Mumbai, IN", "Delhi, IN",
  "Chennai, IN", "Remote, IN", "Kolkata, IN", "Ahmedabad, IN", "Jaipur, IN",
];

const NOTE_TEMPLATES = [
  "Strong portfolio, moved quickly through the screen. Communicates clearly.",
  "Good depth on system design but light on testing practices.",
  "Salary expectations are above band — flagged for the hiring manager.",
  "Serving a 60-day notice period; factor into the start date.",
  "Referred internally; the referrer vouched for their ownership mindset.",
  "Take-home submission was clean and well documented.",
  "Panel was split on the problem-solving round. Scheduling a tiebreaker.",
  "Strong culture-add. Asked thoughtful questions about the roadmap.",
  "Withdrew interest after accepting a competing offer.",
  "Great fundamentals, needs ramp-up time on our stack.",
];

/** Deterministic PRNG so repeated seeds produce an identical demo dataset. */
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20251018);

function pick<T>(items: T[]): T {
  return items[Math.floor(random() * items.length)];
}

function pickMany<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    out.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }
  return out;
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

const HOUR_MS = 3_600_000;

/** Offsets back from now, jittered within a working day and never into the future. */
function daysAgo(days: number) {
  const now = Date.now();
  const jittered =
    now - days * 24 * HOUR_MS - randomInt(0, 9) * HOUR_MS - randomInt(0, 59) * 60_000;
  return new Date(Math.min(jittered, now - 5 * 60_000));
}

/**
 * Picks a stage using funnel-shaped weights so the dashboard shows realistic
 * drop-off rather than an even spread.
 */
function weightedStage(): (typeof PIPELINE)[number] | "REJECTED" {
  const roll = random();
  if (roll < 0.26) return "APPLIED";
  if (roll < 0.44) return "SCREENING";
  if (roll < 0.58) return "INTERVIEW";
  if (roll < 0.66) return "OFFER";
  if (roll < 0.78) return "HIRED";
  return "REJECTED";
}

async function main() {
  console.log("Clearing existing data…");
  await prisma.note.deleteMany();
  await prisma.stageEvent.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.job.deleteMany();

  console.log("Creating jobs…");
  const jobs = [];
  for (const job of JOBS) {
    jobs.push(
      await prisma.job.create({
        data: {
          ...job,
          status: job.status ?? "OPEN",
          createdAt: daysAgo(randomInt(45, 120)),
        },
      }),
    );
  }

  console.log("Creating candidates…");
  const usedEmails = new Set<string>();
  let candidateCount = 0;

  for (let i = 0; i < 68; i += 1) {
    const job = pick(jobs);
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const name = `${first} ${last}`;

    let email = `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com";
    if (usedEmails.has(`${email}:${job.id}`)) {
      email = email.replace("@", `${randomInt(10, 99)}@`);
    }
    if (usedEmails.has(`${email}:${job.id}`)) continue;
    usedEmails.add(`${email}:${job.id}`);

    const finalStage = weightedStage();
    const appliedDaysAgo = randomInt(2, 85);
    const appliedAt = daysAgo(appliedDaysAgo);

    // Rejections can happen at any depth, so pick where they dropped out.
    const rejectedAfterIndex =
      finalStage === "REJECTED" ? randomInt(0, 3) : PIPELINE.indexOf(finalStage);

    const path = PIPELINE.slice(0, rejectedAfterIndex + 1);
    const journey: { stage: string; at: Date }[] = [];
    let cursor = appliedDaysAgo;

    path.forEach((stage, index) => {
      if (index === 0) {
        journey.push({ stage, at: appliedAt });
        return;
      }
      cursor = Math.max(0, cursor - randomInt(3, 12));
      journey.push({ stage, at: daysAgo(cursor) });
    });

    if (finalStage === "REJECTED") {
      cursor = Math.max(0, cursor - randomInt(1, 8));
      journey.push({ stage: "REJECTED", at: daysAgo(cursor) });
    }

    const currentStage = journey[journey.length - 1].stage;
    const isClosed = currentStage === "HIRED" || currentStage === "REJECTED";
    const skills = pickMany(SKILL_POOL[job.department] ?? SKILL_POOL.Engineering, randomInt(3, 6));

    const candidate = await prisma.candidate.create({
      data: {
        name,
        email,
        phone: `+91 ${randomInt(70000, 99999)}${randomInt(10000, 99999)}`,
        location: pick(CITIES),
        title: pick(TITLE_POOL[job.department] ?? TITLE_POOL.Engineering),
        skills: skills.join(", "),
        source: pick(SOURCES),
        stage: currentStage,
        rating: currentStage === "APPLIED" && random() < 0.5 ? 0 : randomInt(2, 5),
        avatarSeed: `${first}${last}`,
        linkedinUrl: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}`,
        resumeUrl: `https://example.com/resumes/${first.toLowerCase()}-${last.toLowerCase()}.pdf`,
        appliedAt,
        closedAt: isClosed ? journey[journey.length - 1].at : null,
        createdAt: appliedAt,
        jobId: job.id,
        events: {
          create: journey.map((step, index) => ({
            fromStage: index === 0 ? null : journey[index - 1].stage,
            toStage: step.stage,
            createdAt: step.at,
          })),
        },
      },
    });

    const noteCount = journey.length > 2 ? randomInt(1, 3) : randomInt(0, 1);
    for (const body of pickMany(NOTE_TEMPLATES, noteCount)) {
      await prisma.note.create({
        data: {
          body,
          author: pick(["Priya Nair", "Imtisal Sahil", "Rohan Verma"]),
          candidateId: candidate.id,
          createdAt: daysAgo(randomInt(1, Math.max(2, appliedDaysAgo))),
        },
      });
    }

    candidateCount += 1;
  }

  const stageCounts = await prisma.candidate.groupBy({
    by: ["stage"],
    _count: { _all: true },
  });

  console.log(`\nSeeded ${jobs.length} jobs and ${candidateCount} candidates.`);
  for (const row of stageCounts) {
    console.log(`  ${row.stage.padEnd(10)} ${row._count._all}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
