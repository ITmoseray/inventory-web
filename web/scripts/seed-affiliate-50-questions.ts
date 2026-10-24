import { prisma } from "../src/lib/prisma";
import { AFFILIATE_50_QUESTIONS } from "../src/lib/data/affiliate-exam-questions";

async function run() {
  console.log("🚀 Starting seeding of 50 Affiliate Marketing Objective Examination questions...");

  // 1. Ensure course exists
  let course = await prisma.examCourse.findUnique({
    where: { code: "AFFILIATE-MKT" },
  });

  if (!course) {
    course = await prisma.examCourse.create({
      data: {
        title: "Affiliate Marketing Course",
        code: "AFFILIATE-MKT",
        description: "Comprehensive professional practical training in digital customer acquisition, affiliate funnel strategy, commission models, and campaign performance optimization.",
        badge: "Academy Core Programme",
        icon: "Megaphone",
        isActive: true,
      },
    });
    console.log("✅ Created course:", course.title);
  } else {
    console.log("ℹ️ Found existing course:", course.title);
  }

  // 2. Find or create the Examination
  let exam = await prisma.examination.findFirst({
    where: {
      courseId: course.id,
      publicId: "EXAM-AFF-OCT2026",
    },
  });

  const instructions = [
    "1. You have 60 minutes to complete the examination.",
    "2. The pass mark is 80%, equivalent to 40 out of 50 marks.",
    "3. Each question carries 1 mark.",
    "4. You may navigate between questions and bookmark items for review.",
    "5. Click Submit Examination before the timer runs out. When the time expires, your answers should be submitted automatically.",
    "6. Select only one answer for each question.",
    "7. Each correct answer earns 1 mark. Incorrect or unanswered questions earn 0 marks.",
  ].join("\n");

  const examData = {
    title: "Affiliate Marketing — Objective Examination",
    description: "ProTech Assist Online Academy: Beginner Level Affiliate Marketing Objective Examination testing foundational knowledge across core principles, ethics, niche selection, performance tracking, calculations, and content strategy.",
    instructions,
    durationMinutes: 60,
    passMarkPercentage: 80.0,
    maxAttempts: 2,
    status: "published" as const,
    resultReleaseMode: "immediate" as const,
    allowAnswerReview: true,
    accessMode: "open_verified" as const,
    allowNavigation: true,
    allowBookmarks: true,
    allowChangeAnswer: true,
    allowUnansweredSubmission: true,
  };

  if (!exam) {
    exam = await prisma.examination.create({
      data: {
        publicId: "EXAM-AFF-OCT2026",
        courseId: course.id,
        ...examData,
      },
    });
    console.log("✅ Created examination:", exam.title, `(${exam.publicId})`);
  } else {
    exam = await prisma.examination.update({
      where: { id: exam.id },
      data: examData,
    });
    console.log("🔄 Updated examination settings:", exam.title, `(${exam.publicId})`);
  }

  // 3. Clear old questions to replace with exact 50 questions
  console.log(`🧹 Removing existing questions for exam ${exam.id}...`);
  await prisma.examOption.deleteMany({
    where: { question: { examId: exam.id } },
  });
  await prisma.examQuestion.deleteMany({
    where: { examId: exam.id },
  });

  // 4. Insert all 50 questions with options
  console.log(`📝 Inserting ${AFFILIATE_50_QUESTIONS.length} validated objective questions...`);
  let count = 0;
  for (const q of AFFILIATE_50_QUESTIONS) {
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        orderIndex: q.orderIndex,
        category: q.category,
        questionText: q.questionText,
        marks: q.marks,
        questionType: q.questionType,
        explanation: q.explanation,
        isActive: true,
        options: {
          create: q.options.map((opt, idx) => ({
            label: opt.label,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: idx,
          })),
        },
      },
    });
    count++;
  }

  console.log(`🎉 SUCCESS: Seeded all ${count} questions for "${exam.title}"!`);
  console.log(`🔗 Public Access Link: /examinations/${exam.publicId}`);
}

run()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
