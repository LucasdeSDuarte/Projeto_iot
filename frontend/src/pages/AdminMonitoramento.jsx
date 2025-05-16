import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../componente/DashboardLayout';
import AutoSuggestDropdown from '../componente/dropdown/AutoSuggestDropdown';
import {
  conectarMQTT,
  inscreverTopicos,
  unsubscribeTopics,
  desconectarMQTT} from '../services/mqtt';

const API = import.meta.env.VITE_API_URL;

// Função para formatar timestamp em data legível (se for unix timestamp)
const formatTimestamp = (timestamp) => {
  if (!timestamp) return '-';
  
  // Se for um timestamp unix (número de segundos ou milissegundos)
  if (typeof timestamp === 'number') {
    // Verificar se é timestamp em segundos ou milissegundos
    const date = timestamp > 9999999999 
      ? new Date(timestamp) // Milissegundos
      : new Date(timestamp * 1000); // Segundos
    
    return date.toLocaleString();
  }
  
  return timestamp.toString();
};

// Função para extrair informações do tópico MQTT
const extractTopicInfo = (topic) => {
  const parts = topic.split('/');
  return {
    categoria: parts[0] || '',
    clienteId: parts[1] || '',
    torreId: parts[2] || '',
    sensorTipo: parts[3] || ''
  };
};

export default function AdminMonitoramento() {
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientesOptions, setClientesOptions] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [projetosOptions, setProjetosOptions] = useState([]);
  const [tipoSensorSelecionado, setTipoSensorSelecionado] = useState(null);
  const [tipoSensorOptions, setTipoSensorOptions] = useState([]);

  const [dispositivos, setDispositivos] = useState([]);
  const [dadosMonitorados, setDadosMonitorados] = useState({});
  const [statusMQTT, setStatusMQTT] = useState('desconectado');
  const [loading, setLoading] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
  const [expandedDevice, setExpandedDevice] = useState(null);

  const algumFiltroAplicado = Boolean(clienteSelecionado || projetoSelecionado || tipoSensorSelecionado);

  // Função para obter a cor do status do dispositivo
  const getStatusColor = (lastUpdate) => {
    if (!lastUpdate) return 'bg-gray-400'; // Sem dados ainda
    
    const now = new Date();
    const lastUpdateTime = new Date(lastUpdate);
    const diffMinutes = (now - lastUpdateTime) / (1000 * 60);
    
    if (diffMinutes < 5) return 'bg-green-500'; // Atualizado recentemente
    if (diffMinutes < 15) return 'bg-yellow-500'; // Atualizado há pouco tempo
    return 'bg-red-500'; // Desatualizado
  };

  // Carrega lista de clientes
  useEffect(() => {
    axios.get(`${API}/clientes`)
      .then(res => {
        const list = res.data.data || [];
        setClientesOptions(list.map(c => ({ label: c.nome, value: c.id })));
      })
      .catch(err => console.error('Erro ao carregar clientes:', err));
  }, []);

  // Filtra e processa os dispositivos
  const processarDispositivos = useCallback((dispositivos) => {
    let filteredList = [...dispositivos];
    
    if (clienteSelecionado) {
      filteredList = filteredList.filter(d => 
        d.cliente_id === clienteSelecionado.value || 
        (d.rota && d.rota.includes(`/${clienteSelecionado.value}/`))
      );
    }
    
    if (projetoSelecionado) {
      filteredList = filteredList.filter(d => 
        d.torre?.projeto === projetoSelecionado.value
      );
    }
    
    if (tipoSensorSelecionado) {
      filteredList = filteredList.filter(d => 
        d.tipo === tipoSensorSelecionado.value || 
        (d.rota && d.rota.endsWith(`/${tipoSensorSelecionado.value}`))
      );
    }
    
    // Extrair opções únicas
    const uniqueProjects = [...new Set(filteredList.map(d => d.torre?.projeto).filter(Boolean))];
    setProjetosOptions(uniqueProjects.map(p => ({ label: p, value: p })));
    
    const uniqueSensorTypes = [...new Set(filteredList.map(d => {
      if (d.tipo) return d.tipo;
      if (d.rota) {
        const parts = d.rota.split('/');
        return parts[parts.length - 1];
      }
      return null;
    }).filter(Boolean))];
    
    setTipoSensorOptions(uniqueSensorTypes.map(t => ({ label: t, value: t })));
    
    return filteredList;
  }, [clienteSelecionado, projetoSelecionado, tipoSensorSelecionado]);

  // Carrega dispositivos seguindo filtros
  useEffect(() => {
    if (!algumFiltroAplicado && !statusMQTT === 'connected') {
      setDispositivos([]);
      return;
    }

    setLoading(true);
    axios.get(`${API}/appliances`)
      .then(res => {
        const list = res.data.data || [];
        const processedList = processarDispositivos(list);
        setDispositivos(processedList);
      })
      .catch(err => console.error('Erro ao buscar dispositivos:', err))
      .finally(() => setLoading(false));
  }, [clienteSelecionado, projetoSelecionado, tipoSensorSelecionado, processarDispositivos, statusMQTT]);

  // Determinar tópicos MQTT para assinar
  const topicosMQTT = dispositivos
    .filter(d => d.rota)
    .map(d => d.rota);

  // Adicionar tópicos baseados nos padrões observados
  useEffect(() => {
    if (clienteSelecionado && statusMQTT === 'connected') {
      // Adicionar tópicos genéricos baseados no cliente selecionado
      const topicosGenericos = [`torres/${clienteSelecionado.value}/+/+`];
      inscreverTopicos(topicosGenericos);
      
      return () => unsubscribeTopics(topicosGenericos);
    }
  }, [clienteSelecionado, statusMQTT]);

  // Conexão MQTT
  useEffect(() => {
    let isMounted = true;
    setStatusMQTT('conectando...');

    const handleMessage = (topic, payload) => {
      if (!isMounted) return;
      
      const topicInfo = extractTopicInfo(topic);
      
      setDadosMonitorados(prev => ({
        ...prev,
        [topic]: { 
          ...payload, 
          topicInfo,
          receivedAt: new Date().toLocaleString() 
        }
      }));
      
      setUltimaAtualizacao(new Date().toLocaleString());
    };

    conectarMQTT(handleMessage)
      .then(client => {
        if (!isMounted) return;
        
        if (client) {
          client.on('connect', () => setStatusMQTT('connected'));
          client.on('error', () => setStatusMQTT('error'));
          client.on('close', () => setStatusMQTT('closed'));
          client.on('offline', () => setStatusMQTT('offline'));
        } else {
          setStatusMQTT('falha na conexão');
        }
      })
      .catch(err => {
        console.error('Falha ao conectar MQTT:', err);
        if (isMounted) setStatusMQTT('error');
      });

    return () => {
      isMounted = false;
      desconectarMQTT();
    };
  }, []);

  // Inscrições MQTT após conexão
  useEffect(() => {
    if (statusMQTT !== 'connected' || topicosMQTT.length === 0) return;

    console.log("Inscrevendo nos tópicos:", topicosMQTT);
    inscreverTopicos(topicosMQTT);
    
    return () => unsubscribeTopics(topicosMQTT);
  }, [statusMQTT, topicosMQTT]);

  // Atualizar os filtros baseados nos dados recebidos
  useEffect(() => {
    if (Object.keys(dadosMonitorados).length === 0) return;

    // Extrair clientes únicos dos dados recebidos
    const clientesFromData = [...new Set(
      Object.values(dadosMonitorados)
        .map(data => data.cliente_id || (data.topicInfo?.clienteId))
        .filter(Boolean)
    )];
    
    // Adicionar clientes que não estiverem na lista de opções
    const novosClientes = clientesFromData
      .filter(clienteId => !clientesOptions.some(opt => opt.value === clienteId))
      .map(clienteId => ({ label: clienteId, value: clienteId }));
    
    if (novosClientes.length > 0) {
      setClientesOptions(prev => [...prev, ...novosClientes]);
    }
    
    // Extrair tipos de sensores únicos
    const sensoresFromData = [...new Set(
      Object.values(dadosMonitorados)
        .map(data => data.sensor_tipo || (data.topicInfo?.sensorTipo))
        .filter(Boolean)
    )];
    
    // Adicionar tipos de sensores que não estiverem na lista
    const novosSensores = sensoresFromData
      .filter(tipo => !tipoSensorOptions.some(opt => opt.value === tipo))
      .map(tipo => ({ label: tipo, value: tipo }));
    
    if (novosSensores.length > 0) {
      setTipoSensorOptions(prev => [...prev, ...novosSensores]);
    }
    
  }, [dadosMonitorados, clientesOptions, tipoSensorOptions]);

  // Função para limpar filtros
  const limparFiltros = () => {
    setClienteSelecionado(null);
    setProjetoSelecionado(null);
    setTipoSensorSelecionado(null);
  };

  // Função para reconectar MQTT
  const reconectarMQTT = () => {
    desconectarMQTT();
    setStatusMQTT('reconectando...');
    setTimeout(() => {
      conectarMQTT((topic, payload) => {
        setDadosMonitorados(prev => ({
          ...prev,
          [topic]: { ...payload, receivedAt: new Date().toLocaleString() }
        }));
      })
      .then(client => {
        client.on('connect', () => setStatusMQTT('connected'));
        client.on('error', () => setStatusMQTT('error'));
        client.on('close', () => setStatusMQTT('closed'));
        client.on('offline', () => setStatusMQTT('offline'));
      });
    }, 1000);
  };

  // Renderização dos cartões de dispositivos
  const renderDispositivoCard = (device) => {
    const topico = device.rota;
    const data = dadosMonitorados[topico] || {};
    const isExpanded = expandedDevice === device.id;
    
    // Extrair informações do tópico ou do dispositivo
    const clienteId = data.cliente_id || device.cliente_id || '';
    const torreId = data.torre_id || (device.torre?.id) || '';
    const sensorTipo = data.sensor_tipo || device.tipo || '';
    const statusClass = getStatusColor(data.receivedAt);
    
    return (
      <div key={device.id} 
           className={`bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white p-4 rounded shadow-md border-l-4 
                     ${statusClass === 'bg-green-500' ? 'border-green-500' : 
                       statusClass === 'bg-yellow-500' ? 'border-yellow-500' : 
                       statusClass === 'bg-red-500' ? 'border-red-500' : 'border-gray-300'}`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusClass}`}></div>
              <h2 className="text-lg font-semibold">{sensorTipo || 'Sensor'}</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Tópico: {topico || '-'}</p>
          </div>
          <button 
            onClick={() => setExpandedDevice(isExpanded ? null : device.id)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            {isExpanded ? 'Recolher' : 'Expandir'}
          </button>
        </div>
        
        <div className="mt-3 space-y-1">
          <p><strong>Cliente:</strong> {clienteId || '-'}</p>
          <p><strong>Torre:</strong> {torreId || '-'}</p>
          {data.valor !== undefined && (
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              <strong>Valor:</strong> {data.valor} 
              {device.unidade ? ` ${device.unidade}` : ''}
            </p>
          )}
          
          {isExpanded && (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p><strong>Hora da leitura:</strong> {formatTimestamp(data.timestamp)}</p>
              <p><strong>Recebido em:</strong> {data.receivedAt || '-'}</p>
              <p><strong>Status:</strong> {
                statusClass === 'bg-green-500' ? 'Ativo' : 
                statusClass === 'bg-yellow-500' ? 'Atenção' : 
                statusClass === 'bg-red-500' ? 'Inativo' : 'Desconhecido'
              }</p>
              {device.id && (
                <p><strong>ID do dispositivo:</strong> {device.id}</p>
              )}
              {device.descricao && (
                <p><strong>Descrição:</strong> {device.descricao}</p>
              )}
              {data && Object.keys(data).filter(k => 
                !['cliente_id', 'torre_id', 'sensor_tipo', 'valor', 'timestamp', 'receivedAt', 'topicInfo'].includes(k)
              ).map(key => (
                <p key={key}><strong>{key}:</strong> {
                  typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]
                }</p>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Renderização dos dispositivos como cards ou lista
  const renderDispositivos = () => {
    // Se temos dados MQTT mas não temos dispositivos cadastrados
    if (Object.keys(dadosMonitorados).length > 0 && dispositivos.length === 0) {
      // Criar "dispositivos virtuais" a partir dos dados MQTT
      const dispositivosVirtuais = Object.entries(dadosMonitorados).map(([topico, dados]) => ({
        id: `virtual-${topico}`,
        rota: topico,
        tipo: dados.sensor_tipo || dados.topicInfo?.sensorTipo || 'Desconhecido',
        cliente_id: dados.cliente_id || dados.topicInfo?.clienteId || 'Desconhecido',
        torre: { id: dados.torre_id || dados.topicInfo?.torreId || 'Desconhecido' }
      }));
      
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dispositivosVirtuais.map(renderDispositivoCard)}
        </div>
      );
    }
    
    if (dispositivos.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dispositivos.map(renderDispositivoCard)}
        </div>
      );
    }
    
    return (
      <p className="text-center text-gray-500 dark:text-gray-300 mt-6">
        Nenhum dispositivo encontrado com os filtros aplicados.
      </p>
    );
  };

  return (
    <DashboardLayout tipo="colaborador">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">
          Monitoramento de Sensores
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={reconectarMQTT}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
          >
            🔄 Reconectar MQTT
          </button>
          <button 
            onClick={limparFiltros}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
          >
            ❌ Limpar filtros
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className={`px-3 py-1 rounded text-sm font-medium inline-flex items-center gap-1 ${
          statusMQTT === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            statusMQTT === 'connected' ? 'bg-green-600' : 'bg-red-600'
          }`}></span>
          MQTT: {statusMQTT === 'connected' ? 'Conectado' : statusMQTT}
        </div>
        
        {ultimaAtualizacao && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Última atualização: {ultimaAtualizacao}
          </span>
        )}
        
        {topicosMQTT.length > 0 && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {topicosMQTT.length} tópicos monitorados
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mb-6">
        <AutoSuggestDropdown
          label="Cliente"
          options={clientesOptions}
          selectedOption={clienteSelecionado}
          onChange={setClienteSelecionado}
          placeholder="Filtrar por cliente..."
        />
        <AutoSuggestDropdown
          label="Projeto"
          options={projetosOptions}
          selectedOption={projetoSelecionado}
          onChange={setProjetoSelecionado}
          placeholder="Filtrar por projeto..."
        />
        <AutoSuggestDropdown
          label="Tipo de Sensor"
          options={tipoSensorOptions}
          selectedOption={tipoSensorSelecionado}
          onChange={setTipoSensorSelecionado}
          placeholder="Filtrar por tipo de sensor..."
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          <span className="ml-2">Carregando dispositivos...</span>
        </div>
      ) : !algumFiltroAplicado && Object.keys(dadosMonitorados).length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 p-4 rounded-md text-center my-8">
          <p className="text-blue-800 dark:text-blue-300 mb-2">
            Selecione um <strong>cliente</strong>, <strong>projeto</strong> ou <strong>tipo de sensor</strong> para filtrar os dados.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Ou aguarde o recebimento de dados via MQTT para visualização automática.
          </p>
        </div>
      ) : (
        <>
          {renderDispositivos()}
        </>
      )}
      
      {Object.keys(dadosMonitorados).length > 0 && (
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>{Object.keys(dadosMonitorados).length} dados recebidos via MQTT</p>
        </div>
      )}
    </DashboardLayout>
  );
}