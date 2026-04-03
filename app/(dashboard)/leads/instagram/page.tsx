import { prisma } from "@/lib/prisma";
import LeadsClient from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsInstagramPage() {
  const leads = await prisma.lead.findMany({
    where: { origen: "INSTAGRAM_PAUTA" },
    orderBy: { creadoEn: "desc" },
    include: { proyecto: { select: { id: true, nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads Instagram</h1>
        <p className="text-gray-500 mt-1">Leads de pautas publicitarias en Instagram</p>
      </div>
      <LeadsClient leads={leads} origen="INSTAGRAM_PAUTA" />
    </div>
  );
}
