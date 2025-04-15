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

  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingDispositivos, setLoadingDispositivos] = useState(false);

  // Mapeamento torre_id => projeto
  const [torreIdToProjeto, setTorreIdToProjeto] = useState({});

  // Carrega lista de clientes
  useEffect(() => {
    const carregarClientes = async () => {
      setLoadingClientes(true);
      try {
        const res = await axios.get(`${API}/clientes`);
        const clientes = res.data.data || [];
        setClientesOptions(clientes.map(c => ({ label: c.nome, value: c.id })));
      } catch (err) {
        console.error('Erro ao buscar clientes:', err);
      } finally {
        setLoadingClientes(false);
      }
    };

    carregarClientes();
  }, []);

  // Carrega dispositivos + projetos quando cliente muda
  useEffect(() => {
    const buscarDadosDoCliente = async () => {
      if (!clienteSelecionado) return;
      setLoadingDispositivos(true);
      setDispositivos([]);
      setProjetosOptions([]);
      setProjetoSelecionado(null);
      setDadosMonitorados({});

      try {
        const [applianceRes, torresRes] = await Promise.all([
          axios.get(`${API}/appliances?cliente=${clienteSelecionado.value}`),
          axios.get(`${API}/torres?cliente=${clienteSelecionado.value}`),
        ]);

        const appliances = applianceRes.data.data || [];
        const torres = torresRes.data.data || [];

        // Mapeia torre_id => projeto
        const mapaTorres = {};
        torres.forEach(t => {
          mapaTorres[t.id] = t.projeto;
        });
        setTorreIdToProjeto(mapaTorres);

        // Monta lista de projetos únicos
        const projetosUnicos = [...new Set(torres.map(t => t.projeto).filter(Boolean))];
        setProjetosOptions(projetosUnicos.map(p => ({ label: p, value: p })));

        // Salva todos os dispositivos
        setDispositivos(appliances);

        // Busca dados das rotas
        for (const appliance of appliances) {
          if (appliance.rota) {
            try {
              const res = await fetch(appliance.rota);
              const dados = await res.json();
              setDadosMonitorados(prev => ({
                ...prev,
                [appliance.id]: dados,
              }));
            } catch {
              setDadosMonitorados(prev => ({
                ...prev,
                [appliance.id]: { erro: true },
              }));
            }
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dispositivos ou torres:', err);
      } finally {
        setLoadingDispositivos(false);
      }
    };

    buscarDadosDoCliente();
  }, [clienteSelecionado]);

  // Aplica filtro por projeto, se houver
  const dispositivosFiltrados = dispositivos.filter(d => {
    if (!projetoSelecionado) return true;
    const projetoDaTorre = torreIdToProjeto[d.torre_id];
    return projetoDaTorre === projetoSelecionado.value;
  });

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-white">
        Monitoramento Geral dos Sensores
      </h1>

      <div className="mb-6 max-w-md space-y-4">
        <AutoSuggestDropdown
          label="Cliente"
          options={clientesOptions}
          selectedOption={clienteSelecionado}
          onChange={(opt) => setClienteSelecionado(opt)}
          placeholder={loadingClientes ? 'Carregando clientes...' : 'Buscar cliente...'}
        />

        {projetosOptions.length > 0 && (
          <AutoSuggestDropdown
            label="Projeto"
            options={projetosOptions}
            selectedOption={projetoSelecionado}
            onChange={(opt) => setProjetoSelecionado(opt)}
            placeholder="Buscar projeto..."
          />
        )}
      </div>

      {clienteSelecionado ? (
        loadingDispositivos ? (
          <p className="text-center text-zinc-600 dark:text-zinc-300">Carregando dispositivos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dispositivosFiltrados.map((appliance) => (
              <div
                key={appliance.id}
                className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white p-4 rounded shadow"
              >
                <h2 className="text-lg font-semibold mb-2">{appliance.tipo}</h2>
                <p><strong>Nome:</strong> {appliance.nome}</p>
                <p><strong>Descrição:</strong> {appliance.descricao}</p>
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
        )
      ) : (
        <p className="text-gray-500 dark:text-gray-300 text-center mt-6">
          Selecione um cliente para visualizar os sensores.
        </p>
      )}
    </DashboardLayout>
  );
}
