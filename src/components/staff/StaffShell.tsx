import StaffSidebar from "@/components/staff/StaffSidebar";

export default function StaffShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F1EA]">
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <StaffSidebar />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}