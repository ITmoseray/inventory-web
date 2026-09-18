import { PublicStoreCreatorClient } from "@/components/store-builder/PublicStoreCreatorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your AI Online Store in 30 Seconds | ProTech AI Store Builder",
  description: "Design and launch your professional e-commerce store with AI. 100% Free, zero shop account or inventory setup required.",
};

export const dynamic = "force-dynamic";

export default function CreateStorePage() {
  return <PublicStoreCreatorClient />;
}
