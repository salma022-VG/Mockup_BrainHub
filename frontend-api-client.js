// Archivo para usar en el frontend React
// Guardar como: src/api/client.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class BrainHubAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('access_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('access_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('access_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Error en la solicitud');
    }

    return data;
  }

  // Auth
  async registro(nombre, apellido, email, password) {
    return this.request('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, apellido, email, password }),
    });
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(response.access_token);
    return response;
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  // Pomodoro
  async crearSesionPomodoro(modo, duracion_minutos) {
    return this.request('/api/pomodoro/sesiones', {
      method: 'POST',
      body: JSON.stringify({ modo, duracion_minutos }),
    });
  }

  async listarSesiones(limite = 10) {
    return this.request(`/api/pomodoro/sesiones?limite=${limite}`);
  }

  async obtenerSesion(sesionId) {
    return this.request(`/api/pomodoro/sesiones/${sesionId}`);
  }

  async actualizarSesion(sesionId, estado, tiempo_transcurrido) {
    return this.request(`/api/pomodoro/sesiones/${sesionId}`, {
      method: 'PUT',
      body: JSON.stringify({ estado, tiempo_transcurrido }),
    });
  }

  async eliminarSesion(sesionId) {
    return this.request(`/api/pomodoro/sesiones/${sesionId}`, {
      method: 'DELETE',
    });
  }

  // Notas
  async crearNota(titulo, contenido, etiqueta_id, color) {
    return this.request('/api/notas', {
      method: 'POST',
      body: JSON.stringify({ titulo, contenido, etiqueta_id, color }),
    });
  }

  async listarNotas(limite = 50) {
    return this.request(`/api/notas?limite=${limite}`);
  }

  async obtenerNota(notaId) {
    return this.request(`/api/notas/${notaId}`);
  }

  async actualizarNota(notaId, titulo, contenido, etiqueta_id, color) {
    return this.request(`/api/notas/${notaId}`, {
      method: 'PUT',
      body: JSON.stringify({ titulo, contenido, etiqueta_id, color }),
    });
  }

  async eliminarNota(notaId) {
    return this.request(`/api/notas/${notaId}`, {
      method: 'DELETE',
    });
  }

  // Comunidad
  async crearPublicacion(categoria_id, titulo, contenido) {
    return this.request('/api/comunidad/publicaciones', {
      method: 'POST',
      body: JSON.stringify({ categoria_id, titulo, contenido }),
    });
  }

  async listarPublicaciones(limite = 20, offset = 0) {
    return this.request(`/api/comunidad/publicaciones?limite=${limite}&offset=${offset}`);
  }

  async obtenerPublicacion(pubId) {
    return this.request(`/api/comunidad/publicaciones/${pubId}`);
  }

  async darLike(pubId) {
    return this.request(`/api/comunidad/publicaciones/${pubId}/like`, {
      method: 'POST',
    });
  }

  async eliminarPublicacion(pubId) {
    return this.request(`/api/comunidad/publicaciones/${pubId}`, {
      method: 'DELETE',
    });
  }
}

export default new BrainHubAPI();
