import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import FormSensor from '../componente/form/FormSensor';
import api from '../services/api';

export default function Sensores() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [sensores, setSensores] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarSensores(page);
  }, [page]);

  const carregarSensores = async (pagina = 1) => {
    try {
      const response = await api.get(`/sensores?page=${pagina}`);
      setSensores(response.data.data || []);
      setMeta(response.data.meta || {});
    } catch (error) {
      console.error('Erro ao buscar sensores:', error);
    }
  };

  const handleCreate = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (sensor) => {
    setEditData(sensor);
    setShowForm(true);
  };

  const handleSubmit = async (data) => {
    try {
      const payload = {
        tipo: data.tipo,
        unidade: data.unidade,
        identificador: data.identificador,
        ativo: data.ativo,
        appliance_id: data.appliance?.id || data.appliance_id, // <- Corrigido aqui
      };
  
      if (!payload.appliance_id) {
        alert('Dispositivo não selecionado corretamente.');
        return;
      }
  
      if (editData) {
        await api.put(`/sensores/${editData.id}`, payload);
      } else {
        await api.post('/sensores', payload);
      }
  
      setShowForm(false);
      carregarSensores(page);
    } catch (error) {
      console.error('Erro ao salvar sensor:', error);
    }
  };

  const sensoresFiltrados = sensores.filter((s) =>
    s.tipo.toLowerCase().includes(filtro.toLowerCase()) ||
    (s.identificador && s.identificador.toLowerCase().includes(filtro.toLowerCase()))
  );

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Sensores</h1>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          <Plus size={18} /> Novo Sensor
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar por tipo ou identificador"
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
            <FormSensor
              initialData={editData}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-zinc-800 rounded-xl shadow-md">
          <thead className="bg-zinc-100 dark:bg-zinc-700 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Transdutor</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Identificador</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Unidade</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Cliente / Nome</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sensoresFiltrados.map((s) => (
              <tr key={s.id} className="border-b dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition">
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white font-medium ${
                      s.ativo ? 'bg-green-400' : 'bg-red-400'
                    }`}
                  >
                    {s.ativo ? 'Ativo' : 'Desativado'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 dark:text-white">{s.tipo}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{s.identificador}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{s.unidade}</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{s.appliance?.nome}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => handleEdit(s)}
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
            {sensoresFiltrados.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 dark:text-gray-400 py-4">
                  Nenhum sensor encontrado.
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
