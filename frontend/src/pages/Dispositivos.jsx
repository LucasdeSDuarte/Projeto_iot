import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import FormAppliance from '../componente/form/FormAppliance';
import api from '../services/api';

export default function Dispositivos() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarDispositivos(page);
  }, [page]);

  const carregarDispositivos = async (pagina = 1) => {
    try {
      const response = await api.get(`/appliances?page=${pagina}`);
      setDispositivos(response.data.data || []);
      setMeta(response.data.meta || {});
    } catch (error) {
      console.error('Erro ao buscar dispositivos:', error);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (appliance) => {
    setEditData(appliance);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editData) {
        await api.put(`/appliances/${editData.id}`, data);
      } else {
        await api.post('/appliances', data);
      }
      setShowForm(false);
      carregarDispositivos(page);
    } catch (error) {
      console.error('Erro ao salvar dispositivo:', error);
    }
  };

  const dispositivosFiltrados = dispositivos.filter((d) =>
    d.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (d.tipo && d.tipo.toLowerCase().includes(filtro.toLowerCase()))
  );

  const handleNextPage = () => {
    if (meta && page < meta.last_page) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (meta && page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-800">Dispositivos</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          <Plus size={18} /> Novo Dispositivo
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou tipo"
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
            <FormAppliance
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
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nome</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Torre</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Rota</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
          </tr>
        </thead>

        <tbody>
          {dispositivosFiltrados.map((d) => (
            <tr key={d.id} className="border-b hover:bg-zinc-50">
              <td className="py-3 px-4">{d.nome}</td>
              <td className="py-3 px-4 text-gray-600">{d.tipo}</td>
              <td className="py-3 px-4 text-gray-600">{d.torre?.nome}</td>
              <td className="py-3 px-4 text-blue-600">
                {d.rota ? (
                  <a href={d.rota} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {d.rota}
                  </a>
                ) : (
                  <span className="text-gray-400 italic">Não definida</span>
                )}
              </td>
              <td className="py-3 px-4 flex gap-2">
                <button
                  className="text-blue-500 hover:text-blue-600"
                  onClick={() => handleEdit(d)}
                >
                  <Pencil size={18} />
                </button>
                <button
                  className="text-red-500 hover:text-red-600"
                  onClick={() => alert('Em breve')}
                >
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
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            onClick={handleNextPage}
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
