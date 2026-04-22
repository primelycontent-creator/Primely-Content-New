"use client";

type Props = {
  emailConfirmed: boolean;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED" | null | undefined;
  rejectionReason?: string | null;
};

export default function CreatorVerificationBanner({
  emailConfirmed,
  approvalStatus,
  rejectionReason,
}: Props) {
  if (emailConfirmed && approvalStatus === "APPROVED") {
    return null;
  }

  if (!emailConfirmed) {
    return (
      <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        <div className="text-sm font-semibold">Please confirm your email</div>
        <p className="mt-2 text-sm">
          Your creator account is not verified yet. Please confirm your email first.
          After that, our staff team will review and approve your profile before you can be assigned to campaigns.
        </p>
      </div>
    );
  }

  if (approvalStatus === "REJECTED") {
    return (
      <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 p-5 text-rose-900">
        <div className="text-sm font-semibold">Your creator profile was not approved yet</div>
        <p className="mt-2 text-sm">
          Please review your profile details and update missing information if needed.
        </p>
        {rejectionReason ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-white/70 p-4 text-sm">
            <div className="font-semibold">Staff note</div>
            <div className="mt-1 whitespace-pre-wrap">{rejectionReason}</div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-5 text-blue-900">
      <div className="text-sm font-semibold">Your account is under review</div>
      <p className="mt-2 text-sm">
        Your email is confirmed. Our staff team is currently reviewing your creator profile.
        You can already complete your profile and get everything ready, but campaign assignment will start after approval.
      </p>
    </div>
  );
}