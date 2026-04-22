export default function ImprintPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-3xl border bg-white/80 p-10 shadow-sm">
        <div className="text-xs font-semibold tracking-wide text-gray-500">LEGAL</div>
        <h1 className="mt-2 font-serif text-5xl tracking-tight text-gray-900">Imprint</h1>
        <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-gray-700">
          This is a placeholder page for your imprint.
          {"\n\n"}
          Add your company details, legal address, managing director, contact data and all required information here.
        </p>
      </div>
    </div>
  );
}