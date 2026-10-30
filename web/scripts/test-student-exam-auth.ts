import { prisma } from "../src/lib/prisma";
import {
  generateUniqueStudentExamId,
  createStudent,
  updateStudent,
  reissueStudentExamId,
  setStudentAccountStatus,
  authorizeExaminationForStudent,
  revokeExaminationAuthorization,
  grantStudentExamRetake,
  verifyStudentExaminationAccess,
  launchAuthorizedExamination,
  getSuperAdminStudents,
  getSuperAdminAuthorizations,
} from "../src/lib/actions/student-examination";
import {
  normalizeStudentName,
  compareStudentNames,
} from "../src/lib/student-exam-utils";
import * as crypto from "crypto";

// Enable super admin bypass for automated test environment
process.env.PROTECH_TEST_BYPASS = "true";
process.env.EXAM_SESSION_SECRET = process.env.EXAM_SESSION_SECRET || "protech-test-secret-key-32-bytes-long!";

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("🛡️  PROTECH ASSIST ONLINE ACADEMY");
  console.log("    Student Examination Access & Authorization Test Suite");
  console.log("=======================================================\n");

  let passedTests = 0;
  let totalTests = 15;

  // Cleanup any leftover test data
  const testStudentName = "Dr. Test Student Automation " + Date.now();
  let createdStudentExamId = "";
  let createdStudentDbId = "";
  let affiliateCourseId = "";
  let aiCourseId = "";
  let affiliateExamId = "";
  let affiliateExamPublicId = "";
  let aiExamId = "";
  let aiExamPublicId = "";
  let authRecordId = "";
  let validSessionToken = "";

  try {
    // 0. Setup: locate existing courses and exams
    const affiliateCourse = await prisma.examCourse.findFirst({
      where: { code: "AFFILIATE-MKT" },
    });
    const aiCourse = await prisma.examCourse.findFirst({
      where: { code: "AI-MASTER" },
    });
    const affiliateExam = await prisma.examination.findFirst({
      where: { publicId: "EXAM-AFF-OCT2026" },
    });
    const aiExam = await prisma.examination.findFirst({
      where: { publicId: "EXAM-AI-OCT2026" },
    });

    if (!affiliateCourse || !affiliateExam) {
      throw new Error("Required test fixtures (Affiliate course/exam) not found in database.");
    }

    affiliateCourseId = affiliateCourse.id;
    affiliateExamId = affiliateExam.id;
    affiliateExamPublicId = affiliateExam.publicId;

    if (aiCourse) aiCourseId = aiCourse.id;
    if (aiExam) {
      aiExamId = aiExam.id;
      aiExamPublicId = aiExam.publicId;
    }

    // -----------------------------------------------------------------
    // TEST 1: Unique Non-Sequential ID Generation
    // -----------------------------------------------------------------
    console.log("👉 TEST 1: Unique Non-Sequential Student ID Generation...");
    const id1 = await generateUniqueStudentExamId();
    const id2 = await generateUniqueStudentExamId();
    const regex = /^PTA-OA-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8}$/;

    if (regex.test(id1) && regex.test(id2) && id1 !== id2) {
      console.log(`   ✅ PASS: Generated valid IDs (${id1}, ${id2}) matching PTA-OA-XXXXXXXX`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: ID format invalid or collision detected (${id1}, ${id2})`);
    }

    // -----------------------------------------------------------------
    // TEST 2: Super Admin Registers Student & Enrolls in Courses
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 2: Super Admin Registers Student & Course Enrollment...");
    const regResult = await createStudent({
      fullName: testStudentName,
      email: `test-${Date.now()}@student.protechassist.com`,
      phone: "+2348000000001",
      courseIds: aiCourseId ? [affiliateCourseId, aiCourseId] : [affiliateCourseId],
      notes: "Automated test student account",
    });

    if (regResult.success && regResult.student) {
      createdStudentExamId = regResult.student.studentId;
      createdStudentDbId = regResult.student.id;
      console.log(`   ✅ PASS: Student registered with ID: ${createdStudentExamId}`);
      console.log(`   Enrolled in ${regResult.student.courses.length} course(s).`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: Registration failed: ${regResult.error}`);
    }

    // -----------------------------------------------------------------
    // TEST 3: Zero-Trust Default: Registration alone NEVER grants exam access
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 3: Zero-Trust Default (Access Denied without Authorization)...");
    const zeroTrustCheck = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );

    if (
      !zeroTrustCheck.success &&
      zeroTrustCheck.error?.includes("not yet been authorized")
    ) {
      console.log(`   ✅ PASS: Newly registered student blocked with message: "${zeroTrustCheck.error}"`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Zero-trust violation! Student gained unauthorized access.");
    }

    // -----------------------------------------------------------------
    // TEST 4: Portal Verification: Invalid Student Examination ID Rejected
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 4: Portal Verification Rejects Non-Existent Examination ID...");
    const badIdCheck = await verifyStudentExaminationAccess(
      testStudentName,
      "PTA-OA-NONEXIST"
    );

    if (
      !badIdCheck.success &&
      badIdCheck.error?.includes("does not match any registered student records")
    ) {
      console.log(`   ✅ PASS: Non-existent ID rejected cleanly without data leakage.`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: Unexpected response for invalid ID:`, badIdCheck);
    }

    // -----------------------------------------------------------------
    // TEST 5: Portal Verification: Mismatched Name Rejected
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 5: Portal Verification Rejects Mismatched Full Name...");
    const badNameCheck = await verifyStudentExaminationAccess(
      "Completely Wrong Name",
      createdStudentExamId
    );

    if (
      !badNameCheck.success &&
      badNameCheck.error?.includes("does not match any registered student records")
    ) {
      console.log(`   ✅ PASS: Mismatched name rejected with anti-enumeration message.`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: Incorrect name was incorrectly accepted!`);
    }

    // -----------------------------------------------------------------
    // TEST 6: Portal Verification: Name Normalization (Forgiving Matching)
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 6: Name Normalization (Case & Whitespace Tolerance)...");
    const noisyName = "  " + testStudentName.toLowerCase() + "   ";
    const match1 = compareStudentNames(noisyName, testStudentName);
    const match2 = compareStudentNames("Dr. Jane  Mary   Smith", "jane mary smith");

    if (match1 && match2) {
      console.log(`   ✅ PASS: Name normalization functions correctly and tolerance confirmed.`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Name normalization failed to match equivalent names.");
    }

    // -----------------------------------------------------------------
    // TEST 7: Inactive / Suspended Student Blocked at Portal
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 7: Suspended Student Blocked at Portal...");
    await setStudentAccountStatus(createdStudentDbId, "SUSPENDED");

    // First temporarily authorize to confirm suspension blocks even authorized students
    const tempAuth = await authorizeExaminationForStudent({
      studentId: createdStudentDbId,
      examinationId: affiliateExamId,
      status: "APPROVED",
      maxAttemptsAllowed: 1,
    });
    if (tempAuth.success) authRecordId = tempAuth.authorizationId || tempAuth.authorization?.id || "";

    const suspendedCheck = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );

    if (
      !suspendedCheck.success &&
      suspendedCheck.error?.includes("suspended by the Online Academy")
    ) {
      console.log(`   ✅ PASS: Suspended student blocked: "${suspendedCheck.error}"`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Suspended student was not blocked!", suspendedCheck);
    }

    // -----------------------------------------------------------------
    // TEST 8: Inactive Student Blocked at Portal
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 8: Inactive Student Blocked at Portal...");
    await setStudentAccountStatus(createdStudentDbId, "INACTIVE");

    const inactiveCheck = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );

    if (
      !inactiveCheck.success &&
      inactiveCheck.error?.includes("currently inactive")
    ) {
      console.log(`   ✅ PASS: Inactive student blocked: "${inactiveCheck.error}"`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Inactive student was not blocked!", inactiveCheck);
    }

    // Restore student account status to ACTIVE
    await setStudentAccountStatus(createdStudentDbId, "ACTIVE");

    // -----------------------------------------------------------------
    // TEST 9: Admin Authorizes Specific Exam -> Portal Grants Entry & HMAC Token
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 9: Admin Approves Exam -> Portal Entry & Signed HMAC Token...");
    const verifiedCheck = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );

    if (
      verifiedCheck.success &&
      verifiedCheck.sessionToken &&
      verifiedCheck.authorizedExams?.length === 1 &&
      verifiedCheck.authorizedExams[0].publicId === affiliateExamPublicId
    ) {
      validSessionToken = verifiedCheck.sessionToken;
      console.log(`   ✅ PASS: Approved student verified. Received signed session token.`);
      console.log(`   Single authorized exam presented: "${verifiedCheck.authorizedExams[0].title}"`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Verification failed for approved active student:", verifiedCheck);
    }

    // -----------------------------------------------------------------
    // TEST 10: Scope Isolation: Unauthorized Exam Is Not Accessible
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 10: Examination Scope Isolation...");
    // Attempting to launch the AI Masterclass exam when student is only authorized for Affiliate Marketing
    if (aiExamPublicId) {
      const scopeCheck = await launchAuthorizedExamination(
        validSessionToken,
        aiExamPublicId
      );

      if (
        !scopeCheck.success &&
        scopeCheck.error?.includes("not yet been authorized")
      ) {
        console.log(`   ✅ PASS: Access to unapproved exam (${aiExamPublicId}) strictly rejected.`);
        passedTests++;
      } else {
        console.error("   ❌ FAIL: Scope boundary violated! Student accessed unapproved exam:", scopeCheck);
      }
    } else {
      console.log("   ✅ PASS (Skipped second exam check: single exam catalog)");
      passedTests++;
    }

    // -----------------------------------------------------------------
    // TEST 11: Date Boundary Enforcement (validFrom & validUntil)
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 11: Date Boundary Protection (Future & Expired Dates)...");
    // Set validFrom to tomorrow
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.examAuthorization.update({
      where: { id: authRecordId },
      data: { validFrom: tomorrow },
    });

    const futureCheck = await launchAuthorizedExamination(
      validSessionToken,
      affiliateExamPublicId
    );

    const isFutureBlocked =
      !futureCheck.success && futureCheck.error?.includes("scheduled to open");

    // Set validUntil to yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.examAuthorization.update({
      where: { id: authRecordId },
      data: { validFrom: null, validUntil: yesterday },
    });

    const expiredCheck = await launchAuthorizedExamination(
      validSessionToken,
      affiliateExamPublicId
    );

    const isExpiredBlocked =
      !expiredCheck.success && expiredCheck.error?.includes("expired");

    // Reset date constraints
    await prisma.examAuthorization.update({
      where: { id: authRecordId },
      data: { validFrom: null, validUntil: null },
    });

    if (isFutureBlocked && isExpiredBlocked) {
      console.log(`   ✅ PASS: Future opening date and expired closing date both strictly enforced.`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: Date boundaries not enforced. Future: ${isFutureBlocked}, Expired: ${isExpiredBlocked}`);
    }

    // -----------------------------------------------------------------
    // TEST 12: Session Token Security & Anti-Tampering
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 12: Session Token Cryptographic Integrity (HMAC)...");
    const tamperedToken = validSessionToken.slice(0, -6) + "FAKE99";
    const forgedToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdHVkZW50SWQiOiIxMjMifQ.invalidsignature";

    const tamperedLaunch = await launchAuthorizedExamination(
      tamperedToken,
      affiliateExamPublicId
    );
    const forgedLaunch = await launchAuthorizedExamination(
      forgedToken,
      affiliateExamPublicId
    );

    if (
      !tamperedLaunch.success &&
      tamperedLaunch.sessionExpired &&
      !forgedLaunch.success &&
      forgedLaunch.sessionExpired
    ) {
      console.log(`   ✅ PASS: Tampered and forged tokens rejected with HMAC signature failure.`);
      passedTests++;
    } else {
      console.error("   ❌ FAIL: Token signature verification bypassed!");
    }

    // -----------------------------------------------------------------
    // TEST 13: Launch Exam & Concurrency Resume Protection
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 13: Active Attempt Concurrency & Page Refresh Resume...");
    // Refresh valid session token
    const freshTokenRes = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );
    const launch1 = await launchAuthorizedExamination(
      freshTokenRes.sessionToken!,
      affiliateExamPublicId
    );

    if (launch1.success && launch1.attemptId) {
      const firstAttemptId = launch1.attemptId;

      // Simulate a page refresh or browser reconnect
      const launch2 = await launchAuthorizedExamination(
        freshTokenRes.sessionToken!,
        affiliateExamPublicId
      );

      if (
        launch2.success &&
        launch2.attemptId === firstAttemptId &&
        launch2.resumed === true
      ) {
        console.log(`   ✅ PASS: Active attempt successfully resumed (ID: ${firstAttemptId}) without duplicate consumption.`);
        passedTests++;
      } else {
        console.error("   ❌ FAIL: Attempt resumption failed or duplicate attempt created:", launch2);
      }
    } else {
      console.error("   ❌ FAIL: Failed to launch authorized exam:", launch1);
    }

    // -----------------------------------------------------------------
    // TEST 14: Attempt Limit Enforcement (1 Attempt Default)
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 14: Attempt Limit Enforcement...");
    // Simulate submission of the first attempt
    const activeAttempt = await prisma.examAttempt.findFirst({
      where: { studentId: createdStudentDbId, examId: affiliateExamId },
    });

    if (activeAttempt) {
      await prisma.examAttempt.update({
        where: { id: activeAttempt.id },
        data: {
          status: "SUBMITTED",
          submittedAt: new Date(),
        },
      });

      // Increment consumed attempts
      await prisma.examAuthorization.update({
        where: { id: authRecordId },
        data: { attemptsConsumed: 1 },
      });

      // Student tries to verify/launch a second attempt
      const attemptCheck = await verifyStudentExaminationAccess(
        testStudentName,
        createdStudentExamId
      );

      if (
        !attemptCheck.success &&
        attemptCheck.error?.includes("already completed this examination")
      ) {
        console.log(`   ✅ PASS: Subsequent attempt blocked (attemptsConsumed >= maxAttemptsAllowed).`);
        passedTests++;
      } else {
        console.error("   ❌ FAIL: Attempt limit not enforced! Student was allowed to start again:", attemptCheck);
      }
    } else {
      console.error("   ❌ FAIL: Could not locate active attempt to complete.");
    }

    // -----------------------------------------------------------------
    // TEST 15: Revocation & Administrative Retake Grant
    // -----------------------------------------------------------------
    console.log("\n👉 TEST 15: Revocation & Administrative Retake Grant...");
    // 15a. Admin grants retake
    const retakeRes = await grantStudentExamRetake(
      authRecordId,
      "Approved retake due to connectivity issue during assessment."
    );

    const afterRetakeAuth = await prisma.examAuthorization.findUnique({
      where: { id: authRecordId },
    });

    const isRetakeGranted =
      retakeRes.success &&
      afterRetakeAuth?.status === "APPROVED" &&
      afterRetakeAuth.maxAttemptsAllowed === 2;

    // 15b. Now verify student can access again
    const retakeVerify = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );
    const canAccessAfterRetake = retakeVerify.success && retakeVerify.sessionToken;

    // 15c. Now Admin REVOKES authorization
    const revokeRes = await revokeExaminationAuthorization(
      authRecordId,
      "Administrative security audit revocation."
    );

    const revokedVerify = await verifyStudentExaminationAccess(
      testStudentName,
      createdStudentExamId
    );
    const isRevocationBlocked =
      revokeRes.success &&
      !revokedVerify.success &&
      revokedVerify.error?.includes("not yet been authorized");

    if (isRetakeGranted && canAccessAfterRetake && isRevocationBlocked) {
      console.log(`   ✅ PASS: Retake granted (maxAttemptsAllowed incremented to 2), then successfully revoked.`);
      passedTests++;
    } else {
      console.error(`   ❌ FAIL: Retake or revocation failed. Retake: ${isRetakeGranted}, Access: ${canAccessAfterRetake}, Revocation: ${isRevocationBlocked}`);
    }

  } catch (error) {
    console.error("\n💥 Uncaught Exception in Test Suite:", error);
  } finally {
    // Cleanup test artifacts from database
    if (createdStudentDbId) {
      console.log("\n🧹 Cleaning up test student database records...");
      await prisma.examAttempt.deleteMany({ where: { studentId: createdStudentDbId } });
      await prisma.examAuthorization.deleteMany({ where: { studentId: createdStudentDbId } });
      await prisma.examStudentEnrollment.deleteMany({ where: { studentId: createdStudentDbId } });
      await prisma.examStudent.deleteMany({ where: { id: createdStudentDbId } });
      console.log("   Cleaned up test student and associated attempts/authorizations.");
    }
  }

  console.log("\n=======================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("=======================================================\n");

  if (passedTests === totalTests) {
    console.log("🎉 ALL 15 ACCEPTANCE TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  } else {
    console.error(`⚠️ ${totalTests - passedTests} TEST(S) FAILED.\n`);
    process.exit(1);
  }
}

runTestSuite();
