import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../componente/DashboardLayout';
import AutoSuggestDropdownFlex from '../componente/dropdown/AutoSuggestDropdownFlex';
import api from '../services/api';
import TemplatePreview from '../componente/template/TemplatePreview';
import TemplateDownloader from '../componente/template/TemplateDownloader';

// Criando uma versão modificada do AutoSuggestDropdownFlex com um método de limpar exposto
const EnhancedAutoSuggestDropdownFlex = React.forwardRef(({
  label,
  options = [],
  selected,
  setSelected,
  placeholder = 'Selecione...'
}, ref) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selected) {
      setInputValue(selected.label);
    } else {
      setInputValue('');
    }
  }, [selected]);

  useEffect(() => {
    if (!inputValue) {
      setFilteredOptions([]);
      setShowOptions(false);
      return;
    }
    const filtered = options.filter((opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase().trim())
    );
    setFilteredOptions(filtered);
    setShowOptions(true);
  }, [inputValue, options]);

  const handleSelect = (option) => {
    setSelected(option);
    setInputValue(option.label);
    setShowOptions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowOptions(false), 100);
  };

  // Expõe um método para limpar o input
  React.useImperativeHandle(ref, () => ({
    clearInput: () => {
      setInputValue('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }));

  return (
    <div className="w-full relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!e.target.value) setSelected(null);
          }}
          onFocus={() => setShowOptions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
        />
        {showOptions && filteredOptions.length > 0 && (
          <ul className="absolute z-50 bg-white dark:bg-zinc-700 text-gray-800 dark:text-white mt-1 w-full border border-gray-300 dark:border-gray-600 rounded-md max-h-60 overflow-auto shadow-lg">
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-600 cursor-pointer"
                onMouseDown={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

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
  const [cadastrando, setCadastrando] = useState(false);
  
  // Refs para os componentes de dropdown
  const clienteRef = useRef(null);
  const torreRef = useRef(null);
  const applianceRef = useRef(null);
  const sensorRef = useRef(null);

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

  const limparSelecao = () => {
    // Limpa todos os estados de seleção
    setClienteSelecionado(null);
    setTorreSelecionada(null);
    setApplianceSelecionado(null);
    setSensorSelecionado(null);
    
    // Limpa os resultados
    setTopico('');
    setPayload('');
    
    // Limpa os inputs usando as refs
    if (clienteRef.current) clienteRef.current.clearInput();
    if (torreRef.current) torreRef.current.clearInput();
    if (applianceRef.current) applianceRef.current.clearInput();
    if (sensorRef.current) sensorRef.current.clearInput();
    
    // Notifica o usuário
    mostrarToast("Seleções limpas com sucesso!");
  };

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

  // Função para cadastrar o tópico no banco de dados
  const cadastrarTopico = async () => {
  if (!topico || !sensorSelecionado || !applianceSelecionado) {
    mostrarToast("Selecione todos os campos para cadastrar o tópico.", "error");
    return;
  }

  try {
    setCadastrando(true);

    // (Opcional) Pode remover esse GET se não estiver usando os dados
    // const applianceResponse = await api.get(`/appliances/${applianceSelecionado.value}`);
    // const applianceData = applianceResponse?.data?.data || {};

    // Atualiza somente o campo rota do appliance
    const response = await api.put(`/appliances/${applianceSelecionado.value}/topico`, {
      rota: topico,
    });

    if (response.status === 200) {
      mostrarToast("Tópico cadastrado com sucesso!");
    } else {
      mostrarToast("Erro ao cadastrar tópico.", "error");
    }
  } catch (error) {
    console.error("Erro ao cadastrar tópico:", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
    mostrarToast("Erro ao cadastrar tópico: " + errorMessage, "error");
  } finally {
    setCadastrando(false);
  }
};

  return (
    <DashboardLayout tipo="colaborador">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-white">Gerar Tópico MQTT e Payload</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <EnhancedAutoSuggestDropdownFlex 
          ref={clienteRef}
          label="Cliente" 
          options={clientes} 
          selected={clienteSelecionado} 
          setSelected={setClienteSelecionado} 
        />
        <EnhancedAutoSuggestDropdownFlex 
          ref={torreRef}
          label="Torre" 
          options={torres} 
          selected={torreSelecionada} 
          setSelected={setTorreSelecionada} 
        />
        <EnhancedAutoSuggestDropdownFlex 
          ref={applianceRef}
          label="Dispositivo" 
          options={appliances} 
          selected={applianceSelecionado} 
          setSelected={setApplianceSelecionado} 
        />
        <EnhancedAutoSuggestDropdownFlex 
          ref={sensorRef}
          label="Sensor" 
          options={sensores} 
          selected={sensorSelecionado} 
          setSelected={setSensorSelecionado} 
        />
      </div>
      
      <div className="flex justify-end mb-6">
        <button 
          onClick={limparSelecao}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow-md flex items-center gap-2 transition-colors duration-200"
          disabled={!clienteSelecionado && !torreSelecionada && !applianceSelecionado && !sensorSelecionado}
          title="Limpar todas as seleções"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Limpar Seleção
        </button>
      </div>
      {topico && (
        <div className="mb-6">
          <label className="block font-semibold text-gray-800 dark:text-white mb-2">📡 Tópico MQTT:</label>
          <div className="flex items-center gap-2">
            <code className="bg-gray-100 dark:bg-zinc-800 p-2 rounded text-sm flex-grow">{topico}</code>
            <button 
              onClick={() => copiar(topico)} 
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm flex-shrink-0"
            >
              📋 Copiar
            </button>
            <button 
              onClick={cadastrarTopico} 
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex-shrink-0 flex items-center gap-1"
              title="Para monitoramento do sensor é necessário cadastramento do tópico"
              disabled={cadastrando}
            >
              {cadastrando ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              Cadastrar Tópico
            </button>
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