import DashboardLayout from '../componente/DashboardLayout';

export default function Alertas() {
  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Alertas</h1>
      <p className="text-gray-500">Visualização e gestão dos alertas registrados pelo sistema.</p>
    </DashboardLayout>
  );
}
