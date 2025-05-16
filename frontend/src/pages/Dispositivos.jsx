import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2, X, Info } from 'lucide-react';
import FormAppliance from '../componente/form/FormAppliance';
import api from '../services/api';

export default function Dispositivos() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');
  const [descricaoSelecionada, setDescricaoSelecionada] = useState('');

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

  const handleToggleAtivo = async (id) => {
    try {
      await api.patch(`/appliances/${id}/status`);
      carregarDispositivos(page);
    } catch (err) {
      console.error('Erro ao alterar status:', err);
    }
  };

  const dispositivosFiltrados = dispositivos.filter((d) =>
    d.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    d.tipo?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Dispositivos</h1>
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
        className="mb-4 p-2 rounded-md border border-gray-300 w-full md:w-1/2 dark:bg-zinc-800 dark:text-white dark:border-zinc-600"
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white dark:bg-zinc-900 dark:text-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
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

      {descricaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-md shadow-xl w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setDescricaoSelecionada('')}
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-2">Descrição do Dispositivo</h3>
            <p className="text-gray-700 dark:text-gray-200">{descricaoSelecionada}</p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <thead className="bg-zinc-100 dark:bg-zinc-700 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Cliente / Nome</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Modelo / Utilização</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Torre</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Tópico</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {dispositivosFiltrados.map((d) => (
              <tr key={d.id} className="border-b hover:bg-zinc-50 dark:hover:bg-zinc-700">
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleToggleAtivo(d.id)}
                    className={`px-3 py-1 text-sm font-medium rounded-full text-white ${
                      d.ativo ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  >
                    {d.ativo ? 'Ativo' : 'Desativado'}
                  </button>
                </td>
                <td className="py-3 px-4 text-zinc-800 dark:text-white">{d.nome}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{d.tipo}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{d.torre?.nome}</td>
                <td className="py-3 px-4 text-blue-600 dark:text-blue-400">
                  {d.rota ? (
                    <a href={d.rota} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {d.rota}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic dark:text-gray-500">Não definida</span>
                  )}
                </td>
                <td className="py-3 px-4 flex gap-3">
                  <button onClick={() => handleEdit(d)} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => setDescricaoSelecionada(d.descricao)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <Info size={18} />
                  </button>
                  <button onClick={() => alert('Em breve')} className="text-red-500 hover:text-red-600 dark:hover:text-red-400">
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
            className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 rounded-md hover:bg-gray-400 dark:hover:bg-zinc-600 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="dark:text-white">Página {meta.current_page} de {meta.last_page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.last_page}
            className="px-4 py-2 bg-gray-300 dark:bg-zinc-700 rounded-md hover:bg-gray-400 dark:hover:bg-zinc-600 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
