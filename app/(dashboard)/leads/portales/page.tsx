import { prisma } from "@/lib/prisma";
import LeadsClient from "@/components/leads/LeadsClient";

export const dynamic = "force-dynamic";

export default async function LeadsPortalesPage() {
  const leads = await prisma.lead.findMany({
    where: { origen: { in: ["C21", "ZONAPROP", "ARGENPROP", "PROPIO", "MANUAL"] } },
    orderBy: { creadoEn: "desc" },
    include: { proyecto: { select: { id: true, nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads Portales / Manual</h1>
        <p className="text-gray-500 mt-1">Leads de C21, ZonaProp, ArgenProp y entrada manual</p>
      </div>
      <LeadsClient leads={leads} origen="MANUAL" />
    </div>
  );
}
