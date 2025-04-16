import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AutoSuggestDropdown from '../dropdown/AutoSuggestDropdown';

const API = import.meta.env.VITE_API_URL;

export default function FormAlarme({ initialData = {}, onSubmit, onCancel }) {
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [valorAlarme, setValorAlarme] = useState(initialData?.valor_alarme || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);

  const [clientes, setClientes] = useState([]);
  const [torres, setTorres] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [sensores, setSensores] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [torreSelecionada, setTorreSelecionada] = useState(null);
  const [applianceSelecionado, setApplianceSelecionado] = useState(null);
  const [sensorSelecionado, setSensorSelecionado] = useState(null);

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (clienteSelecionado) {
      const filtradas = torres.filter(t => t.cliente_id === clienteSelecionado.value);
      setTorresFiltradas(filtradas.map(t => ({ label: t.nome, value: t.id })));
    } else {
      setTorresFiltradas([]);
    }
    setTorreSelecionada(null);
    setApplianceSelecionado(null);
    setSensorSelecionado(null);
  }, [clienteSelecionado]);

  useEffect(() => {
    if (torreSelecionada) {
      const filtradas = appliances.filter(a => a.torre_id === torreSelecionada.value);
      setAppliancesFiltradas(filtradas.map(a => ({ label: a.nome + ' - ' + a.tipo, value: a.id })));
    } else {
      setAppliancesFiltradas([]);
    }
    setApplianceSelecionado(null);
    setSensorSelecionado(null);
  }, [torreSelecionada]);

  useEffect(() => {
    if (applianceSelecionado) {
      const filtrados = sensores.filter(s => s.appliance_id === applianceSelecionado.value);
      setSensoresFiltrados(filtrados.map(s => ({ label: s.identificador, value: s.id })));
    } else {
      setSensoresFiltrados([]);
    }
    setSensorSelecionado(null);
  }, [applianceSelecionado]);

  const [torresFiltradas, setTorresFiltradas] = useState([]);
  const [appliancesFiltradas, setAppliancesFiltradas] = useState([]);
  const [sensoresFiltrados, setSensoresFiltrados] = useState([]);

  const carregarDadosIniciais = async () => {
    try {
      const [clientesRes, torresRes, appliancesRes, sensoresRes] = await Promise.all([
        axios.get(`${API}/clientes`),
        axios.get(`${API}/torres`),
        axios.get(`${API}/appliances`),
        axios.get(`${API}/sensores`),
      ]);

      const clientesData = clientesRes.data.data || [];
      const torresData = torresRes.data.data || [];
      const appliancesData = appliancesRes.data.data || [];
      const sensoresData = sensoresRes.data.data || [];

      setClientes(clientesData.map(c => ({ label: c.nome, value: c.id })));
      setTorres(torresData);
      setAppliances(appliancesData);
      setSensores(sensoresData);

      // Edição
      if (initialData?.id && initialData?.sensor_id) {
        const sensor = sensoresData.find(s => s.id === initialData.sensor_id);
        const appliance = appliancesData.find(a => a.id === sensor?.appliance_id);
        const torre = torresData.find(t => t.id === appliance?.torre_id);
        const cliente = clientesData.find(c => c.id === torre?.cliente_id);

        if (cliente) setClienteSelecionado({ label: cliente.nome, value: cliente.id });
        if (torre) setTorreSelecionada({ label: torre.nome, value: torre.id });
        if (appliance) setApplianceSelecionado({ label: `${appliance.nome} - ${appliance.tipo}`, value: appliance.id });
        if (sensor) setSensorSelecionado({ label: sensor.identificador, value: sensor.id });
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sensorSelecionado) return;

    onSubmit({
      descricao,
      valor_alarme: parseFloat(valorAlarme),
      email,
      sensor_id: sensorSelecionado.value,
      ativo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Alarme' : 'Novo Alarme'}
      </h2>

      <AutoSuggestDropdown
        label="Cliente"
        options={clientes}
        selectedOption={clienteSelecionado}
        onChange={opt => setClienteSelecionado(opt)}
        placeholder="Buscar cliente..."
      />

      <AutoSuggestDropdown
        label="Torre"
        options={torresFiltradas}
        selectedOption={torreSelecionada}
        onChange={opt => setTorreSelecionada(opt)}
        placeholder="Buscar torre..."
      />

      <AutoSuggestDropdown
        label="Dispositivo"
        options={appliancesFiltradas}
        selectedOption={applianceSelecionado}
        onChange={opt => setApplianceSelecionado(opt)}
        placeholder="Buscar dispositivo..."
      />

      <AutoSuggestDropdown
        label="Sensor"
        options={sensoresFiltrados}
        selectedOption={sensorSelecionado}
        onChange={opt => setSensorSelecionado(opt)}
        placeholder="Buscar sensor..."
      />

      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <input
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-zinc-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Valor do Alarme (MAIOR QUE)</label>
        <input
          type="number"
          step="0.01"
          value={valorAlarme}
          onChange={(e) => setValorAlarme(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-zinc-800 dark:border-gray-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">E-mail Destino</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md dark:bg-zinc-800 dark:border-gray-600"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 border-gray-300 text-green-500 focus:ring-green-500"
        />
        <label className="text-sm">Ativo</label>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!sensorSelecionado}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
