import React, { useEffect, useRef, useState } from 'react';
import VanillaTilt from 'vanilla-tilt';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ParticlesBackground from '../componente/ParticlesBackground';
import axios from 'axios';
import { setAuthToken } from '../services/api';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const tiltRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 10,
        speed: 400,
        glare: true,
        'max-glare': 0.2,
        scale: 1.02,
      });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!login || !senha) {
      setErro('Preencha login e senha.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API}/login`, { login, senha });

      const { token, tipo } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ tipo }));
      setAuthToken(token);

      navigate(tipo === 'cliente' ? '/cliente/dashboard' : '/admin/dashboard');
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 'Login inválido ou erro na autenticação.';
      setErro(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <ParticlesBackground />

      <div className="min-h-screen flex items-center justify-center px-4 relative z-10">
        <div
          ref={tiltRef}
          className="bg-zinc-900 bg-opacity-90 p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-md border border-green-500"
        >
          <h2 className="text-3xl font-bold text-center mb-6 tracking-wide text-white">
            Acesso <span className="text-green-400">IoT</span>
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login" className="block mb-1 font-medium text-sm text-white">
                Login
              </label>
              <input
                id="login"
                autoFocus
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite seu login"
                className="w-full px-4 py-2 rounded-md bg-black border border-green-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block mb-1 font-medium text-sm text-white">
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-2 pr-10 rounded-md bg-black border border-green-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-green-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

            <div className="h-[70px] flex items-center justify-center border border-dashed border-gray-600 rounded-md text-gray-500 text-sm">
              Aqui será exibido o Google reCAPTCHA
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 bg-green-500 text-black font-semibold rounded-md hover:bg-green-400 transition duration-300 disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative group inline-block">
              <span className="text-sm text-gray-400 cursor-pointer underline decoration-dotted">
                Mais informações
              </span>
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 bg-black text-gray-300 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 z-10">
                <strong className="text-green-400">Sistema de monitoramento</strong><br />
                Caso esteja com problemas de login, entre em contato com o <strong>departamento comercial</strong>.
              </div>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ALPINA EQUIPAMENTOS INDUSTRIAIS
          </div>
        </div>
      </div>
    </div>
  );
}
