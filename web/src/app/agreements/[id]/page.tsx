import { getStaffAgreementById } from "@/lib/actions/staff-agreements";
import { StaffAgreementSignClient, AgreementNotFound } from "./StaffAgreementSignClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Enterprise Staff Agreement & Digital Signature Portal",
  description: "Official staff onboarding, compliance declaration, and digital signature agreement."
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StaffAgreementPage({ params }: PageProps) {
  const { id } = await params;
  const agreement = await getStaffAgreementById(id);

  if (!agreement) {
    return <AgreementNotFound />;
  }

  return <StaffAgreementSignClient agreement={agreement} />;
}
