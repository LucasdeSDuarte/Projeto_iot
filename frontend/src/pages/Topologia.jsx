// Topologia.jsx
import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';
import dagre from 'dagre';
import Modal from 'react-modal';
import AutoSuggestDropdown from '../componente/dropdown/AutoSuggestDropdown';



const nodeWidth = 180;
const nodeHeight = 50;

// Função para posicionar os nós utilizando Dagre
function getLayoutedElements(nodes, edges, direction = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: nodeWithPosition.x, y: nodeWithPosition.y }
    };
  });

  return { nodes: layoutedNodes, edges };
}

export default function Topologia() {
  // Estados para os dados, nós, arestas e filtros
  const [data, setData] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para os filtros auto-sugestão
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null);

  useEffect(() => {
    async function carregarTopologia() {
      try {
        const response = await api.get('/topologia');
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar topologia:', err);
        setError('Erro ao carregar dados da topologia');
      } finally {
        setLoading(false);
      }
    }
    carregarTopologia();
  }, []);

  // Converte os dados da API em formato de nós e arestas para o React Flow,
  // aplicando os filtros (cliente e torre) conforme selecionados.
  const transformarParaReactFlow = (clientesData) => {
    const tempNodes = [];
    const tempEdges = [];

    clientesData.forEach((cliente) => {
      // Se houver filtro de cliente e este não corresponder, ignora
      if (selectedClient && cliente.id !== selectedClient.value) return;
      const clienteId = `cliente-${cliente.id}`;
      tempNodes.push({
        id: clienteId,
        data: { label: cliente.nome },
        type: 'default',
        position: { x: 0, y: 0 },
        style: { backgroundColor: '#e0f2fe', border: '1px solid #0284c7' },
      });

      // Filtra as torres: se houver filtro de torre, mostra somente a torre correspondente
      const torres = selectedTower
        ? cliente.torres.filter((torre) => torre.id === selectedTower.value)
        : cliente.torres;

      torres.forEach((torre) => {
        const torreId = `torre-${torre.id}`;
        tempNodes.push({
          id: torreId,
          data: { label: torre.nome },
          position: { x: 0, y: 0 },
          style: { backgroundColor: '#fffbe6', border: '1px solid #facc15' },
        });
        tempEdges.push({ id: `${clienteId}-${torreId}`, source: clienteId, target: torreId });

        torre.appliances.forEach((app) => {
          const appId = `app-${app.id}`;
          tempNodes.push({
            id: appId,
            data: { label: app.nome, ...app },
            position: { x: 0, y: 0 },
            style: { backgroundColor: '#f3e8ff', border: '1px solid #a855f7' },
          });
          tempEdges.push({ id: `${torreId}-${appId}`, source: torreId, target: appId });

          app.sensores.forEach((sensor) => {
            const sensorId = `sensor-${sensor.id}`;
            tempNodes.push({
              id: sensorId,
              data: { label: sensor.tipo, ...sensor },
              position: { x: 0, y: 0 },
              style: { backgroundColor: '#ecfccb', border: '1px solid #22c55e' },
            });
            tempEdges.push({ id: `${appId}-${sensorId}`, source: appId, target: sensorId });

            sensor.alarmes.forEach((alarme) => {
              const alarmeId = `alarme-${alarme.id}`;
              tempNodes.push({
                id: alarmeId,
                data: { label: `⚠️ ${alarme.descricao}`, ...alarme },
                position: { x: 0, y: 0 },
                style: { backgroundColor: '#fee2e2', border: '1px solid #ef4444' },
              });
              tempEdges.push({ id: `${sensorId}-${alarmeId}`, source: sensorId, target: alarmeId });
            });
          });
        });
      });
    });

    return getLayoutedElements(tempNodes, tempEdges);
  };

  // Atualiza os nós e arestas sempre que os dados ou filtros mudarem
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    if (data) {
      return transformarParaReactFlow(data);
    }
    return { nodes: [], edges: [] };
  }, [data, selectedClient, selectedTower]);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges]);

  const handleNodeClick = (_, node) => {
    setSelectedItem(node.data);
    setModalOpen(true);
  };

  // Cria a lista de clientes para o AutoSuggestDropdown
  const clientsOptions = useMemo(() => {
    if (!data) return [];
    return data.map((cliente) => ({
      label: cliente.nome,
      value: cliente.id
    }));
  }, [data]);

  // Cria a lista de torres para o cliente selecionado (se houver)
  const towersOptions = useMemo(() => {
    if (!data || !selectedClient) return [];
    const client = data.find((c) => c.id === selectedClient.value);
    if (!client || !client.torres) return [];
    return client.torres.map((torre) => ({
      label: torre.nome,
      value: torre.id
    }));
  }, [data, selectedClient]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <DashboardLayout tipo="colaborador">
      <h1 className="text-2xl font-bold mb-4">Topologia do Sistema</h1>


      <div className="mb-4 p-4 bg-gray-100 dark:bg-zinc-800 rounded space-y-4 transition-colors duration-300">
      <AutoSuggestDropdown
        label="Cliente"
        options={clientsOptions}
        selectedOption={selectedClient}
        onChange={(option) => {
            setSelectedClient(option);
            setSelectedTower(null);
        }}
        placeholder="Busque o cliente..."
        />

        <AutoSuggestDropdown
        label="Projeto (Torre)"
        options={towersOptions}
        selectedOption={selectedTower}
        onChange={setSelectedTower}
        placeholder="Busque o projeto..."
        />
      </div>

      {/* Renderização do ReactFlow */}
      <div className="h-[70vh] bg-white dark:bg-zinc-800 rounded-lg shadow p-2">
      {selectedClient ? (
        <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} fitView>
            <MiniMap />
            <Controls />
            <Background gap={16} />
        </ReactFlow>
        ) : (
        <div className="h-[70vh] flex items-center justify-center text-gray-500 text-lg italic">
            Selecione um cliente para visualizar a topologia.
        </div>
        )}
      </div>

      <Modal
  isOpen={modalOpen}
  onRequestClose={() => setModalOpen(false)}
  contentLabel="Detalhes"
  className="bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-100 w-full max-w-md mx-auto mt-32 p-6 rounded-2xl shadow-2xl border dark:border-zinc-700 outline-none"
  overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4 z-50"
>
  <h2 className="text-lg font-bold mb-4">Detalhes</h2>

  {selectedItem && (
    <div className="text-sm space-y-2">
      {selectedItem.label && (
        <div><strong>Identificador:</strong> {selectedItem.label}</div>
      )}
      {selectedItem.nome && (
        <div><strong>Nome:</strong> {selectedItem.nome}</div>
      )}
      {selectedItem.tipo && (
        <div><strong>Tipo:</strong> {selectedItem.tipo}</div>
      )}
      {selectedItem.descricao && (
        <div><strong>Descrição:</strong> {selectedItem.descricao}</div>
      )}
      {selectedItem.rota && (
        <div><strong>Rota:</strong> {selectedItem.rota}</div>
      )}
      {selectedItem.valor_alarme && (
        <div><strong>Valor de Alarme:</strong> {selectedItem.valor_alarme}</div>
      )}
      {selectedItem.email && (
        <div><strong>Email:</strong> {selectedItem.email}</div>
      )}
      {selectedItem.localizacao && (
        <div><strong>Localização:</strong> {selectedItem.localizacao}</div>
      )}
      {selectedItem.cnpj && (
        <div><strong>CNPJ:</strong> {selectedItem.cnpj}</div>
      )}
    </div>
  )}

  <div className="text-right mt-6">
    <button
      onClick={() => setModalOpen(false)}
      className="bg-gray-300 dark:bg-zinc-600 hover:bg-gray-400 dark:hover:bg-zinc-500 px-4 py-2 rounded text-sm text-black dark:text-white transition"
    >
      Fechar
    </button>
  </div>
</Modal>
    </DashboardLayout>
  );
}
