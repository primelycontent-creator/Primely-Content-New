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
  if (!emailConfirmed) {
    return (
      <div className="mb-6 rounded-[28px] border border-amber-200 bg-amber-50 p-6">
        <div className="text-sm font-semibold text-amber-900">
          E-Mail-Adresse bestätigen
        </div>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          Bitte bestätige zuerst deine E-Mail-Adresse. Danach kannst du dein
          Creator-Profil vervollständigen und für Kampagnen freigeschaltet
          werden.
        </p>
      </div>
    );
  }

  if (approvalStatus === "REJECTED") {
    return (
      <div className="mb-6 rounded-[28px] border border-rose-200 bg-rose-50 p-6">
        <div className="text-sm font-semibold text-rose-900">
          Profil benötigt Anpassungen
        </div>

        <p className="mt-2 text-sm leading-6 text-rose-800">
          Damit wir dein Profil freigeben können, fehlen noch einige
          Informationen oder Angaben müssen angepasst werden.
        </p>

        {rejectionReason ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-white p-4">
            <div className="font-semibold text-rose-900">
              Feedback vom Primely-Team
            </div>

            <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
              {rejectionReason}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (approvalStatus === "APPROVED") {
    return (
      <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-6">
        <div className="text-sm font-semibold text-emerald-900">
          Profil freigegeben ✓
        </div>

        <p className="mt-2 text-sm leading-6 text-emerald-800">
          Dein Creator-Profil wurde erfolgreich freigegeben. Du kannst jetzt
          Kampagnen erhalten und mit Brands zusammenarbeiten.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-[28px] border border-blue-200 bg-blue-50 p-6">
      <div className="text-sm font-semibold text-blue-900">
        Creator-Profil wird geprüft
      </div>

      <p className="mt-2 text-sm leading-6 text-blue-800">
        Dein Profil wurde erfolgreich eingereicht und wird aktuell von unserem
        Team geprüft. Nach der Freigabe kannst du Kampagnen erhalten und an
        Projekten teilnehmen.
      </p>
    </div>
  );
}