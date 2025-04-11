import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ClientSAPDropdown from '../dropdown/ClientSAPDropdown';

export default function FormUsuario({ initialData = {}, onSubmit, onCancel }) {
  const [nome, setNome] = useState(initialData?.nome || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [login, setLogin] = useState(initialData?.login || '');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ativo, setAtivo] = useState(
    initialData?.ativo === 1 || initialData?.ativo === true
  );

  // Sempre que houver alteração em initialData, limpa a senha
  useEffect(() => {
    setSenha('');
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      nome,
      email,
      login,
      ativo,
    };

    if (senha.trim() !== '') {
      payload.senha = senha;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 dark:text-white">
      <h2 className="text-xl font-bold mb-4">
        {initialData?.id ? 'Editar Cliente' : 'Novo Cliente'}
      </h2>

      {/* Campo de Nome usando o componente auto-sugestivo para PN */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Nome
        </label>
        <ClientSAPDropdown
          value={nome}
          onChange={setNome}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Login
        </label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
          required
        />
      </div>

      {/* Campo de Senha */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Senha
        </label>
        {initialData?.id && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Deixe em branco para manter a senha atual.
          </div>
        )}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md 
                       bg-white dark:bg-zinc-800 text-gray-800 dark:text-white"
            placeholder={initialData?.id ? 'Nova senha (opcional)' : 'Digite a senha'}
            required={!initialData?.id && senha === ''}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-green-500"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Campo Ativo */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
        />
        <label className="text-sm text-gray-700 dark:text-gray-300">Ativo</label>
      </div>

      {/* Botões de Cancelar e Salvar */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white 
                     rounded-md hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
        >
          Salvar
        </button>
      </div>
    </form>
  );
}
