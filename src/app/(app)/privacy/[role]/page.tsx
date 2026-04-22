import { notFound } from "next/navigation";
import LegalDocumentPage from "@/components/legal/LegalDocumentPage";
import { LEGAL_DOCS, normalizeLegalRole } from "@/lib/legal";

export default async function PrivacyRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleParam } = await params;
  const role =
    roleParam === "brand"
      ? "BRAND"
      : roleParam === "creator"
      ? "CREATOR"
      : normalizeLegalRole(roleParam);

  if (!role) {
    notFound();
  }

  return (
    <LegalDocumentPage
      role={role}
      type="privacy"
      document={LEGAL_DOCS[role].privacy}
    />
  );
}