import React from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

export default function TopologiaFlow({ data }) {
  const nodes = [];
  const edges = [];

  data.forEach((cliente, i) => {
    const clienteId = `cliente-${cliente.id}`;
    nodes.push({
      id: clienteId,
      type: 'input',
      data: { label: `👤 ${cliente.nome}` },
      position: { x: i * 300, y: 0 },
    });

    cliente.torres?.forEach((torre, j) => {
      const torreId = `torre-${torre.id}`;
      nodes.push({
        id: torreId,
        data: { label: `🏢 ${torre.nome}` },
        position: { x: i * 300, y: 100 + j * 150 },
      });
      edges.push({ id: `e-${clienteId}-${torreId}`, source: clienteId, target: torreId });

      torre.appliances?.forEach((appliance, k) => {
        const applianceId = `appliance-${appliance.id}`;
        nodes.push({
          id: applianceId,
          data: { label: `🔌 ${appliance.nome}` },
          position: { x: i * 300, y: 200 + j * 150 + k * 100 },
        });
        edges.push({ id: `e-${torreId}-${applianceId}`, source: torreId, target: applianceId });

        appliance.sensores?.forEach((sensor, s) => {
          const sensorId = `sensor-${sensor.id}`;
          nodes.push({
            id: sensorId,
            data: { label: `📟 ${sensor.tipo} (${sensor.identificador})` },
            position: { x: i * 300, y: 300 + j * 150 + k * 100 + s * 80 },
          });
          edges.push({ id: `e-${applianceId}-${sensorId}`, source: applianceId, target: sensorId });

          sensor.alarmes?.forEach((alarme, a) => {
            const alarmeId = `alarme-${alarme.id}`;
            nodes.push({
              id: alarmeId,
              data: { label: `🚨 ${alarme.descricao}` },
              position: { x: i * 300, y: 380 + j * 150 + k * 100 + s * 80 + a * 60 },
              style: { background: '#fecaca', border: '1px solid red' },
            });
            edges.push({ id: `e-${sensorId}-${alarmeId}`, source: sensorId, target: alarmeId });
          });
        });
      });
    });
  });

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
