import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import api from '../services/api';
import FormAlarme from '../componente/form/FormAlarme';

export default function Alertas() {
  const [alarmes, setAlarmes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    carregarAlarmes(page);
  }, [page]);

  const carregarAlarmes = async (pagina = 1) => {
    try {
      const response = await api.get(`/alarmes?page=${pagina}`);
      setAlarmes(response.data.data || []);
      setMeta(response.data.meta || {});
    } catch (error) {
      console.error('Erro ao carregar alarmes:', error);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (alarme) => {
    setEditData(alarme);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await api.put(`/alarmes/${editData.id}`, data);
      } else {
        await api.post('/alarmes', data);
      }
      setShowForm(false);
      carregarAlarmes(page);
    } catch (error) {
      console.error('Erro ao salvar alarme:', error);
    }
  };

  const alarmesFiltrados = alarmes.filter((a) =>
    a.descricao?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Alertas</h1>
        <button
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          onClick={handleCreate}
        >
          <Plus size={18} /> Novo Alerta
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por descrição"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 p-2 rounded-md border border-gray-300 w-full md:w-1/2"
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <FormAlarme
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead className="bg-zinc-100 border-b">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Descrição</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Valor Alarme</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Email Destino</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Dispositivo</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {alarmesFiltrados.map((a) => (
              <tr key={a.id} className="border-b hover:bg-zinc-50">
                <td className="py-3 px-4">{a.descricao}</td>
                <td className="py-3 px-4">{a.valor_alarme}</td>
                <td className="py-3 px-4 text-sm">{a.email}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {a.sensor?.appliance?.nome || '---'}
                </td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => handleEdit(a)} className="text-blue-500 hover:text-blue-600">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => alert('Em breve')} className="text-red-500 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-center mt-4 gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {meta.current_page} de {meta.last_page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.last_page}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
