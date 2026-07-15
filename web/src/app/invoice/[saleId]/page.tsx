import { getPublicInvoice } from "@/lib/actions/public-invoice";
import { notFound } from "next/navigation";
import InvoiceClient from "./InvoiceClient";

export default async function InvoicePage({ params }: { params: Promise<{ saleId: string }> }) {
  const { saleId } = await params;
  const sale = await getPublicInvoice(saleId);

  if (!sale) return notFound();

  return <InvoiceClient sale={sale} />;
}
