import { prisma } from "../src/lib/prisma";
import {
  getSuperAdminStudents,
  reactivateStudentExamSession,
  verifyStudentExaminationAccess,
  launchAuthorizedExamination,
} from "../src/lib/actions/student-examination";
import { getSuperAdminExamResults } from "../src/lib/actions/examination";

async function main() {
  console.log("=================================================");
  console.log("1. TESTING SUPER ADMIN STUDENT GRADES VISIBILITY");
  console.log("=================================================");

  // Mock super admin environment
  process.env.PROTECH_TEST_BYPASS = "true";

  const studentsRes = await getSuperAdminStudents();
  if (!studentsRes.success || !studentsRes.students) {
    throw new Error(`getSuperAdminStudents failed: ${studentsRes.error}`);
  }

  console.log(`Fetched ${studentsRes.students.length} students from Super Admin API.`);

  // Find Bobson
  const bobson = studentsRes.students.find((s) => s.studentId === "PTA-OA-QVUX7NQA");
  if (!bobson) throw new Error("Bobson Pascal Conteh not found!");

  console.log("\n[Bobson Pascal Conteh Record]:");
  console.log(`- Full Name: ${bobson.fullName}`);
  console.log(`- Student ID: ${bobson.studentId}`);
  console.log(`- Completed Exams: ${bobson.completedExamsCount}`);
  console.log(`- Latest Attempt:`, bobson.latestAttempt);

  if (bobson.latestAttempt?.score !== 49 || bobson.latestAttempt?.maxScore !== 50 || bobson.latestAttempt?.percentage !== 98 || !bobson.latestAttempt?.passed) {
    throw new Error(`Bobson score mismatch! Expected 49/50 (98%) passed: true, got: ${JSON.stringify(bobson.latestAttempt)}`);
  }
  console.log("✅ VERIFIED: Bobson's 49/50 (98%) grade is visible and complete!");

  // Find Mr Sellu
  const mrSellu = studentsRes.students.find((s) => s.studentId === "PTA-OA-SGMZZQ33");
  if (!mrSellu) throw new Error("Mr Sellu not found!");
  console.log("\n[Mr Sellu Record]:");
  console.log(`- Full Name: ${mrSellu.fullName}`);
  console.log(`- Student ID: ${mrSellu.studentId}`);
  console.log(`- Latest Attempt:`, mrSellu.latestAttempt);

  if (mrSellu.latestAttempt?.score !== 44 || mrSellu.latestAttempt?.maxScore !== 50 || mrSellu.latestAttempt?.percentage !== 88 || !mrSellu.latestAttempt?.passed) {
    throw new Error(`Mr Sellu score mismatch! Expected 44/50 (88%) passed: true, got: ${JSON.stringify(mrSellu.latestAttempt)}`);
  }
  console.log("✅ VERIFIED: Mr Sellu's 44/50 (88%) grade is visible and complete!");

  // Find a student with a terminated attempt (e.g. Fatorma Sellu)
  const studentWithTerminated = studentsRes.students.find((s) => s.hasTerminatedAttempt);
  if (!studentWithTerminated) throw new Error("No student with a terminated attempt found!");

  console.log("\n[Student with Terminated Session Record]:");
  console.log(`- Full Name: ${studentWithTerminated.fullName}`);
  console.log(`- Student ID: ${studentWithTerminated.studentId}`);
  console.log(`- Terminated Attempts: ${studentWithTerminated.terminatedAttemptsCount}`);
  console.log(`- Attempt Status: ${studentWithTerminated.terminatedAttempt?.status}`);
  console.log(`- Can Reactivate: ${studentWithTerminated.terminatedAttempt?.canReactivate}`);
  console.log(`- Termination Reason: ${studentWithTerminated.terminatedAttempt?.terminationReason}`);

  if (studentWithTerminated.terminatedAttempt?.status !== "TERMINATED" || !studentWithTerminated.terminatedAttempt?.canReactivate) {
    throw new Error(`Expected student to have a TERMINATED attempt with canReactivate: true!`);
  }
  console.log("✅ VERIFIED: Terminated attempt detected with canReactivate: true!");

  console.log("\n=================================================");
  console.log("2. TESTING SESSION REACTIVATION ACTION");
  console.log("=================================================");

  const targetAttemptId = studentWithTerminated.terminatedAttempt.id;
  const reactivateRes = await reactivateStudentExamSession({
    attemptId: targetAttemptId,
    additionalMinutes: 25,
    reason: "Candidate accidental browser exit / tab closure approved by Dr. Strange (Super Admin).",
    resetViolationCount: true,
  });

  console.log("Reactivation result:", reactivateRes);
  if (!reactivateRes.success) {
    throw new Error(`Reactivation failed: ${reactivateRes.error}`);
  }

  console.log(`- New Deadline: ${reactivateRes.newDeadline}`);
  console.log(`- Direct Resume URL: ${reactivateRes.resumeUrl}`);

  // Verify in database directly
  const updatedAttempt = await prisma.examAttempt.findUnique({
    where: { id: targetAttemptId },
    include: { result: true },
  });

  if (!updatedAttempt) throw new Error("Updated attempt not found in DB!");
  console.log("\n[DB State after Reactivation]:");
  console.log(`- Status: ${updatedAttempt.status} (Expected: IN_PROGRESS)`);
  console.log(`- TerminatedAt: ${updatedAttempt.terminatedAt} (Expected: null)`);
  console.log(`- TerminationReason: ${updatedAttempt.terminationReason} (Expected: null)`);
  console.log(`- ViolationCount: ${updatedAttempt.violationCount} (Expected: 0)`);
  console.log(`- RetakeAuthorized: ${updatedAttempt.retakeAuthorized} (Expected: true)`);
  console.log(`- Result: ${updatedAttempt.result ? "EXISTS (Bad!)" : "NULL (Good!)"}`);

  if (
    updatedAttempt.status !== "IN_PROGRESS" ||
    updatedAttempt.terminatedAt !== null ||
    updatedAttempt.terminationReason !== null ||
    updatedAttempt.violationCount !== 0 ||
    !updatedAttempt.retakeAuthorized ||
    updatedAttempt.result !== null
  ) {
    throw new Error("Attempt DB state does not match reactivation requirements!");
  }
  console.log("✅ VERIFIED: DB record state completely restored to active!");

  console.log("\n=================================================");
  console.log("3. TESTING CANDIDATE PORTAL RESUMPTION");
  console.log("=================================================");

  // Candidate verifies ID at portal
  const authVerify = await verifyStudentExaminationAccess(
    studentWithTerminated.fullName,
    studentWithTerminated.studentId
  );

  if (!authVerify.success || !authVerify.sessionToken) {
    throw new Error(`Portal verification failed: ${authVerify.error}`);
  }
  console.log(`Portal verified identity for ${studentWithTerminated.fullName}. Authorized exams: ${authVerify.authorizedExams?.length}`);

  // Candidate launches/resumes exam
  const affiliateExam = authVerify.authorizedExams?.find((e) => e.publicId === "EXAM-AFF-OCT2026");
  if (!affiliateExam) throw new Error("Affiliate exam not authorized for student!");

  const launchRes = await launchAuthorizedExamination(authVerify.sessionToken, affiliateExam.publicId);
  console.log("Launch examination response:", launchRes);

  if (!launchRes.success || !launchRes.resumed || launchRes.attemptId !== targetAttemptId) {
    throw new Error(`Launch failed or did not resume reactivated attempt! Got: ${JSON.stringify(launchRes)}`);
  }
  console.log("✅ VERIFIED: Candidate portal smoothly resumes the reactivated exam session without any lockout!");

  console.log("\n=================================================");
  console.log("4. TESTING SUBMISSIONS TAB RESULTS DATA");
  console.log("=================================================");

  const examResultsRes = await getSuperAdminExamResults(affiliateExam.examinationId);
  if (!examResultsRes.success || !examResultsRes.results) {
    throw new Error(`getSuperAdminExamResults failed: ${examResultsRes.error}`);
  }

  console.log(`Found ${examResultsRes.results.length} attempts in Affiliate Marketing exam.`);

  const bobsonRow = examResultsRes.results.find((r) => r.studentName.includes("Bobson"));
  console.log("Bobson in Submissions tab:", {
    studentName: bobsonRow?.studentName,
    status: bobsonRow?.status,
    score: `${bobsonRow?.scoreObtained}/${bobsonRow?.maxScore} (${bobsonRow?.percentage}%)`,
    passed: bobsonRow?.passed,
  });

  const maxxRow = examResultsRes.results.find((r) => r.id === targetAttemptId);
  console.log("Maxx in Submissions tab:", {
    studentName: maxxRow?.studentName,
    status: maxxRow?.status,
    canReactivate: maxxRow?.canReactivate,
  });

  console.log("\n=================================================");
  console.log("🎉 ALL REACTIVATION AND GRADES TESTS PASSED 100%!");
  console.log("=================================================");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("TEST FAILED:", e);
    process.exit(1);
  });
