import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../componente/DashboardLayout';
import AutoSuggestDropdown from '../componente/dropdown/AutoSuggestDropdown';

const API = import.meta.env.VITE_API_URL;

export default function AdminMonitoramento() {
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientesOptions, setClientesOptions] = useState([]);

  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [projetosOptions, setProjetosOptions] = useState([]);

  const [dispositivos, setDispositivos] = useState([]);
  const [dadosMonitorados, setDadosMonitorados] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarClientes();
    carregarDispositivos();
  }, []);

  const carregarClientes = async () => {
    try {
      const res = await axios.get(`${API}/clientes`);
      const clientes = res.data.data || [];
      setClientesOptions(clientes.map(c => ({ label: c.nome, value: c.id })));
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    }
  };

  const carregarDispositivos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/appliances`);
      const lista = res.data.data || [];

      // Define lista de projetos únicos
      const projetosUnicos = [...new Set(
        lista.map(item => item.torre?.projeto).filter(Boolean)
      )];
      setProjetosOptions(projetosUnicos.map(p => ({ label: p, value: p })));

      setDispositivos(lista);

      for (const item of lista) {
        if (item.rota) {
          try {
            const resp = await fetch(item.rota);
            const dados = await resp.json();
            setDadosMonitorados(prev => ({
              ...prev,
              [item.id]: dados
            }));
          } catch {
            setDadosMonitorados(prev => ({
              ...prev,
              [item.id]: { erro: true }
            }));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dispositivos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Aplica filtros de cliente e projeto
  const dispositivosFiltrados = dispositivos.filter((d) => {
    const clienteMatch = clienteSelecionado
      ? d.cliente_id === clienteSelecionado.value
      : true;

    const projetoMatch = projetoSelecionado
      ? d.torre?.projeto === projetoSelecionado.value
      : true;

    return clienteMatch && projetoMatch;
  });

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">
        Monitoramento Geral dos Sensores
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-6">
        <AutoSuggestDropdown
          label="Cliente"
          options={clientesOptions}
          selectedOption={clienteSelecionado}
          onChange={(opt) => setClienteSelecionado(opt)}
          placeholder="Buscar cliente..."
        />

        <AutoSuggestDropdown
          label="Projeto"
          options={projetosOptions}
          selectedOption={projetoSelecionado}
          onChange={(opt) => setProjetoSelecionado(opt)}
          placeholder="Buscar projeto..."
        />
      </div>

      {loading ? (
        <p className="text-center text-zinc-600 dark:text-zinc-300">
          Carregando dispositivos...
        </p>
      ) : dispositivosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dispositivosFiltrados.map((appliance) => (
            <div
              key={appliance.id}
              className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white p-4 rounded shadow"
            >
              <h2 className="text-lg font-semibold mb-2">{appliance.tipo}</h2>
              <p><strong>Nome:</strong> {appliance.nome}</p>
              <p><strong>Descrição:</strong> {appliance.descricao}</p>
              <p><strong>Cliente:</strong> {appliance.cliente_nome}</p>
              <p><strong>Projeto:</strong> {appliance.torre?.projeto || '-'}</p>
              <p><strong>Rota:</strong> {appliance.rota}</p>
              <p><strong>Último valor:</strong> {
                dadosMonitorados[appliance.id]?.valor ??
                (dadosMonitorados[appliance.id]?.erro
                  ? 'Erro ao carregar'
                  : 'Carregando...')
              }</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-300 mt-6">
          Nenhum dispositivo encontrado com os filtros aplicados.
        </p>
      )}
    </DashboardLayout>
  );
}
