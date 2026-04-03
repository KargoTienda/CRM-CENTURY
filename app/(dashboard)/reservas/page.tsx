import { prisma } from "@/lib/prisma";
import ReservasClient from "@/components/reservas/ReservasClient";

export const dynamic = "force-dynamic";

export default async function ReservasPage() {
  const reservas = await prisma.reserva.findMany({
    orderBy: { fechaReserva: "desc" },
    include: { cliente: { select: { id: true, nombre: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 mt-1">{reservas.length} reservas registradas</p>
        </div>
      </div>
      <ReservasClient reservas={reservas} />
    </div>
  );
}
