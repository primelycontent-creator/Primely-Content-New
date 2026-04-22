type Role = "BRAND" | "CREATOR";

export default function RoleSwitch({
  role,
  onChange,
}: {
  role: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-white/60 p-1">
      <button
        type="button"
        onClick={() => onChange("BRAND")}
        className={[
          "px-5 py-2 text-sm rounded-md transition",
          role === "BRAND"
            ? "bg-emerald-950 text-white shadow"
            : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        Brand
      </button>
      <button
        type="button"
        onClick={() => onChange("CREATOR")}
        className={[
          "px-5 py-2 text-sm rounded-md transition",
          role === "CREATOR"
            ? "bg-emerald-950 text-white shadow"
            : "text-gray-700 hover:bg-gray-100",
        ].join(" ")}
      >
        Creator
      </button>
    </div>
  );
}
