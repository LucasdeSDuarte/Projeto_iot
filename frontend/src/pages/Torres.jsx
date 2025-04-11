import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import FormTorre from '../componente/form/FormTorre';
import api from '../services/api';

export default function Torres() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [torres, setTorres] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarTorres(page);
  }, [page]);

  const carregarTorres = async (pagina = 1) => {
    try {
      const response = await api.get(`/torres?page=${pagina}`);
      setTorres(response.data.data || []);
      setMeta(response.data.meta || {});
    } catch (error) {
      console.error('Erro ao buscar torres:', error);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (torre) => {
    setEditData(torre);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      const payload = {
        nome: data.nome,
        localizacao: data.localizacao,
        projeto: data.projeto?.trim() || null,
        cliente_id: data.cliente_id || 1,
        ativo: !!data.ativo,
      };

      if (editData) {
        await api.put(`/torres/${editData.id}`, payload);
      } else {
        await api.post('/torres', payload);
      }

      setShowForm(false);
      carregarTorres(page);
    } catch (error) {
      console.error('Erro ao salvar torre:', error);
    }
  };

  const torresFiltradas = torres.filter((t) =>
    t.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    (t.localizacao && t.localizacao.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Torres</h1>
        <button
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          onClick={handleCreate}
        >
          <Plus size={18} /> Nova Torre
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por nome ou localização"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="mb-4 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-800 text-gray-800 dark:text-white w-full md:w-1/2"
      />

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <FormTorre
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <thead className="bg-zinc-100 dark:bg-zinc-700 border-b dark:border-zinc-600">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Nome da Torre</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Localização</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Projeto</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {torresFiltradas.length > 0 ? (
              torresFiltradas.map((t) => (
                <tr key={t.id} className="border-b dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white font-medium ${
                        t.ativo ? 'bg-green-400' : 'bg-red-400'
                      }`}
                    >
                      {t.ativo ? 'Ativo' : 'Desativado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 dark:text-white">{t.nome}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{t.localizacao}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{t.projeto || '-'}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{t.cliente?.nome || '-'}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      className="text-blue-500 hover:text-blue-600"
                      onClick={() => handleEdit(t)}
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
              ))
            ) : (
              <tr>
                <td colSpan="6" className="py-4 text-center text-gray-500 dark:text-gray-400">
                  Nenhuma torre encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div className="flex items-center justify-center mt-4 gap-4">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Página {meta.current_page} de {meta.last_page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.last_page}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
