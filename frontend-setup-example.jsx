// Ejemplo de cómo usar el cliente API en componentes React
// Guardar como: src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import api from '../api/client';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      setError(null);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const registro = async (nombre, apellido, email, password) => {
    try {
      setLoading(true);
      await api.registro(nombre, apellido, email, password);
      // El usuario necesita hacer login después
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      await api.login(email, password);
      await fetchUser();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    registro,
    login,
    logout,
    isAuthenticated: !!user,
  };
}

// ---

// Ejemplo de componente LoginForm
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(formData.email, formData.password);
    if (success) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

// ---

// Ejemplo de componente Pomodoro
import React, { useState, useEffect } from 'react';
import api from '../api/client';

export function PomodoroTimer() {
  const [sesion, setSesion] = useState(null);
  const [tiempo, setTiempo] = useState(0);
  const [activo, setActivo] = useState(false);

  const iniciarSesion = async () => {
    const nueva = await api.crearSesionPomodoro('work', 25);
    setSesion(nueva);
    setActivo(true);
  };

  useEffect(() => {
    let intervalo;
    if (activo && sesion) {
      intervalo = setInterval(() => {
        setTiempo((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [activo, sesion]);

  const completarSesion = async () => {
    if (sesion) {
      await api.actualizarSesion(sesion.id, 'completada', tiempo);
      setActivo(false);
    }
  };

  const formatoTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div>
      <h1>Pomodoro</h1>
      {sesion ? (
        <>
          <div style={{ fontSize: '2em' }}>{formatoTiempo(tiempo)}</div>
          <button onClick={() => setActivo(!activo)}>
            {activo ? 'Pausar' : 'Reanudar'}
          </button>
          <button onClick={completarSesion}>Completar</button>
        </>
      ) : (
        <button onClick={iniciarSesion}>Iniciar Sesión</button>
      )}
    </div>
  );
}

// ---

// Ejemplo de componente Notas
import React, { useState, useEffect } from 'react';
import api from '../api/client';

export function NotasApp() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');

  useEffect(() => {
    cargarNotas();
  }, []);

  const cargarNotas = async () => {
    const resultado = await api.listarNotas();
    setNotas(resultado);
  };

  const crearNota = async () => {
    if (titulo.trim()) {
      await api.crearNota(titulo, contenido, null, '#FFE5B4');
      setTitulo('');
      setContenido('');
      cargarNotas();
    }
  };

  const eliminarNota = async (notaId) => {
    await api.eliminarNota(notaId);
    cargarNotas();
  };

  return (
    <div>
      <h1>Mis Notas</h1>
      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <textarea
        placeholder="Contenido"
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
      />
      <button onClick={crearNota}>Guardar Nota</button>

      <div>
        {notas.map((nota) => (
          <div key={nota.id} style={{ marginTop: '1em', padding: '1em', border: '1px solid #ccc' }}>
            <h3>{nota.titulo}</h3>
            <p>{nota.contenido}</p>
            <button onClick={() => eliminarNota(nota.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
