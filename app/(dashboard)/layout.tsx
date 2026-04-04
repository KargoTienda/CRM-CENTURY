import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 min-h-screen" style={{ background: "var(--bg-base)" }}>
        {children}
      </main>
    </div>
  );
}
