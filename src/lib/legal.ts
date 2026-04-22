export type LegalRole = "BRAND" | "CREATOR";
export type LegalDocType = "terms" | "privacy" | "agb";

export type LegalSection = {
  heading: string;
  body: string[];
};

export type LegalDocument = {
  title: string;
  subtitle: string;
  version: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const LEGAL_VERSIONS = {
  BRAND: {
    termsVersion: "brand-terms-v1",
    privacyVersion: "brand-privacy-v1",
    agbVersion: "brand-agb-v1",
  },
  CREATOR: {
    termsVersion: "creator-terms-v1",
    privacyVersion: "creator-privacy-v1",
    agbVersion: "creator-agb-v1",
  },
} as const;

export const LEGAL_DOCS: Record<
  LegalRole,
  {
    terms: LegalDocument;
    privacy: LegalDocument;
    agb: LegalDocument;
  }
> = {
  BRAND: {
    terms: {
      title: "Terms of Service for Brands",
      subtitle:
        "These terms apply to all brands and business clients using the Primely Content platform.",
      version: LEGAL_VERSIONS.BRAND.termsVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Scope",
          body: [
            "These Terms of Service govern the contractual relationship between Primely Content and brands using the platform.",
            "By registering and using the platform, the brand agrees to these terms in their current version.",
          ],
        },
        {
          heading: "2. Platform Services",
          body: [
            "Primely Content provides a structured platform for briefing management, creator matching, file exchange, review workflows and campaign communication.",
            "Primely Content may review, structure and support workflows, but individual campaign outcomes depend on the information and approvals provided by the brand.",
          ],
        },
        {
          heading: "3. Brand Responsibilities",
          body: [
            "Brands must provide truthful, complete and legally compliant campaign information.",
            "Brands are responsible for briefing accuracy, product legality, claim substantiation and all required approvals on their side.",
          ],
        },
        {
          heading: "4. Creator Assignment and Workflow",
          body: [
            "Creators are only assigned after internal review and platform verification steps where applicable.",
            "Primely Content reserves the right to reject, delay or reassign creator matches if quality, compliance or operational reasons require this.",
          ],
        },
        {
          heading: "5. Review, Approval and Finalization",
          body: [
            "Staff review and brand review are separate workflow stages.",
            "Once a deliverable is finally approved by the brand, the respective file may become locked and no further creator changes are guaranteed.",
          ],
        },
        {
          heading: "6. Fees and Payment",
          body: [
            "Any commercial terms, fees, service packages or billing arrangements are defined separately unless explicitly stated on the platform.",
            "Payment obligations remain due even if delays are caused by missing brand feedback, missing approvals or incomplete briefings.",
          ],
        },
        {
          heading: "7. Acceptable Use",
          body: [
            "The platform may not be used for unlawful, misleading, infringing, offensive or non-compliant campaigns.",
            "Primely Content may suspend access if misuse, abuse or legal risk is detected.",
          ],
        },
        {
          heading: "8. Changes to the Terms",
          body: [
            "Primely Content may update these terms for legal, operational or product-related reasons.",
            "Material updates may require renewed acceptance before continued platform use.",
          ],
        },
      ],
    },

    privacy: {
      title: "Privacy Policy for Brands",
      subtitle:
        "This privacy policy explains how Primely Content processes brand-related account and campaign data.",
      version: LEGAL_VERSIONS.BRAND.privacyVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Data We Process",
          body: [
            "We process account data, contact data, company data, platform activity, campaign files, support messages and technical metadata required to operate the platform.",
            "This may include company name, contact person, billing or business contact details, briefing data, uploaded files and workflow events.",
          ],
        },
        {
          heading: "2. Purpose of Processing",
          body: [
            "We process data to provide access control, campaign workflows, creator coordination, file storage, support communication and security monitoring.",
            "Data may also be used to improve service quality and maintain auditability of workflow actions.",
          ],
        },
        {
          heading: "3. Legal Basis",
          body: [
            "Processing is based on contractual necessity, legitimate interests, legal obligations and, where required, consent.",
          ],
        },
        {
          heading: "4. Data Sharing",
          body: [
            "Relevant campaign data may be shared with assigned creators, internal staff, infrastructure providers and legally required recipients.",
            "Only the data necessary for campaign execution and platform operation is shared.",
          ],
        },
        {
          heading: "5. Storage and Retention",
          body: [
            "We retain data for as long as necessary to provide the platform, fulfill legal obligations, resolve disputes and document workflow history.",
          ],
        },
        {
          heading: "6. Your Rights",
          body: [
            "Depending on applicable law, you may have rights to access, correct, delete, restrict or object to processing of your personal data.",
          ],
        },
      ],
    },

    agb: {
      title: "AGB for Brands",
      subtitle:
        "These General Terms and Conditions apply specifically to commercial brand use of the Primely Content platform.",
      version: LEGAL_VERSIONS.BRAND.agbVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Contracting Party",
          body: [
            "The contractual partner for platform services is Primely Content, unless otherwise stated in a separate agreement.",
          ],
        },
        {
          heading: "2. Service Availability",
          body: [
            "Primely Content aims for reliable platform availability but does not guarantee uninterrupted access at all times.",
            "Maintenance, updates, third-party outages or security measures may temporarily affect access.",
          ],
        },
        {
          heading: "3. Cooperation Duties",
          body: [
            "The brand must provide all required information, approvals and materials in due time.",
            "Delays caused by missing cooperation on the brand side are the brand’s responsibility.",
          ],
        },
        {
          heading: "4. Liability",
          body: [
            "Liability is limited to the extent permitted by applicable law.",
            "Primely Content is not liable for campaign performance, ad platform decisions or third-party platform behavior outside its control.",
          ],
        },
        {
          heading: "5. Final Provisions",
          body: [
            "Should individual provisions become invalid, the remaining provisions remain unaffected.",
            "Applicable law and place of jurisdiction are defined by the governing contract and mandatory law.",
          ],
        },
      ],
    },
  },

  CREATOR: {
    terms: {
      title: "Terms of Service for Creators",
      subtitle:
        "These terms apply to all creators using the Primely Content platform.",
      version: LEGAL_VERSIONS.CREATOR.termsVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Scope",
          body: [
            "These Terms of Service govern the use of the Primely Content platform by creators.",
            "By registering and using the platform, the creator agrees to these terms in their current version.",
          ],
        },
        {
          heading: "2. Platform Access",
          body: [
            "Creators may create an account, complete a profile and access platform features depending on verification and internal review status.",
            "Access to campaign assignments may be limited until email confirmation and staff approval are completed.",
          ],
        },
        {
          heading: "3. Creator Responsibilities",
          body: [
            "Creators must provide truthful profile information and keep their account data up to date.",
            "Creators are responsible for delivering original, lawful and compliant content within requested workflow requirements.",
          ],
        },
        {
          heading: "4. Verification and Approval",
          body: [
            "Primely Content may review creator accounts, profiles, intro videos and related materials before approval.",
            "Approval may be refused, delayed or revoked where quality, trust, compliance or business reasons justify such decision.",
          ],
        },
        {
          heading: "5. Uploads and Replacements",
          body: [
            "Uploaded deliverables may go through staff review and brand review.",
            "Where changes are requested, creators may be required to submit replacements or updated versions through the platform workflow.",
          ],
        },
        {
          heading: "6. Final Approval",
          body: [
            "Once a deliverable is finally approved and locked, additional changes may no longer be possible.",
          ],
        },
        {
          heading: "7. Acceptable Use",
          body: [
            "Creators may not upload unlawful, infringing, deceptive, abusive or non-compliant content.",
            "Platform misuse may result in restricted access, rejection or account removal.",
          ],
        },
        {
          heading: "8. Changes to the Terms",
          body: [
            "Primely Content may update these terms for legal, product or operational reasons.",
            "Material updates may require renewed acceptance before continued platform use.",
          ],
        },
      ],
    },

    privacy: {
      title: "Privacy Policy for Creators",
      subtitle:
        "This privacy policy explains how Primely Content processes creator-related account and profile data.",
      version: LEGAL_VERSIONS.CREATOR.privacyVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Data We Process",
          body: [
            "We process account data, profile data, social links, uploaded files, intro videos, pricing information, communication data and technical metadata.",
            "This may include full name, contact details, country, niche information, profile media and workflow history.",
          ],
        },
        {
          heading: "2. Purpose of Processing",
          body: [
            "We process data to operate the platform, evaluate profiles, manage assignments, coordinate workflows, store files and provide support.",
          ],
        },
        {
          heading: "3. Data Sharing",
          body: [
            "Relevant profile and workflow data may be shared with internal staff and, where necessary, with brands involved in campaign execution.",
            "Only data required for the intended platform workflow is shared.",
          ],
        },
        {
          heading: "4. Retention",
          body: [
            "We retain creator data as long as reasonably necessary for account operation, support, legal obligations and workflow documentation.",
          ],
        },
        {
          heading: "5. Your Rights",
          body: [
            "Depending on applicable law, you may have rights to access, correct, delete, restrict or object to processing of your personal data.",
          ],
        },
      ],
    },

    agb: {
      title: "AGB for Creators",
      subtitle:
        "These General Terms and Conditions apply specifically to creator use of the Primely Content platform.",
      version: LEGAL_VERSIONS.CREATOR.agbVersion,
      lastUpdated: "2026-04-20",
      sections: [
        {
          heading: "1. Platform Role",
          body: [
            "Primely Content provides a structured workflow environment for creator onboarding, review, assignment and deliverable handling.",
          ],
        },
        {
          heading: "2. No Assignment Guarantee",
          body: [
            "Account registration does not guarantee campaign assignment, approval or a minimum volume of work.",
          ],
        },
        {
          heading: "3. Quality and Compliance",
          body: [
            "Creators must follow campaign instructions, legal requirements and platform workflow rules.",
            "Content quality, timeliness and compliance may affect approval and future assignment decisions.",
          ],
        },
        {
          heading: "4. Liability",
          body: [
            "Liability is limited to the extent permitted by applicable law.",
            "Primely Content is not liable for third-party platform behavior, external algorithm changes or creator-side device failures beyond its control.",
          ],
        },
        {
          heading: "5. Final Provisions",
          body: [
            "Should individual provisions become invalid, the remaining provisions remain unaffected.",
            "Applicable law and place of jurisdiction are defined by the governing contract and mandatory law.",
          ],
        },
      ],
    },
  },
};

export function normalizeLegalRole(value: string | null | undefined): LegalRole | null {
  const role = String(value ?? "").trim().toUpperCase();
  if (role === "BRAND") return "BRAND";
  if (role === "CREATOR") return "CREATOR";
  return null;
}