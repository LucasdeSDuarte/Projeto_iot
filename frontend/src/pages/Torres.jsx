import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import FormTorre from '../componente/form/FormTorre';
import DashboardLayout from '../componente/DashboardLayout';
import api from '../services/api'; // ✅ Usando o axios configurado com token

export default function Torres() {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [torres, setTorres] = useState([]);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    carregarTorres();
  }, []);

  const carregarTorres = async () => {
    try {
      const response = await api.get('/torres'); // ✅ usa api
      setTorres(response.data);
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
        cliente_id: data.cliente_id || 1, // ajuste conforme necessário
      };

      if (editData) {
        await api.put(`/torres/${editData.id}`, payload); // ✅ usa api
      } else {
        await api.post('/torres', payload); // ✅ usa api
      }

      setShowForm(false);
      carregarTorres();
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
        <h1 className="text-2xl font-bold text-zinc-800">Torres</h1>
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
        className="mb-4 p-2 rounded-md border border-gray-300 w-full md:w-1/2"
      />

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
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
        <table className="min-w-full bg-white rounded-xl shadow-md">
          <thead className="bg-zinc-100 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Nome da Torre</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Localização</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cliente</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
            </tr>
          </thead>
          <tbody>
            {torresFiltradas.map((t) => (
              <tr key={t.id} className="border-b hover:bg-zinc-50">
                <td className="py-3 px-4 text-gray-800">{t.nome}</td>
                <td className="py-3 px-4 text-gray-600">{t.localizacao}</td>
                <td className="py-3 px-4 text-gray-600">{t.cliente?.nome}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => handleEdit(t)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button className="text-red-500 hover:text-red-600" onClick={() => alert('Em breve')}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
