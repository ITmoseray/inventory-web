import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PatientProfileClient from "./PatientProfileClient";

export default async function PatientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const patientId = resolvedParams.id;

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      sales: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!patient) {
    notFound();
  }

  return <PatientProfileClient patient={patient} />;
}
