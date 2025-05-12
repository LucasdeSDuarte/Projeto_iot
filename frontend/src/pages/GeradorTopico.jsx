import React, { useState, useEffect } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import AutoSuggestDropdownFlex from '../componente/dropdown/AutoSuggestDropdownFlex';
import api from '../services/api';
import TemplatePreview from '../componente/template/TemplatePreview';
import TemplateDownloader from '../componente/template/TemplateDownloader';

export default function GeradorTopico() {
  const [clientes, setClientes] = useState([]);
  const [torres, setTorres] = useState([]);
  const [appliances, setAppliances] = useState([]);
  const [sensores, setSensores] = useState([]);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [torreSelecionada, setTorreSelecionada] = useState(null);
  const [applianceSelecionado, setApplianceSelecionado] = useState(null);
  const [sensorSelecionado, setSensorSelecionado] = useState(null);

  const [topico, setTopico] = useState('');
  const [payload, setPayload] = useState('');

  useEffect(() => {
    api.get('/clientes-lista').then(res => {
      const lista = Array.isArray(res.data) ? res.data : res.data.data || [];
      const formatado = lista.map(c => ({ value: c.id, label: c.nome }));
      setClientes(formatado);
    });
  }, []);

  useEffect(() => {
    if (clienteSelecionado?.value) {
      api.get(`/torres-lista?cliente_id=${clienteSelecionado.value}`).then(res => {
        const lista = Array.isArray(res.data) ? res.data : res.data.data || [];
        const formatado = lista.map(t => ({ value: t.id, label: t.nome }));
        setTorres(formatado);
      });
    } else {
      setTorres([]);
    }
    setTorreSelecionada(null);
    setApplianceSelecionado(null);
    setSensorSelecionado(null);
  }, [clienteSelecionado]);

  useEffect(() => {
    if (torreSelecionada?.value) {
      api.get(`/appliances-lista?torre_id=${torreSelecionada.value}`).then(res => {
        const lista = Array.isArray(res.data) ? res.data : res.data.data || [];
        const formatado = lista.map(a => ({ value: a.id, label: a.tipo }));
        setAppliances(formatado);
      });
    } else {
      setAppliances([]);
    }
    setApplianceSelecionado(null);
    setSensorSelecionado(null);
  }, [torreSelecionada]);

  useEffect(() => {
    if (applianceSelecionado?.value) {
      api.get(`/sensores-lista?appliance_id=${applianceSelecionado.value}`).then(res => {
        const lista = Array.isArray(res.data) ? res.data : res.data.data || [];
        const formatado = lista.map(s => ({
          value: s.id,
          label: s.identificador,
          tipo: s.tipo
        }));
        setSensores(formatado);
      });
    } else {
      setSensores([]);
    }
    setSensorSelecionado(null);
  }, [applianceSelecionado]);

  useEffect(() => {
    const sensor = sensores.find(s => s.value === sensorSelecionado?.value);
    if (clienteSelecionado && torreSelecionada && sensor) {
      const tipoSensor = sensor.tipo.toLowerCase();
      const topicoFinal = `torres/cliente${clienteSelecionado.value}/torre${torreSelecionada.value}/${tipoSensor}`;
      const payloadJson = {
        cliente_id: `cliente${clienteSelecionado.value}`,
        torre_id: `torre${torreSelecionada.value}`,
        sensor_tipo: tipoSensor,
        valor: 0.0,
        timestamp: new Date().toISOString()
      };
      setTopico(topicoFinal);
      setPayload(JSON.stringify(payloadJson, null, 2));
    } else {
      setTopico('');
      setPayload('');
    }
  }, [clienteSelecionado, torreSelecionada, sensorSelecionado, sensores]);

  const mostrarToast = (mensagem, tipo = 'success') => {
    const toast = document.createElement('div');
    toast.innerText = mensagem;
    toast.className = `
      fixed bottom-6 right-6 z-50 px-4 py-2 rounded-md shadow-lg text-white text-sm
      ${tipo === 'success' ? 'bg-green-600' : 'bg-red-600'}
      animate-fadeInUp
    `;
    toast.style.animation = 'fadeInUp 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const copiar = (texto) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(texto)
        .then(() => mostrarToast("Copiado com sucesso!"))
        .catch(() => mostrarToast("Erro ao copiar!", 'error'));
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        mostrarToast("Copiado com sucesso!");
      } catch {
        mostrarToast("Erro ao copiar!", 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <DashboardLayout tipo="colaborador">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Gerar Tópico MQTT e Payload</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AutoSuggestDropdownFlex label="Cliente" options={clientes} selected={clienteSelecionado} setSelected={setClienteSelecionado} />
        <AutoSuggestDropdownFlex label="Torre" options={torres} selected={torreSelecionada} setSelected={setTorreSelecionada} />
        <AutoSuggestDropdownFlex label="Dispositivo" options={appliances} selected={applianceSelecionado} setSelected={setApplianceSelecionado} />
        <AutoSuggestDropdownFlex label="Sensor" options={sensores} selected={sensorSelecionado} setSelected={setSensorSelecionado} />
      </div>

      {topico && (
        <div className="mb-6">
          <label className="block font-semibold text-gray-800 dark:text-white mb-2">📡 Tópico MQTT:</label>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 dark:bg-zinc-800 p-2 rounded text-sm">{topico}</code>
            <button onClick={() => copiar(topico)} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">📋 Copiar</button>
          </div>
        </div>
      )}

      {payload && (
        <div className="mb-6">
          <label className="block font-semibold text-gray-800 dark:text-white mb-2">📄 Payload JSON:</label>
          <div className="relative">
            <textarea
              readOnly
              value={payload}
              rows={8}
              className="w-full p-4 bg-gray-100 dark:bg-zinc-800 rounded font-mono text-sm text-gray-900 dark:text-white"
            />
            <button onClick={() => copiar(payload)} className="absolute top-2 right-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">📋</button>
          </div>
        </div>
      )}

      {topico && sensorSelecionado?.tipo && clienteSelecionado && torreSelecionada && (
        <>
          <TemplatePreview
            tipoSensor={sensorSelecionado.tipo}
            clienteId={clienteSelecionado.value}
            torreId={torreSelecionada.value}
            sensorTipo={sensorSelecionado.tipo}
            copiar={copiar}
          />
          <TemplateDownloader
            tipoSensor={sensorSelecionado.tipo}
            clienteId={clienteSelecionado.value}
            torreId={torreSelecionada.value}
            sensorTipo={sensorSelecionado.tipo}
          />
        </>
      )}
    </DashboardLayout>
  );
}
