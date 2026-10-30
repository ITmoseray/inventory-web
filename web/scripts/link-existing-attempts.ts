import { prisma } from "../src/lib/prisma";

async function linkExistingAttempts() {
  console.log("🔗 Linking existing attempts to ExamStudent records...");

  const students = await prisma.examStudent.findMany();
  const attempts = await prisma.examAttempt.findMany({
    include: { participant: true, result: true },
  });

  let linkedCount = 0;
  let scoreUpdatedCount = 0;

  for (const att of attempts) {
    let matchedStudent = null;

    // 1. Match by participant studentId
    if (att.participant?.studentId) {
      matchedStudent = students.find(
        (s) => s.studentId.trim().toUpperCase() === att.participant!.studentId!.trim().toUpperCase()
      );
    }

    // 2. Fallback match by participant email
    if (!matchedStudent && att.participant?.studentEmail) {
      matchedStudent = students.find(
        (s) => s.email && s.email.trim().toLowerCase() === att.participant!.studentEmail!.trim().toLowerCase()
      );
    }

    // 3. Fallback match by name
    if (!matchedStudent && att.participant?.studentName) {
      const pName = att.participant.studentName.trim().toLowerCase();
      matchedStudent = students.find(
        (s) => s.fullName.trim().toLowerCase() === pName
      );
    }

    const updates: any = {};

    if (matchedStudent && att.studentId !== matchedStudent.id) {
      updates.studentId = matchedStudent.id;
      console.log(`✅ Linking attempt ${att.id} (${att.participant.studentName}) -> Student "${matchedStudent.fullName}" (${matchedStudent.studentId})`);
      linkedCount++;
    }

    // Also copy scores from ExamResult to ExamAttempt if missing
    if (att.result && (att.scoreObtained === null || att.percentage === null)) {
      updates.scoreObtained = att.result.scoreObtained;
      updates.maxScore = att.result.maxScore;
      updates.percentage = att.result.percentage;
      updates.passed = att.result.passed;
      scoreUpdatedCount++;
      console.log(`📊 Copying result score to attempt ${att.id}: ${att.result.scoreObtained}/${att.result.maxScore} (${att.result.percentage}%)`);
    }

    if (Object.keys(updates).length > 0) {
      await prisma.examAttempt.update({
        where: { id: att.id },
        data: updates,
      });
    }
  }

  console.log(`\n🎉 DONE! Linked ${linkedCount} attempts and updated ${scoreUpdatedCount} attempt scores.`);
}

linkExistingAttempts()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
