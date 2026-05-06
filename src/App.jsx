import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CIRCUMFERENCE = 2 * Math.PI * 98;

const AI_SYSTEM = {
  mental: `Eres Orion, una psicóloga académica empática y cálida especializada en salud mental estudiantil.
Hablas en español, eres comprensiva, nunca juzgas. Tu objetivo es ayudar a estudiantes con:
- Ansiedad académica, estrés por exámenes, síndrome del impostor
- Gestión emocional, técnicas de mindfulness y respiración
- Motivación, autoestima y autocuidado
- Burnout estudiantil y cómo prevenirlo
- Equilibrio vida-estudio
Cuando alguien exprese angustia seria, recomienda buscar ayuda profesional con calidez.
Responde de forma concisa (máx 4 oraciones), usa emojis ocasionalmente para dar calidez. Nunca seas clínico ni frío.`,
  estudio: `Eres Orion, una tutora experta en neurociencia del aprendizaje y técnicas de estudio avanzadas.
Hablas en español, eres entusiasta y motivadora. Tu especialidad:
- Técnicas: Feynman, SQ3R, mapas mentales, espaciado, recuperación activa, intercalado
- Pomodoro avanzado: cómo adaptarlo según el tipo de tarea
- Memoria: curva del olvido de Ebbinghaus, repetición espaciada (Anki)
- Lectura eficiente, notas Cornell, síntesis visual
- Planificación de estudio, gestión del tiempo académico
Responde de forma práctica y concisa (máx 4 oraciones), con pasos claros cuando corresponda. Usa emojis educativos.`,
  trabajos: `Eres Orion, una revisora académica constructiva y alentadora.
Hablas en español. Cuando recibes un trabajo compartido por un estudiante, das retroalimentación en 3 dimensiones:
1. 💚 Fortalezas: qué está bien hecho
2. 🔧 Áreas de mejora: qué se puede potenciar (de forma constructiva, no crítica)
3. 🚀 Siguiente paso concreto: una acción específica para mejorar
Sé conciso (máx 5 oraciones en total), empático, y siempre termina con una frase motivadora.
Si no tienes suficiente contexto del trabajo, pide más detalles amablemente.`
};

const SUGGESTIONS_BY_MODE = {
  mental: ['Me siento agobiado', 'Tengo ansiedad por exámenes', 'No duermo bien', 'Síndrome del impostor', 'Técnica de respiración'],
  estudio: ['Técnica Feynman', 'Cómo usar Anki', 'Estudiar sin distraerme', 'Memorizar mejor', 'Planificar mi semana'],
  trabajos: ['Revisar último trabajo', '¿Cómo mejorar mi ensayo?', 'Feedback sobre mi proyecto', 'Revisar mi presentación', 'Evalúa mi trabajo de hoy'],
};

const AVATAR_GRADIENTS = [
  ['#7c3aed', '#e040a8'], ['#06b6d4', '#7c3aed'], ['#e040a8', '#ff6b9d'],
  ['#0ea5e9', '#e040a8'], ['#22d3ee', '#06b6d4'], ['#9f55ff', '#22d3ee'],
];

const CAT_COLORS = {
  trabajo: { bg: 'rgba(124,58,237,0.2)', color: '#9f55ff', border: 'rgba(124,58,237,0.35)' },
  proyecto: { bg: 'rgba(6,182,212,0.2)', color: '#22d3ee', border: 'rgba(6,182,212,0.35)' },
  recurso: { bg: 'rgba(245,158,11,0.2)', color: '#0ea5e9', border: 'rgba(245,158,11,0.35)' },
  logro: { bg: 'rgba(255,215,0,0.15)', color: '#ffd700', border: 'rgba(255,215,0,0.3)' },
  pregunta: { bg: 'rgba(224,64,168,0.2)', color: '#e040a8', border: 'rgba(224,64,168,0.35)' },
  inspiracion: { bg: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'rgba(255,255,255,0.2)' },
};
const CAT_LABELS = {
  trabajo: '💻 Trabajo', proyecto: '🚀 Proyecto', recurso: '📚 Recurso',
  logro: '🏆 Logro', pregunta: '❓ Pregunta', inspiracion: '✨ Inspiración',
};
const TAG_LABELS_MAP = {
  desarrollo: '💻 Desarrollo', diseño: '🎨 Diseño', investigacion: '🔬 Investigación',
  escritura: '✍️ Escritura', estudio: '📚 Estudio', otro: '📁 Otro',
};

const SPRITE_IDLE = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 4, 1, 1, 4, 1, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 0, 0, 1, 0, 0],
];
const SPRITE_RUN = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 3, 3, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 4, 1, 1, 4, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 0, 1, 0, 0, 1, 0, 1],
];
const SPRITE_CHEER = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 1, 2, 5, 5, 2, 1, 0],
  [0, 1, 2, 2, 2, 2, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [1, 0, 0, 1, 1, 0, 0, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 0, 1, 0],
];
const SPRITE_PALETTE = { 0: 'transparent', 1: '#0ea5e9', 2: '#38bdf8', 3: '#e2eaf8', 4: '#2563eb', 5: '#7c3aed' };

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function relativeTime(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'Ahora mismo';
  if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
  if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
  return `Hace ${Math.floor(diff / 86400000)}d`;
}
function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}
function detectType(file) {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type === 'application/pdf') return 'pdf';
  return 'text';
}

export default function App() {
  // ── Auth ──
  const [isLogged, setIsLogged] = useState(() => localStorage.getItem('ff_user_logged') === 'true');
  const [userName, setUserName] = useState(() => localStorage.getItem('ff_user_name') || '');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('ff_user_email') || '');
  const [loginOpen, setLoginOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', password2: '' });

  // ── Tabs ──
  const [activeTab, setActiveTab] = useState('timer');

  // ── Toast ──
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef(null);
  const showToast = useCallback((msg) => {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  }, []);

  // ── Settings ──
  const [appSettings, setAppSettings] = useState(() => ({
    sounds: true, noteSounds: true, autoAdvance: false, aiAuto: true,
    work: 25, short: 5, long: 15, name: '', claudeApiKey: '',
    ...JSON.parse(localStorage.getItem('ff_settings') || '{}'),
  }));
  const saveSetting = (key, value) => {
    setAppSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem('ff_settings', JSON.stringify(next));
      return next;
    });
  };

  // ── Timer ──
  const [currentMode, setCurrentMode] = useState('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalTime, setTotalTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);
  const [workMin, setWorkMin] = useState(appSettings.work || 25);
  const [shortMin, setShortMin] = useState(appSettings.short || 5);
  const [longMin, setLongMin] = useState(appSettings.long || 15);
  const intervalRef = useRef(null);
  const focusIntervalRef = useRef(null);
  const playBtnRef = useRef(null);

  // ── Notes ──
  const [notes, setNotes] = useState([
    { id: 1, text: 'Revisar informe del proyecto', tag: 'work', done: false },
    { id: 2, text: 'Preparar presentación de ventas', tag: 'work', done: false },
    { id: 3, text: 'Investigar nuevas herramientas de diseño', tag: 'idea', done: true },
  ]);
  const [noteInput, setNoteInput] = useState('');
  const [tagSelect, setTagSelect] = useState('work');

  // ── AI ──
  const [aiMode, setAiMode] = useState('mental');
  const [aiHistory, setAiHistory] = useState([]);
  const [spriteMessage, setSpriteMessage] = useState('');
  const [spriteMessageTime, setSpriteMessageTime] = useState(null);
  const spritePhrases = [
    '¡Hola! ¿Necesitas ayuda? 🐈‍⬛',
    'Estoy aquí para ti 💚',
    '¡Vamos a completar un Pomodoro! 🍅',
    'Sigue adelante, ¡tú puedes! 💪',
    'Tómate un descanso, lo necesitas',
    '¡Excelente trabajo! 🌟',
    '¿Cuál es tu meta hoy?',
    'Recuerda: el autocuidado es importante 🌱',
    '¡Enfócate en el presente! 🎯',
    'La consistencia es la clave 🔑',
  ];
  const [aiMessages, setAiMessages] = useState([
    {
      type: 'ai',
      html: '¡Hola! Soy <strong>Orion</strong>, tu asistente de bienestar académico 💚<br><br>Puedo ayudarte con tu <strong>salud mental</strong> como estudiante, enseñarte <strong>técnicas de estudio</strong> basadas en neurociencia, o <strong>revisar y opinar sobre los trabajos</strong> que la comunidad ha compartido.<br><br>¿Cómo te sientes hoy? 🌱',
      time: 'Ahora',
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const aiMessagesRef = useRef(null);

  // ── Files ──
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [fileTrayOpen, setFileTrayOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // ── Community ──
  const [allPosts, setAllPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [likedPosts, setLikedPosts] = useState(() => new Set(JSON.parse(localStorage.getItem('ff_liked') || '[]')));
  const [postNick, setPostNick] = useState(appSettings.name || '');
  const [postCategory, setPostCategory] = useState('trabajo');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [reviewBubbles, setReviewBubbles] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});

  // ── Stats / history / streak ──
  const [sessionHistory, setSessionHistory] = useState(() => JSON.parse(localStorage.getItem('ff_session_history') || '[]'));
  const [streakDays, setStreakDays] = useState(() => parseInt(localStorage.getItem('ff_streak') || '0', 10));
  const [dailyGoal, setDailyGoal] = useState(8);

  // ── Projects ──
  const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('ff_projects') || '[]'));
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projForm, setProjForm] = useState({ name: '', desc: '', tag: 'desarrollo', goal: 10, color: '#0ea5e9' });
  const [projTaskInput, setProjTaskInput] = useState('');

  // ── Pro modal ──
  const [proOpen, setProOpen] = useState(false);

  // ── Pixel canvas ──
  const pixelCanvasRef = useRef(null);
  const pixelParticles = useRef([]);
  const spriteCanvasRef = useRef(null);
  const spriteFrame = useRef(0);
  const spriteMode = useRef('idle');
  const [spriteLabel, setSpriteLabel] = useState({ text: 'FOCUS MODE', show: false });
  const [scorePopups, setScorePopups] = useState([]);

  // ── Audio ──
  const audioCtxRef = useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  };
  const playTone = (freq, type, start, dur, gainVal, ctx) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination); osc.type = type;
    osc.frequency.setValueAtTime(freq, start); g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start); osc.stop(start + dur);
  };
  const playFreqSweep = (a, b, type, start, dur, gainVal, ctx) => {
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination); osc.type = type;
    osc.frequency.setValueAtTime(a, start); osc.frequency.linearRampToValueAtTime(b, start + dur);
    g.gain.setValueAtTime(gainVal, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.start(start); osc.stop(start + dur);
  };
  const playNoise = (start, dur, gainVal, ctx) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < buf.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 800; filter.Q.value = 0.5;
    const g = ctx.createGain(); src.connect(filter); filter.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(gainVal, start); g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    src.start(start); src.stop(start + dur);
  };
  const sound = useCallback((kind) => {
    if (!appSettings.sounds && kind !== 'check' && kind !== 'add' && kind !== 'delete') return;
    if (!appSettings.noteSounds && (kind === 'check' || kind === 'add' || kind === 'delete')) return;
    try {
      const ctx = getAudioCtx(); const t = ctx.currentTime;
      if (kind === 'start') {
        const mario = [[329.63, 0.15, 0.15], [329.63, 0.3, 0.15], [329.63, 0.45, 0.15], [261.63, 0.6, 0.15], [329.63, 0.75, 0.15], [392, 0.9, 0.3]];
        mario.forEach(([freq, time, dur]) => playTone(freq, 'square', t + time, dur, 0.3, ctx));
      } else if (kind === 'pause') {
        const mario = [[392, 0.15, 0.2], [329.63, 0.35, 0.2], [261.63, 0.55, 0.3]];
        mario.forEach(([freq, time, dur]) => playTone(freq, 'square', t + time, dur, 0.25, ctx));
      } else if (kind === 'reset') {
        const mario = [[196, 0.1, 0.2], [261.63, 0.3, 0.2], [329.63, 0.5, 0.4]];
        mario.forEach(([freq, time, dur]) => playTone(freq, 'square', t + time, dur, 0.25, ctx));
      } else if (kind === 'complete') {
        const mario = [
          [329.63, 0.15, 0.15],
          [329.63, 0.3, 0.15],
          [329.63, 0.45, 0.15],
          [261.63, 0.6, 0.15],
          [329.63, 0.75, 0.15],
          [392, 0.9, 0.3],
          [261.63, 1.2, 0.3],
          [196, 1.5, 0.15],
          [329.63, 1.65, 0.15],
          [392, 1.8, 0.15],
          [440, 1.95, 0.15],
          [493.88, 2.1, 0.15],
          [523.25, 2.25, 0.3],
          [523.25, 2.55, 0.15],
          [523.25, 2.7, 0.15],
        ];
        mario.forEach(([freq, time, dur]) => playTone(freq, 'square', t + time, dur, 0.3, ctx));
      } else if (kind === 'skip') {
        const mario = [[523.25, 0.1, 0.15], [493.88, 0.25, 0.15], [440, 0.4, 0.15], [392, 0.55, 0.15], [329.63, 0.7, 0.3]];
        mario.forEach(([freq, time, dur]) => playTone(freq, 'square', t + time, dur, 0.3, ctx));
      } else if (kind === 'check') {
        playTone(880, 'square', t, 0.06, 0.2, ctx);
        playTone(1108, 'square', t + 0.06, 0.06, 0.18, ctx);
        playTone(1318, 'square', t + 0.12, 0.1, 0.15, ctx);
      } else if (kind === 'delete') {
        playFreqSweep(400, 150, 'square', t, 0.12, 0.2, ctx);
        playNoise(t, 0.08, 0.08, ctx);
      } else if (kind === 'add') {
        playFreqSweep(600, 1400, 'square', t, 0.07, 0.28, ctx);
        playTone(1400, 'square', t + 0.07, 0.1, 0.2, ctx);
      } else if (kind === 'aiSend') {
        playFreqSweep(200, 1800, 'sine', t, 0.15, 0.15, ctx);
        playTone(1800, 'sine', t + 0.15, 0.06, 0.1, ctx);
      } else if (kind === 'aiReceive') {
        playTone(523, 'sine', t, 0.06, 0.12, ctx);
        playTone(659, 'sine', t + 0.07, 0.06, 0.1, ctx);
        playTone(784, 'sine', t + 0.13, 0.1, 0.1, ctx);
      } else if (kind === 'speak') {
        const speak = [[392, 0.1, 0.12], [523.25, 0.22, 0.12], [659.25, 0.34, 0.15]];
        speak.forEach(([freq, time, dur]) => playTone(freq, 'triangle', t + time, dur, 0.25, ctx));
        playNoise(t + 0.49, 0.08, 0.06, ctx);
      }
    } catch (e) {}
  }, [appSettings.sounds, appSettings.noteSounds]);

  // ── Stars (one-off init) ──
  const stars = useMemo(() => {
    const colors = ['rgba(56,189,248,0.9)', 'rgba(37,99,235,0.8)', 'rgba(14,165,233,0.9)', 'rgba(124,58,237,0.7)', 'rgba(103,232,249,0.8)'];
    return Array.from({ length: 70 }, (_, i) => {
      const size = 1.5 + Math.random() * 3;
      return {
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: colors[Math.floor(Math.random() * colors.length)],
          '--d': `${3 + Math.random() * 5}s`,
          '--delay': `${Math.random() * 7}s`,
          '--op': `${0.4 + Math.random() * 0.5}`,
          '--mx': `${-20 + Math.random() * 40}px`,
          '--my': `${-30 + Math.random() * -30}px`,
        },
      };
    });
  }, []);

  const dustParticles = useMemo(() => {
    const dustColors = ['#38bdf8', '#0ea5e9', '#2563eb', '#7c3aed', '#67e8f9', '#60a5fa'];
    return Array.from({ length: 40 }, (_, i) => {
      const sz = [2, 3, 3, 4, 3, 2][Math.floor(Math.random() * 6)];
      return {
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${80 + Math.random() * 20}%`,
          '--sz': `${sz}px`,
          '--col': dustColors[Math.floor(Math.random() * dustColors.length)],
          '--dur': `${7 + Math.random() * 12}s`,
          '--del': `${Math.random() * 10}s`,
          '--op': `${0.25 + Math.random() * 0.45}`,
          '--dy': `${-(150 + Math.random() * 300)}px`,
          '--dx': `${-40 + Math.random() * 80}px`,
        },
      };
    });
  }, []);

  // ── Helpers ──
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ── Title sync ──
  useEffect(() => {
    document.title = `${formatTime(timeLeft)} · BrainHub`;
  }, [timeLeft]);

  // ── Login modal init ──
  useEffect(() => {
    if (!isLogged) setLoginOpen(true);
  }, [isLogged]);

  // ── Update completedTasks stat ──
  const completedTasksCount = notes.filter((n) => n.done).length;

  // ── Stats: focus formatted ──
  const focusFmt = useMemo(() => {
    const h = Math.floor(totalFocusSeconds / 3600);
    const m = Math.floor((totalFocusSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  }, [totalFocusSeconds]);

  // ── Timer logic ──
  const stopTimer = useCallback(() => {
    setRunning(false);
    clearInterval(intervalRef.current);
    clearInterval(focusIntervalRef.current);
  }, []);

  const updateLabel = (mode) => {
    const labels = { work: 'TIEMPO DE ENFOQUE', short: 'PAUSA CORTA ☕', long: 'PAUSA LARGA 🌟' };
    return labels[mode];
  };

  const setMode = (mode) => {
    stopTimer();
    setCurrentMode(mode);
    const mins = mode === 'work' ? workMin : mode === 'short' ? shortMin : longMin;
    setTimeLeft(mins * 60);
    setTotalTime(mins * 60);
  };

  const updateDuration = () => {
    if (!running) {
      const mins = currentMode === 'work' ? workMin : currentMode === 'short' ? shortMin : longMin;
      setTimeLeft(mins * 60);
      setTotalTime(mins * 60);
    }
  };
  useEffect(updateDuration, [workMin, shortMin, longMin]);

  const saveSessionToHistory = useCallback((modeAtCompletion) => {
    const entry = { ts: Date.now(), h: new Date().getHours(), mode: modeAtCompletion };
    setSessionHistory((prev) => {
      const next = [...prev, entry].slice(-200);
      localStorage.setItem('ff_session_history', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastDay = localStorage.getItem('ff_last_day');
    if (lastDay !== today) {
      localStorage.setItem('ff_last_day', today);
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      setStreakDays((prev) => {
        const next = lastDay === yesterday ? prev + 1 : 1;
        localStorage.setItem('ff_streak', String(next));
        return next;
      });
    }
  }, []);

  const sendBrowserNotif = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(title, { body }); } catch (e) {}
    }
  };

  const spawnPixelExplosion = useCallback((x, y) => {
    const colors = ['#38bdf8', '#0ea5e9', '#2563eb', '#7c3aed', '#ffffff', '#60a5fa', '#67e8f9'];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const sz = [4, 4, 6, 8, 4][Math.floor(Math.random() * 5)];
      pixelParticles.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        size: sz,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: 0.015 + Math.random() * 0.025,
        gravity: 0.12,
      });
    }
  }, []);

  const aiAutoMessage = useCallback((text) => {
    if (appSettings.aiAuto === false) return;
    setTimeout(() => {
      setAiMessages((prev) => [...prev, { type: 'ai', html: text, time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }]);
      sound('aiReceive');
    }, 1500);
  }, [appSettings.aiAuto, sound]);

  const sessionComplete = useCallback(() => {
    stopTimer();
    setTimeLeft(0);

    if (currentMode === 'work') {
      const newCount = completedSessions + 1;
      setCompletedSessions(newCount);
      saveSessionToHistory('work');
      updateStreak();
      sound('complete');
      // Score popup + explosion
      if (playBtnRef.current) {
        const r = playBtnRef.current.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        spawnPixelExplosion(cx, cy);
        const id = Date.now() + Math.random();
        setScorePopups((prev) => [...prev, { id, x: cx - 40, y: cy - 50, text: '+100 XP 🍅' }]);
        setTimeout(() => setScorePopups((prev) => prev.filter((p) => p.id !== id)), 1900);
      }
      spriteMode.current = 'cheer';
      const celebMsgs = ['¡Pomodoro completado! 🎉', '¡Excelente trabajo!', '¡Lo lograste, campeón!', '¡Descansa un momento!'];
      setSpriteLabel({ text: celebMsgs[Math.floor(Math.random() * celebMsgs.length)], show: true });
      setTimeout(() => { spriteMode.current = 'idle'; setSpriteLabel((p) => ({ ...p, show: false })); }, 2500);
      sendBrowserNotif('🍅 ¡Pomodoro completado!', `Sesión #${newCount} terminada. ¡A descansar!`);
      showToast(`🍅 ¡Pomodoro #${newCount} completado! Tiempo de descansar.`);
      aiAutoMessage(`¡Excelente! Completaste tu Pomodoro #${newCount}. ${newCount >= 4 ? 'Ya llevas 4 sesiones, ¡tómate una pausa larga bien merecida!' : 'Descansa 5 minutos y vuelves con energía 💪'}`);
      if (appSettings.autoAdvance) {
        setTimeout(() => { setMode('short'); startTimer(); }, 1500);
      }
    } else {
      saveSessionToHistory(currentMode);
      sound('start');
      sendBrowserNotif('☕ ¡Pausa terminada!', '¡Hora de volver al trabajo!');
      showToast('☀️ ¡Pausa terminada! Hora de enfocarse.');
      aiAutoMessage('¡Pausa terminada! Recuerda tu objetivo para esta sesión. ¡Tú puedes! 🚀');
      if (appSettings.autoAdvance) {
        setTimeout(() => { setMode('work'); startTimer(); }, 1500);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode, completedSessions, stopTimer, saveSessionToHistory, updateStreak, sound, spawnPixelExplosion, showToast, aiAutoMessage, appSettings.autoAdvance]);

  const startTimer = () => {
    setRunning(true);
    sound('start');
    spriteMode.current = 'run';
    setSpriteLabel({ text: '¡Modo enfoque activado!', show: true });
    setTimeout(() => setSpriteLabel((p) => ({ ...p, show: false })), 2200);
    if (currentMode === 'work') {
      focusIntervalRef.current = setInterval(() => setTotalFocusSeconds((s) => s + 1), 1000);
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          clearInterval(focusIntervalRef.current);
          setTimeout(sessionComplete, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const toggleTimer = () => {
    if (running) { stopTimer(); sound('pause'); spriteMode.current = 'idle'; }
    else startTimer();
  };
  const resetTimer = () => {
    sound('reset');
    const mins = currentMode === 'work' ? workMin : currentMode === 'short' ? shortMin : longMin;
    stopTimer();
    setTimeLeft(mins * 60);
    setTotalTime(mins * 60);
  };
  const skipSession = () => { sound('skip'); sessionComplete(); };

  useEffect(() => () => { clearInterval(intervalRef.current); clearInterval(focusIntervalRef.current); }, []);

  // ── Notes ──
  const addNote = () => {
    const text = noteInput.trim();
    if (!text) return;
    const note = { id: Date.now(), text, tag: tagSelect, done: false };
    setNotes((prev) => [note, ...prev]);
    setNoteInput('');
    sound('add');
  };
  const toggleNote = (id) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n)));
    sound('check');
  };
  const deleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    sound('delete');
  };

  // ── AI Claude ──
  const buildMessageContent = (text) => {
    const ready = attachedFiles.filter((f) => f.status === 'ready' && f.b64);
    if (!ready.length) return text;
    const content = [];
    ready.forEach((f) => {
      if (f.mimeType.startsWith('image/')) {
        content.push({ type: 'image', source: { type: 'base64', media_type: f.mimeType, data: f.b64 } });
      } else if (f.mimeType === 'application/pdf') {
        content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.b64 } });
      } else {
        try { content.push({ type: 'text', text: `[Archivo: ${f.name}]\n${atob(f.b64)}` }); } catch (e) {}
      }
    });
    content.push({ type: 'text', text });
    return content;
  };

  const callClaude = async (userMsg, systemOverride) => {
    const apiKey = appSettings.claudeApiKey || '';
    if (!apiKey) {
      showToast('⚠️ Agrega tu API Key de Claude en Ajustes → Orion IA');
      return '⚠️ Necesito tu API Key para funcionar. Ve a ⚙️ Ajustes → Orion IA y pégala ahí.';
    }
    const system = systemOverride || AI_SYSTEM[aiMode];
    const statsCtx = `[Contexto del estudiante: ${completedSessions} Pomodoros completados hoy, ${Math.floor(totalFocusSeconds / 60)} minutos de enfoque, ${completedTasksCount} tareas completadas de ${notes.length}]`;
    const postsCtx = allPosts.length
      ? `[Últimos trabajos en la comunidad: ${allPosts.slice(0, 3).map((p) => `"${p.title}" (${p.cat}): ${p.body.substring(0, 80)}...`).join(' | ')}]`
      : '';
    const messages = [
      ...aiHistory,
      { role: 'user', content: buildMessageContent(`${statsCtx}\n${postsCtx}\n\n${userMsg}`) },
    ];
    try {
      const res = await fetch('http://localhost:3001/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey, messages, system, model: 'claude-opus-4-7' }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('API Error:', data);
        const errorMsg = data?.error?.message || JSON.stringify(data);
        return `⚠️ Error: ${errorMsg}`;
      }
      const reply = data.content?.[0]?.text || '⚠️ Sin respuesta. Intenta de nuevo.';
      setAiHistory((prev) => {
        const next = [...prev, { role: 'user', content: userMsg }, { role: 'assistant', content: reply }];
        return next.length > 12 ? next.slice(-12) : next;
      });
      return reply;
    } catch (err) {
      console.error('Fetch Error:', err);
      return `⚠️ Error de conexión: ¿El servidor está corriendo en puerto 3001?`;
    }
  };

  const sendAiMessage = async () => {
    const text = aiInput.trim();
    if (!text) return;
    sound('aiSend');
    setAiMessages((prev) => [...prev, { type: 'user', html: escHtml(text).replace(/\n/g, '<br>'), time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }]);
    setAiInput('');
    const isReviewReq = /revis|último trabajo|último post|comunidad|compañer/i.test(text) && aiMode !== 'trabajos';
    setAiTyping(true);
    try {
      const reply = await callClaude(text, isReviewReq ? AI_SYSTEM.trabajos : null);
      setAiTyping(false);
      setAiMessages((prev) => [...prev, { type: 'ai', html: reply.replace(/\n/g, '<br>'), time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }]);
      sound('aiReceive');
      if (attachedFiles.length) clearFiles();
      setFileTrayOpen(false);
    } catch (e) {
      setAiTyping(false);
      setAiMessages((prev) => [...prev, { type: 'ai', html: '⚠️ Error de conexión. Verifica tu red e intenta de nuevo.', time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }]);
    }
  };

  const useSuggestion = (chip) => {
    setAiInput(chip);
  };

  const setAiModeFn = (mode) => {
    setAiMode(mode);
    setAiHistory([]);
    const msgs = {
      mental: '💚 Modo Bienestar activado. Cuéntame, ¿cómo te sientes hoy?',
      estudio: '📖 Modo Técnicas de Estudio activado. ¿Qué quieres aprender a hacer mejor?',
      trabajos: '🔍 Modo Revisar Trabajos activado. Comparte el título y descripción de tu trabajo o pídeme que revise los de la comunidad.',
    };
    setAiMessages((prev) => [...prev, { type: 'ai', html: msgs[mode], time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) }]);
  };

  const reviewPost = async (postId) => {
    const post = allPosts.find((p) => p.id === postId);
    if (!post) return;
    setReviewLoading((prev) => ({ ...prev, [postId]: true }));
    const prompt = `Por favor revisa este trabajo de un estudiante:\n\nTítulo: ${post.title}\nCategoría: ${post.cat}\nDescripción: ${post.body}\nPomodoros del autor: ${post.pomodoros || 0}`;
    try {
      const review = await callClaude(prompt, AI_SYSTEM.trabajos);
      setReviewBubbles((prev) => ({ ...prev, [postId]: review }));
      sound('aiReceive');
    } catch (e) {
      showToast('⚠️ Error al revisar. Intenta de nuevo.');
    }
    setReviewLoading((prev) => ({ ...prev, [postId]: false }));
  };

  // ── Files ──
  const handleFiles = (fileList, typeHint) => {
    Array.from(fileList).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { showToast(`⚠️ ${file.name} supera 10MB. Omitido.`); return; }
      setAttachedFiles((prev) => {
        if (prev.length >= 5) { showToast('⚠️ Máximo 5 archivos.'); return prev; }
        const id = Date.now() + Math.random();
        const entry = {
          id, name: file.name, size: file.size,
          typeHint: typeHint === 'auto' ? detectType(file) : typeHint,
          mimeType: file.type, b64: null, previewUrl: null, status: 'loading',
        };
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target.result;
          setAttachedFiles((cur) => cur.map((f) => f.id === id ? {
            ...f, b64: result.split(',')[1],
            previewUrl: file.type.startsWith('image/') ? result : null,
            status: 'ready',
          } : f));
        };
        reader.onerror = () => {
          setAttachedFiles((cur) => cur.map((f) => f.id === id ? { ...f, status: 'error' } : f));
        };
        reader.readAsDataURL(file);
        return [...prev, entry];
      });
    });
  };
  const removeFile = (id) => setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  const clearFiles = () => setAttachedFiles([]);

  // ── Community ──
  const loadPosts = useCallback(async () => {
    setFeedLoading(true);
    try {
      const indexRaw = localStorage.getItem('post-index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      const posts = [];
      for (const id of index.slice(0, 30)) {
        const raw = localStorage.getItem(`post:${id}`);
        if (raw) posts.push(JSON.parse(raw));
      }
      posts.sort((a, b) => b.ts - a.ts);
      setAllPosts(posts);
    } catch (e) {}
    setFeedLoading(false);
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const raw = localStorage.getItem('leaderboard');
      const lb = raw ? JSON.parse(raw) : [];
      lb.sort((a, b) => b.score - a.score);
      setLeaderboard(lb.slice(0, 10));
    } catch (e) {}
  }, []);

  const publishPost = async () => {
    const nick = postNick.trim() || 'Anónimo';
    if (!postTitle.trim()) { showToast('⚠️ Falta el título'); return; }
    if (!postBody.trim()) { showToast('⚠️ Falta el contenido'); return; }
    setPublishing(true);
    const post = {
      id: Date.now().toString(),
      nick, cat: postCategory,
      title: postTitle.trim(), body: postBody.trim(),
      ts: Date.now(), likes: 0, pomodoros: completedSessions,
    };
    try {
      localStorage.setItem(`post:${post.id}`, JSON.stringify(post));
      const indexRaw = localStorage.getItem('post-index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      index.unshift(post.id);
      if (index.length > 60) index.splice(60);
      localStorage.setItem('post-index', JSON.stringify(index));
      setPostTitle(''); setPostBody('');
      showToast('📡 ¡Publicación enviada a la comunidad!');
      sound('complete');
      spawnPixelExplosion(window.innerWidth / 2, window.innerHeight / 2);
      await loadPosts();
    } catch (e) { showToast('⚠️ Error al publicar.'); }
    setPublishing(false);
  };

  const toggleLike = (id) => {
    const post = allPosts.find((p) => p.id === id);
    if (!post) return;
    const newLiked = new Set(likedPosts);
    let updatedPost;
    if (newLiked.has(id)) { newLiked.delete(id); updatedPost = { ...post, likes: Math.max(0, (post.likes || 0) - 1) }; }
    else { newLiked.add(id); updatedPost = { ...post, likes: (post.likes || 0) + 1 }; sound('check'); }
    setLikedPosts(newLiked);
    localStorage.setItem('ff_liked', JSON.stringify([...newLiked]));
    setAllPosts((prev) => prev.map((p) => p.id === id ? updatedPost : p));
    try { localStorage.setItem(`post:${id}`, JSON.stringify(updatedPost)); } catch (e) {}
  };

  const replyPost = (id, nick) => {
    setPostTitle(`↩ Re: ${nick}`);
    showToast(`💬 Respondiendo a ${nick}`);
  };
  const copyPost = (id) => {
    navigator.clipboard?.writeText(`BrainHub post #${id}`).catch(() => {});
    showToast('🔗 ¡Enlace copiado al portapapeles!');
  };

  const submitScore = async () => {
    const nick = postNick.trim() || 'Anónimo';
    if (completedSessions === 0) { showToast('⚠️ Completa al menos un Pomodoro primero'); return; }
    try {
      const raw = localStorage.getItem('leaderboard');
      const lb = raw ? JSON.parse(raw) : [];
      const existing = lb.find((e) => e.name === nick);
      if (existing) {
        if (completedSessions > existing.score) existing.score = completedSessions;
      } else {
        lb.push({ name: nick, score: completedSessions });
      }
      localStorage.setItem('leaderboard', JSON.stringify(lb));
      showToast(`🏅 Puntuación enviada: ${nick} · 🍅${completedSessions}`);
      sound('check');
      await loadLeaderboard();
    } catch (e) { showToast('⚠️ Error al enviar.'); }
  };

  const onlineCount = useMemo(() => {
    const fiveMin = Date.now() - 5 * 60 * 1000;
    return Math.max(1, allPosts.filter((p) => p.ts > fiveMin).length + 1);
  }, [allPosts]);

  // ── Tab change side effects ──
  useEffect(() => {
    if (activeTab === 'community') { loadPosts(); loadLeaderboard(); }
  }, [activeTab, loadPosts, loadLeaderboard]);

  // ── Projects ──
  const saveProjects = (next) => { localStorage.setItem('ff_projects', JSON.stringify(next)); };
  const addProject = () => {
    if (!projForm.name.trim()) { showToast('⚠️ Falta el nombre'); return; }
    const proj = {
      id: Date.now().toString(),
      name: projForm.name.trim(), desc: projForm.desc.trim(),
      tag: projForm.tag, goal: parseInt(projForm.goal) || 10,
      color: projForm.color, pomodoros: 0, tasks: [], createdAt: Date.now(),
    };
    setProjects((prev) => { const next = [proj, ...prev]; saveProjects(next); return next; });
    setProjForm({ name: '', desc: '', tag: 'desarrollo', goal: 10, color: '#0ea5e9' });
    showToast(`🚀 Proyecto "${proj.name}" creado`);
    sound('add');
  };
  const deleteProject = (id) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    setProjects((prev) => { const next = prev.filter((p) => p.id !== id); saveProjects(next); return next; });
    if (selectedProjectId === id) setSelectedProjectId(null);
  };
  const addPomodoroToProject = (id) => {
    setProjects((prev) => { const next = prev.map((p) => p.id === id ? { ...p, pomodoros: p.pomodoros + 1 } : p); saveProjects(next); return next; });
  };
  const addProjTask = () => {
    if (!selectedProjectId) { showToast('Selecciona un proyecto primero'); return; }
    const text = projTaskInput.trim();
    if (!text) return;
    setProjects((prev) => {
      const next = prev.map((p) => p.id === selectedProjectId ? { ...p, tasks: [...p.tasks, { id: Date.now(), text, done: false }] } : p);
      saveProjects(next); return next;
    });
    setProjTaskInput('');
    sound('add');
  };
  const toggleProjTask = (projId, taskId) => {
    setProjects((prev) => {
      const next = prev.map((p) => p.id === projId ? {
        ...p, tasks: p.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t),
      } : p);
      saveProjects(next); return next;
    });
    sound('check');
  };
  const deleteProjTask = (projId, taskId) => {
    setProjects((prev) => {
      const next = prev.map((p) => p.id === projId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p);
      saveProjects(next); return next;
    });
  };

  // ── Settings actions ──
  const requestNotifPermission = () => {
    if (!('Notification' in window)) { showToast('⚠️ Tu navegador no soporta notificaciones'); return; }
    Notification.requestPermission().then((p) => {
      if (p === 'granted') showToast('🔔 Notificaciones activadas');
      else showToast('⚠️ Permiso denegado');
    });
  };
  const exportData = () => {
    const data = { notes, projects, sessionHistory, appSettings, completedSessions, totalFocusSeconds, exportedAt: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    a.download = `BrainHub-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast('📤 Datos exportados');
  };
  const clearAllData = () => {
    if (!confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) return;
    localStorage.clear();
    setNotes([]); setProjects([]); setSessionHistory([]);
    setCompletedSessions(0); setTotalFocusSeconds(0);
    showToast('🗑 Datos eliminados');
  };
  const resetStats = () => {
    if (!confirm('¿Reiniciar estadísticas de hoy?')) return;
    setSessionHistory((prev) => {
      const next = prev.filter((s) => new Date(s.ts).toDateString() !== new Date().toDateString());
      localStorage.setItem('ff_session_history', JSON.stringify(next));
      return next;
    });
    setCompletedSessions(0);
    setTotalFocusSeconds(0);
    showToast('📊 Estadísticas reiniciadas');
  };

  // ── Auth handlers ──
  const getRegisteredUsers = () => JSON.parse(localStorage.getItem('ff_users') || '[]');
  const saveRegisteredUsers = (u) => localStorage.setItem('ff_users', JSON.stringify(u));

  const handleLogin = (e) => {
    e.preventDefault();
    const users = getRegisteredUsers();
    const user = users.find((u) => u.email === loginForm.email.trim());
    if (!user) { showToast('❌ Usuario no encontrado'); return; }
    if (user.password !== loginForm.password) { showToast('❌ Contraseña incorrecta'); return; }
    localStorage.setItem('ff_user_email', user.email);
    localStorage.setItem('ff_user_name', user.name);
    localStorage.setItem('ff_user_logged', 'true');
    setUserEmail(user.email); setUserName(user.name); setIsLogged(true);
    setLoginOpen(false);
    setLoginForm({ email: '', password: '' });
    showToast(`✅ ¡Bienvenido, ${user.name}!`);
  };
  const handleRegister = (e) => {
    e.preventDefault();
    const { name, email, password, password2 } = registerForm;
    if (password !== password2) { showToast('❌ Las contraseñas no coinciden'); return; }
    if (password.length < 6) { showToast('❌ La contraseña debe tener al menos 6 caracteres'); return; }
    const users = getRegisteredUsers();
    if (users.some((u) => u.email === email.trim())) { showToast('❌ Este correo ya está registrado'); return; }
    const newUser = { name: name.trim(), email: email.trim(), password, createdAt: new Date().toISOString() };
    users.push(newUser); saveRegisteredUsers(users);
    localStorage.setItem('ff_user_email', newUser.email);
    localStorage.setItem('ff_user_name', newUser.name);
    localStorage.setItem('ff_user_logged', 'true');
    setUserEmail(newUser.email); setUserName(newUser.name); setIsLogged(true);
    setLoginOpen(false);
    setRegisterForm({ name: '', email: '', password: '', password2: '' });
    showToast(`✅ ¡Cuenta creada exitosamente, ${newUser.name}!`);
  };
  const logout = () => {
    localStorage.removeItem('ff_user_email');
    localStorage.removeItem('ff_user_name');
    localStorage.removeItem('ff_user_logged');
    setUserName(''); setUserEmail(''); setIsLogged(false);
    setLoginOpen(true);
    showToast('✅ Sesión cerrada');
  };

  // ── Pixel canvas render loop ──
  useEffect(() => {
    const canvas = pixelCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    let raf;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pixelParticles.current = pixelParticles.current.filter((p) => p.life > 0);
      pixelParticles.current.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.life -= p.decay;
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── Sprite animation ──
  useEffect(() => {
    const canvas = spriteCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const drawGrid = (grid) => {
      ctx.clearRect(0, 0, 48, 48);
      const sz = 6;
      grid.forEach((row, r) => row.forEach((c, col) => {
        if (c === 0) return;
        ctx.fillStyle = SPRITE_PALETTE[c];
        ctx.fillRect(col * sz, r * sz, sz, sz);
      }));
    };
    const interval = setInterval(() => {
      const frames = { idle: [SPRITE_IDLE], run: [SPRITE_RUN, SPRITE_IDLE], cheer: [SPRITE_CHEER, SPRITE_IDLE] };
      const arr = frames[spriteMode.current] || [SPRITE_IDLE];
      drawGrid(arr[spriteFrame.current % arr.length]);
      spriteFrame.current++;
    }, 220);
    return () => clearInterval(interval);
  }, []);

  const bounceSprite = () => {
    spriteMode.current = 'cheer';
    const msg = spritePhrases[Math.floor(Math.random() * spritePhrases.length)];
    setSpriteMessage(msg);
    setSpriteMessageTime(Date.now());
    sound('speak');
    setTimeout(() => { spriteMode.current = running ? 'run' : 'idle'; setSpriteMessage(''); }, 3000);
  };

  // ── Auto-scroll AI messages ──
  useEffect(() => {
    if (aiMessagesRef.current) aiMessagesRef.current.scrollTop = aiMessagesRef.current.scrollHeight;
  }, [aiMessages, aiTyping]);

  // ── Computed ──
  const circleOffset = totalTime > 0 ? CIRCUMFERENCE * (1 - timeLeft / totalTime) : 0;
  const sessionDots = Array.from({ length: 4 }, (_, i) => i < (completedSessions % 4));
  const xpPct = Math.round(((completedSessions % 8) / 8) * 100);
  const charCount = `${postBody.length}/500`;

  const filteredPosts = currentFilter === 'all' ? allPosts : allPosts.filter((p) => p.cat === currentFilter);

  const today = new Date().toDateString();
  const todayWorkSessions = sessionHistory.filter((s) => new Date(s.ts).toDateString() === today && s.mode === 'work');
  const hourBuckets = Array(24).fill(0);
  todayWorkSessions.forEach((s) => hourBuckets[s.h]++);
  const maxBucket = Math.max(...hourBuckets, 1);
  const goalPct = Math.min(100, Math.round((completedSessions / dailyGoal) * 100));

  const todayHistory = sessionHistory.filter((s) => new Date(s.ts).toDateString() === today).slice().reverse().slice(0, 15);

  const achievements = [
    { icon: '🌱', label: 'Primera sesión', done: completedSessions >= 1 },
    { icon: '🔥', label: '5 Pomodoros hoy', done: completedSessions >= 5 },
    { icon: '💎', label: '10 Pomodoros', done: completedSessions >= 10 },
    { icon: '⏱', label: '1 hora de enfoque', done: totalFocusSeconds >= 3600 },
    { icon: '✅', label: '5 tareas completadas', done: completedTasksCount >= 5 },
    { icon: '📅', label: 'Racha de 3 días', done: streakDays >= 3 },
  ];
  const tipsForDay = [
    '🎯 Escribe tu objetivo al inicio de cada sesión Pomodoro.',
    '💧 Hidrátate durante las pausas — tu cerebro lo agradece.',
    '📵 Silencia las notificaciones del teléfono durante el foco.',
    '🐈‍⬛ Alterna temas de estudio para aprovechar el efecto de intercalado.',
    '🌿 Una caminata corta en la pausa larga mejora la concentración.',
    '📖 Revisa tus notas antes de empezar para activar la memoria de trabajo.',
    '😴 Dormir bien es más efectivo que estudiar de madrugada.',
  ];
  const tipOfDay = tipsForDay[new Date().getDay() % tipsForDay.length];

  const selectedProj = projects.find((p) => p.id === selectedProjectId);

  // ── Drag & drop handlers for AI card ──
  const onAiDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onAiDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  };
  const onAiDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files, 'auto');
      setFileTrayOpen(true);
      sound('add');
    }
  };

  return (
    <>
      <div className="stars">
        {stars.map((s) => <div key={s.id} className="star" style={s.style} />)}
      </div>
      <div className={`ambient-ring ${running ? 'active' : ''}`} />
      <div className="pixel-dust">
        {dustParticles.map((d) => <div key={d.id} className="px-dust" style={d.style} />)}
      </div>
      <canvas id="pixelCanvas" ref={pixelCanvasRef} />

      <canvas
        ref={spriteCanvasRef}
        className="pixel-sprite"
        width="48" height="48"
        title="Haz clic para animar"
        onClick={bounceSprite}
      />
      <div className={`sprite-label ${spriteLabel.show ? 'show' : ''}`}>{spriteLabel.text}</div>
      {spriteMessage && <div className="sprite-message">{spriteMessage}</div>}

      <div className="app">
        <nav>
          <div className="logo" onClick={() => setActiveTab('timer')}>
            <div className="logo-icon">🐈‍⬛</div>
            BrainHub
          </div>
          <div className="nav-links">
            <button className={activeTab === 'timer' ? 'active' : ''} onClick={() => setActiveTab('timer')} disabled={!isLogged}>⏱ Timer</button>
            <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')} disabled={!isLogged}>📊 Estadísticas</button>
            <button className={activeTab === 'projects' ? 'active' : ''} onClick={() => setActiveTab('projects')} disabled={!isLogged}>🚀 Proyectos</button>
            <button className={activeTab === 'community' ? 'active' : ''} onClick={() => setActiveTab('community')} disabled={!isLogged}>👥 Comunidad</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')} disabled={!isLogged}>⚙️ Ajustes</button>
          </div>
          <div>
            {isLogged ? (
              <div className="login-user-display">
                <span>👤 {userName || userEmail}</span>
                <button className="login-logout-btn" onClick={logout}>Cerrar</button>
              </div>
            ) : (
              <button className="nav-cta" onClick={() => setLoginOpen(true)}>🔐 Iniciar sesión</button>
            )}
          </div>
          <button className="nav-cta" onClick={() => setProOpen(true)}>✦ Pro Studio</button>
        </nav>

        {!isLogged && <div className="session-blocker" />}

        {/* LOGIN MODAL */}
        <div className={`modal-overlay ${loginOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget && isLogged) setLoginOpen(false); }}>
          <div className="login-modal">
            {isLogged && <button className="close-btn" onClick={() => setLoginOpen(false)}>✕</button>}
            <h2>{authMode === 'login' ? 'Bienvenido a BrainHub' : 'Crear cuenta en BrainHub'}</h2>

            {authMode === 'login' ? (
              <form className="login-form" onSubmit={handleLogin}>
                <div>
                  <label htmlFor="loginEmail">Correo electrónico</label>
                  <input type="email" id="loginEmail" placeholder="tu@email.com" required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="loginPassword">Contraseña</label>
                  <input type="password" id="loginPassword" placeholder="Contraseña" required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} />
                </div>
                <button type="submit" className="login-submit">Iniciar sesión</button>
              </form>
            ) : (
              <form className="login-form" onSubmit={handleRegister}>
                <div>
                  <label htmlFor="registerName">Nombre completo</label>
                  <input type="text" id="registerName" placeholder="Tu nombre" required
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="registerEmail">Correo electrónico</label>
                  <input type="email" id="registerEmail" placeholder="tu@email.com" required
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="registerPassword">Contraseña</label>
                  <input type="password" id="registerPassword" placeholder="Mínimo 6 caracteres" required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="registerPassword2">Confirmar contraseña</label>
                  <input type="password" id="registerPassword2" placeholder="Confirma tu contraseña" required
                    value={registerForm.password2}
                    onChange={(e) => setRegisterForm((p) => ({ ...p, password2: e.target.value }))} />
                </div>
                <button type="submit" className="login-submit">Crear cuenta</button>
              </form>
            )}

            <div className="login-toggle">
              <p>
                {authMode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button type="button" className="toggle-btn"
                  onClick={() => setAuthMode((m) => m === 'login' ? 'register' : 'login')}>
                  {authMode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* TIMER PANEL */}
        {activeTab === 'timer' && (
          <main>
            <div className="card timer-card">
              <div className="card-corner-tl"></div>
              <div className="card-corner-br"></div>
              <div className="timer-header">
                <span className="timer-title">⏱ Temporizador Pomodoro</span>
                <div className="mode-tabs">
                  <button className={`mode-tab ${currentMode === 'work' ? 'active' : ''}`} onClick={() => setMode('work')}>Trabajo</button>
                  <button className={`mode-tab ${currentMode === 'short' ? 'active' : ''}`} onClick={() => setMode('short')}>Pausa corta</button>
                  <button className={`mode-tab ${currentMode === 'long' ? 'active' : ''}`} onClick={() => setMode('long')}>Pausa larga</button>
                </div>
              </div>

              <div className="timer-circle-wrap">
                <div className="circle-container">
                  <svg className="circle-svg" width="220" height="220" viewBox="0 0 220 220">
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'var(--text)' }} />
                        <stop offset="40%" style={{ stopColor: '#38bdf8' }} />
                        <stop offset="100%" style={{ stopColor: '#0ea5e9' }} />
                      </linearGradient>
                    </defs>
                    <circle className="circle-bg" cx="110" cy="110" r="98" />
                    <circle className="circle-glow" cx="110" cy="110" r="98"
                      strokeDasharray={CIRCUMFERENCE} strokeDashoffset={circleOffset} />
                    <circle className="circle-prog" cx="110" cy="110" r="98"
                      strokeDasharray={CIRCUMFERENCE} strokeDashoffset={circleOffset} />
                  </svg>
                  <div className="circle-inner">
                    <div className="timer-display">{formatTime(timeLeft)}</div>
                    <div className="timer-label">{updateLabel(currentMode)}</div>
                    <div className="session-dots">
                      {sessionDots.map((done, i) => <div key={i} className={`session-dot ${done ? 'done' : ''}`} />)}
                    </div>
                  </div>
                </div>

                <div className="timer-controls">
                  <button className="btn-ctrl" onClick={resetTimer} title="Reset">↺</button>
                  <button ref={playBtnRef} className={`btn-play ${running ? 'running' : ''}`} onClick={toggleTimer}>
                    {running ? '⏸' : '▶'}
                  </button>
                  <button className="btn-ctrl" onClick={skipSession} title="Saltar">⏭</button>
                </div>

                <div className="timer-settings">
                  <div className="setting-pill">
                    <div className="setting-pill-label">Trabajo</div>
                    <input type="number" min="1" max="60" value={workMin} onChange={(e) => setWorkMin(+e.target.value)} />
                    <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>min</span>
                  </div>
                  <div className="setting-pill">
                    <div className="setting-pill-label">Pausa corta</div>
                    <input type="number" min="1" max="30" value={shortMin} onChange={(e) => setShortMin(+e.target.value)} />
                    <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>min</span>
                  </div>
                  <div className="setting-pill">
                    <div className="setting-pill-label">Pausa larga</div>
                    <input type="number" min="1" max="60" value={longMin} onChange={(e) => setLongMin(+e.target.value)} />
                    <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>min</span>
                  </div>
                  <div className="setting-pill">
                    <div className="setting-pill-label">Sesiones</div>
                    <div className="setting-pill-val">{completedSessions}</div>
                  </div>
                </div>

                <div className="xp-bar-wrap">
                  <span className="xp-label">XP</span>
                  <div className="xp-bar"><div className="xp-fill" style={{ width: `${xpPct}%` }} /></div>
                  <span className="xp-val">{xpPct}%</span>
                </div>
              </div>
            </div>

            {/* NOTES CARD */}
            <div className="card notes-card">
              <div className="stats-row">
                <div className="stat-pill"><div className="stat-val purple">{completedSessions}</div><div className="stat-label">Pomodoros</div></div>
                <div className="stat-pill"><div className="stat-val cyan">{focusFmt}</div><div className="stat-label">Enfoque</div></div>
                <div className="stat-pill"><div className="stat-val pink">{completedTasksCount}</div><div className="stat-label">Tareas ✓</div></div>
              </div>

              <div className="card-title">
                📝 Notas & Tareas
                <span className="badge badge-purple">{notes.length} nota{notes.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="note-input-row">
                <input className="note-input" placeholder="Añadir tarea o nota..."
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') addNote(); }} />
                <select className="tag-select" value={tagSelect} onChange={(e) => setTagSelect(e.target.value)}>
                  <option value="work">💼 Trabajo</option>
                  <option value="break">☕ Pausa</option>
                  <option value="idea">💡 Idea</option>
                </select>
                <button className="btn-add" onClick={addNote}>+</button>
              </div>

              <div className="notes-list">
                {notes.map((n) => {
                  const tagLabel = { work: '💼 Trabajo', break: '☕ Pausa', idea: '💡 Idea' }[n.tag];
                  const tagClass = { work: 'tag-work', break: 'tag-break', idea: 'tag-idea' }[n.tag];
                  return (
                    <div key={n.id} className="note-item">
                      <button className={`note-check ${n.done ? 'checked' : ''}`} onClick={() => toggleNote(n.id)} />
                      <span className={`note-text ${n.done ? 'done' : ''}`}>{n.text}</span>
                      <span className={`note-tag ${tagClass}`}>{tagLabel}</span>
                      <button className="note-del" onClick={() => deleteNote(n.id)}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI CARD */}
            <div className="card ai-card" onDragOver={onAiDragOver} onDragLeave={onAiDragLeave} onDrop={onAiDrop}>
              <div className="ai-header">
                <div>
                  <div className="card-title">🐈‍⬛ Orion <span className="badge badge-cyan">Salud Mental & Estudio</span></div>
                  <div className="ai-status" style={{ marginTop: 4 }}>
                    <div className="ai-dot"></div>
                    <span className="ai-status-text">Psicóloga académica · En línea</span>
                  </div>
                </div>
                <div className="ai-avatar" style={{ background: 'linear-gradient(135deg,#06b6d4,#9f55ff)', fontSize: '1.3rem' }}>🐈‍⬛</div>
              </div>

              <div className="ai-mode-bar">
                <button className={`ai-mode-btn ${aiMode === 'mental' ? 'active' : ''}`} onClick={() => setAiModeFn('mental')}>💚 Bienestar</button>
                <button className={`ai-mode-btn ${aiMode === 'estudio' ? 'active' : ''}`} onClick={() => setAiModeFn('estudio')}>📖 Estudio</button>
                <button className={`ai-mode-btn ${aiMode === 'trabajos' ? 'active' : ''}`} onClick={() => setAiModeFn('trabajos')}>🔍 Revisar trabajos</button>
              </div>

              <div className="ai-messages" ref={aiMessagesRef}>
                {aiMessages.map((m, i) => (
                  <div key={i} className={`msg ${m.type}`}>
                    <div className={`msg-avatar ${m.type === 'ai' ? 'ai-av' : 'user-av'}`}
                      style={m.type === 'ai' ? { background: 'linear-gradient(135deg,#06b6d4,#9f55ff)' } : undefined}>
                      {m.type === 'ai' ? '🐈‍⬛' : '👤'}
                    </div>
                    <div>
                      <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: m.html }} />
                      <div className="msg-time">{m.time}</div>
                    </div>
                  </div>
                ))}
                {aiTyping && (
                  <div className="msg ai">
                    <div className="msg-avatar ai-av" style={{ background: 'linear-gradient(135deg,#06b6d4,#9f55ff)' }}>🐈‍⬛</div>
                    <div className="msg-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="ai-suggestions">
                {SUGGESTIONS_BY_MODE[aiMode].map((s, i) => (
                  <span key={i} className="suggestion-chip" onClick={() => useSuggestion(s)}>{s}</span>
                ))}
              </div>

              {fileTrayOpen && (
                <div className="file-tray">
                  <div className="file-tray-header">
                    <span className="file-tray-title">📎 Archivos adjuntos</span>
                    <button className="file-tray-close" onClick={() => setFileTrayOpen(false)}>✕</button>
                  </div>
                  <div className="file-list">
                    {attachedFiles.length === 0 && <div className="file-empty-hint">Arrastra archivos aquí o usa los botones</div>}
                    {attachedFiles.map((f) => {
                      const icon = f.typeHint === 'image' ? '🖼️' : f.typeHint === 'pdf' ? '📄' : '📝';
                      const kb = (f.size / 1024).toFixed(1);
                      const statusLabel = { loading: 'Leyendo...', ready: 'Listo ✓', error: 'Error' }[f.status];
                      const statusClass = { loading: 'status-loading', ready: 'status-ready', error: 'status-error' }[f.status];
                      const barW = f.status === 'ready' ? 100 : f.status === 'error' ? 100 : 55;
                      return (
                        <div key={f.id} className="file-chip">
                          {f.previewUrl
                            ? <img className="file-chip-preview" src={f.previewUrl} alt={f.name} />
                            : <span className="file-chip-icon">{icon}</span>}
                          <div className="file-chip-info">
                            <div className="file-chip-name">{f.name}</div>
                            <div className="file-chip-meta">{kb} KB · {f.mimeType || f.typeHint}</div>
                            <div className="file-chip-bar">
                              <div className="file-chip-bar-fill" style={{ width: `${barW}%`, ...(f.status === 'error' ? { background: 'var(--cyan)' } : {}) }} />
                            </div>
                          </div>
                          <span className={`file-chip-status ${statusClass}`}>{statusLabel}</span>
                          <button className="file-chip-del" onClick={() => removeFile(f.id)}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="file-type-btns">
                    <label className="file-type-btn" title="Imagen">
                      🖼️ Imagen
                      <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files, 'image')} style={{ display: 'none' }} />
                    </label>
                    <label className="file-type-btn" title="PDF">
                      📄 PDF
                      <input type="file" accept=".pdf" multiple onChange={(e) => handleFiles(e.target.files, 'pdf')} style={{ display: 'none' }} />
                    </label>
                    <label className="file-type-btn" title="Texto / doc">
                      📝 Texto
                      <input type="file" accept=".txt,.md,.doc,.docx,.csv" multiple onChange={(e) => handleFiles(e.target.files, 'text')} style={{ display: 'none' }} />
                    </label>
                    <button className="file-type-btn file-clear-btn" onClick={clearFiles}>🗑 Limpiar</button>
                  </div>
                </div>
              )}

              {attachedFiles.filter((f) => f.status === 'ready').length > 0 && (
                <div className="files-context-bar">
                  {attachedFiles.filter((f) => f.status === 'ready').map((f) => {
                    const icon = f.typeHint === 'image' ? '🖼️' : f.typeHint === 'pdf' ? '📄' : '📝';
                    return (
                      <div key={f.id} className="ctx-pill">
                        {icon} {f.name.length > 18 ? f.name.slice(0, 16) + '…' : f.name}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="ai-input-wrap">
                <button className={`btn-attach ${fileTrayOpen ? 'open' : ''}`} onClick={() => setFileTrayOpen((o) => !o)} title="Adjuntar archivos">
                  <span>{attachedFiles.length > 0 ? '📎' : '+'}</span>
                  {attachedFiles.length > 0 && <span className="attach-badge">{attachedFiles.length}</span>}
                </button>
                <textarea className="ai-input" placeholder="Cuéntame cómo te sientes o qué necesitas..." rows="1"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }} />
                <button className="btn-send" onClick={sendAiMessage}>➤</button>
              </div>

              <div className={`drop-overlay ${dragOver ? 'active' : ''}`}>
                <div className="drop-msg">📎 Suelta aquí tus archivos</div>
              </div>
            </div>
          </main>
        )}

        {/* COMMUNITY PANEL */}
        {activeTab === 'community' && (
          <section className="community-panel">
            <div className="community-inner">
              <div className="community-left">
                <div className="card composer-card">
                  <div className="card-corner-tl"></div>
                  <div className="card-corner-br"></div>
                  <div className="composer-header">
                    <div className="card-title">📡 Compartir con la Comunidad <span className="badge badge-pink">LIVE</span></div>
                    <div className="online-count"><span className="ai-dot"></span><span>{onlineCount}</span> estudiante(s) activo(s)</div>
                  </div>
                  <div className="composer-body">
                    <div className="composer-row">
                      <input className="note-input" placeholder="Tu nombre / apodo" maxLength="24" style={{ maxWidth: 180 }}
                        value={postNick} onChange={(e) => setPostNick(e.target.value)} />
                      <select className="tag-select" value={postCategory} onChange={(e) => setPostCategory(e.target.value)}>
                        <option value="trabajo">💻 Trabajo</option>
                        <option value="proyecto">🚀 Proyecto</option>
                        <option value="recurso">📚 Recurso</option>
                        <option value="logro">🏆 Logro</option>
                        <option value="pregunta">❓ Pregunta</option>
                        <option value="inspiracion">✨ Inspiración</option>
                      </select>
                    </div>
                    <input className="note-input" placeholder="Título de tu publicación..." maxLength="80" style={{ width: '100%' }}
                      value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
                    <textarea className="note-input post-textarea" placeholder="Describe tu trabajo, comparte un recurso, celebra un logro o haz una pregunta a tus compañeros..." maxLength="500"
                      value={postBody} onChange={(e) => setPostBody(e.target.value)} />
                    <div className="composer-footer">
                      <span className="char-count">{charCount}</span>
                      <button className={`btn-publish ${publishing ? 'sending' : ''}`} onClick={publishPost}>
                        <span>{publishing ? '📡 Enviando...' : '📤 Publicar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="feed-controls">
                  <div className="feed-filters">
                    {['all', 'trabajo', 'proyecto', 'recurso', 'logro', 'pregunta', 'inspiracion'].map((c) => {
                      const labels = { all: 'Todos', trabajo: '💻', proyecto: '🚀', recurso: '📚', logro: '🏆', pregunta: '❓', inspiracion: '✨' };
                      return (
                        <button key={c} className={`filter-pill ${currentFilter === c ? 'active' : ''}`} onClick={() => setCurrentFilter(c)}>
                          {labels[c]}
                        </button>
                      );
                    })}
                  </div>
                  <button className="btn-refresh" onClick={loadPosts}>↻ Actualizar</button>
                </div>

                <div className="post-feed">
                  {feedLoading ? (
                    <div className="feed-loading">
                      <div className="loading-pixels"><div className="lp"></div><div className="lp"></div><div className="lp"></div><div className="lp"></div><div className="lp"></div></div>
                      <span>Cargando publicaciones...</span>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="empty-feed">
                      <span className="empty-pixel">👾</span>
                      {currentFilter === 'all' ? '¡Sé el primero en publicar!' : 'No hay publicaciones en esta categoría.'}
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const grad = AVATAR_GRADIENTS[Math.abs(hashStr(post.nick)) % AVATAR_GRADIENTS.length];
                      const cat = CAT_COLORS[post.cat] || CAT_COLORS.trabajo;
                      const liked = likedPosts.has(post.id);
                      const initials = (post.nick || '?').substring(0, 2).toUpperCase();
                      const review = reviewBubbles[post.id];
                      const loading = reviewLoading[post.id];
                      return (
                        <div key={post.id} className="post-card">
                          <div className="post-pixel-bar"></div>
                          <div className="post-header">
                            <div className="post-meta">
                              <div className="post-avatar" style={{ background: `linear-gradient(135deg,${grad[0]},${grad[1]})` }}>{initials}</div>
                              <div>
                                <div className="post-author">{post.nick}</div>
                                <div className="post-time">{relativeTime(post.ts)}{post.pomodoros > 0 ? ` · 🍅 ${post.pomodoros} pomodoros` : ''}</div>
                              </div>
                            </div>
                            <span className="post-cat" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>
                              {CAT_LABELS[post.cat] || post.cat}
                            </span>
                          </div>
                          <div className="post-title">{post.title}</div>
                          <div className="post-body">{post.body}</div>
                          <div className="post-actions">
                            <button className={`btn-react ${liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
                              {liked ? '❤️' : '🤍'} <span>{post.likes || 0}</span>
                            </button>
                            <button className="btn-react" onClick={() => replyPost(post.id, post.nick)}>💬 Responder</button>
                            <button className="btn-react" onClick={() => copyPost(post.id)}>🔗 Compartir</button>
                            <button className={`btn-review ${loading ? 'loading' : ''}`} onClick={() => reviewPost(post.id)}
                              style={review ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
                              {loading ? '🐈‍⬛ Analizando...' : review ? '✅ Revisado' : '🐈‍⬛ Revisar con IA'}
                            </button>
                          </div>
                          {review && (
                            <div className="ai-review-bubble">
                              <div className="review-header">🐈‍⬛ Orion IA <span className="review-score">Revisión IA</span></div>
                              <div dangerouslySetInnerHTML={{ __html: review.replace(/\n/g, '<br>') }} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="community-right">
                <div className="card leaderboard-card">
                  <div className="card-corner-tl"></div>
                  <div className="card-title" style={{ padding: '20px 20px 0' }}>🏅 Top Pomodoros <span className="badge badge-purple">RANKING</span></div>
                  <div className="leaderboard-list">
                    {leaderboard.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '0.78rem', textAlign: 'center', padding: 16 }}>
                        Nadie en el ranking aún. ¡Sé el primero!
                      </div>
                    ) : (
                      leaderboard.map((entry, i) => {
                        const rankClass = ['r1', 'r2', 'r3'][i] || 'rn';
                        const medal = ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
                        const maxScore = leaderboard[0].score || 1;
                        const pct = Math.round((entry.score / maxScore) * 100);
                        return (
                          <div key={i} className="lb-item">
                            <span className={`lb-rank ${rankClass}`}>{medal}</span>
                            <span className="lb-name">{entry.name}</span>
                            <div className="lb-bar-wrap"><div className="lb-bar" style={{ width: `${pct}%` }} /></div>
                            <span className="lb-score">🍅{entry.score}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div style={{ padding: '0 20px 16px' }}>
                    <button className="btn-publish" style={{ width: '100%', justifyContent: 'center' }} onClick={submitScore}>
                      📊 Enviar mi puntuación
                    </button>
                  </div>
                </div>

                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 12px' }}>💡 Tips de la comunidad</div>
                  <div className="tips-list">
                    <div className="tip-item"><span className="tip-icon">🎯</span><span>Escribe tu objetivo antes de cada Pomodoro</span></div>
                    <div className="tip-item"><span className="tip-icon">🚫</span><span>Silencia el teléfono durante el foco</span></div>
                    <div className="tip-item"><span className="tip-icon">💧</span><span>Hidratate en cada pausa corta</span></div>
                    <div className="tip-item"><span className="tip-icon">📖</span><span>Revisa tus notas antes de empezar</span></div>
                    <div className="tip-item"><span className="tip-icon">🌿</span><span>Pausa larga = sal a caminar 5 min</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STATS PANEL */}
        {activeTab === 'stats' && (
          <section className="community-panel">
            <div className="community-inner">
              <div className="community-left">
                <div className="card composer-card">
                  <div className="card-corner-tl"></div><div className="card-corner-br"></div>
                  <div className="composer-header">
                    <div className="card-title">📊 Resumen de hoy <span className="badge badge-purple">En vivo</span></div>
                    <button className="btn-refresh" onClick={resetStats} style={{ color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>🗑 Reiniciar</button>
                  </div>
                  <div className="stats-row" style={{ marginBottom: 20 }}>
                    <div className="stat-pill"><div className="stat-val purple">{completedSessions}</div><div className="stat-label">Pomodoros</div></div>
                    <div className="stat-pill"><div className="stat-val cyan">{focusFmt}</div><div className="stat-label">Tiempo enfocado</div></div>
                    <div className="stat-pill"><div className="stat-val pink">{completedTasksCount}</div><div className="stat-label">Tareas ✓</div></div>
                    <div className="stat-pill"><div className="stat-val" style={{ color: '#a78bfa' }}>{streakDays}</div><div className="stat-label">Racha días</div></div>
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600 }}>Meta diaria de Pomodoros</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--violet)', fontWeight: 700 }}>
                        {completedSessions} / <input type="number" min="1" max="20" value={dailyGoal} onChange={(e) => setDailyGoal(+e.target.value)}
                          style={{ background: 'none', border: 'none', color: 'var(--violet)', fontSize: '0.78rem', fontWeight: 700, width: 28, textAlign: 'center', outline: 'none' }} /> pomodoros
                      </span>
                    </div>
                    <div className="xp-bar" style={{ height: 8, borderRadius: 999 }}>
                      <div className="xp-fill" style={{ width: `${goalPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>Distribución de sesiones</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 60 }}>
                      {Array.from({ length: 24 }, (_, h) => {
                        const val = hourBuckets[h];
                        const heightPct = Math.max(3, Math.round((val / maxBucket) * 100));
                        return (
                          <div key={h} className="chart-bar-wrap">
                            <div className="chart-bar" style={{ height: `${heightPct}%`, opacity: val > 0 ? 1 : 0.18 }} title={`${val} sesión(es) a las ${h}:00`} />
                            <div className="chart-label">{h % 3 === 0 ? `${h}h` : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="card composer-card">
                  <div className="card-corner-tl"></div><div className="card-corner-br"></div>
                  <div className="card-title" style={{ marginBottom: 14 }}>🕓 Historial de sesiones</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
                    {todayHistory.length === 0
                      ? <div style={{ color: 'var(--muted)', fontSize: '0.85rem', padding: '8px 0' }}>Aún no has registrado sesiones hoy.</div>
                      : todayHistory.map((s, i) => {
                        const t = new Date(s.ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
                        const isWork = s.mode === 'work';
                        return (
                          <div key={i} className="note-item" style={{ padding: '8px 12px' }}>
                            <span style={{ fontSize: '1rem' }}>{isWork ? '🍅' : '☕'}</span>
                            <span className="note-text">{isWork ? 'Sesión de trabajo' : 'Pausa'}</span>
                            <span className="note-tag tag-work" style={{ marginLeft: 'auto' }}>{t}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="community-right">
                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 14px' }}>🏆 Logros</div>
                  <div className="tips-list">
                    {achievements.map((a, i) => (
                      <div key={i} className="tip-item" style={{ opacity: a.done ? 1 : 0.38, transition: 'opacity .3s' }}>
                        <span className="tip-icon">{a.icon}</span>
                        <span>{a.label} {a.done && <span style={{ color: '#4ade80', fontSize: '0.7rem', marginLeft: 6 }}>✓ Logrado</span>}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 12px' }}>💡 Consejo del día</div>
                  <div className="tips-list">
                    <div className="tip-item"><span className="tip-icon">💡</span><span>{tipOfDay}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* PROJECTS PANEL */}
        {activeTab === 'projects' && (
          <section className="community-panel">
            <div className="community-inner">
              <div className="community-left">
                <div className="card composer-card">
                  <div className="card-corner-tl"></div><div className="card-corner-br"></div>
                  <div className="composer-header">
                    <div className="card-title">🚀 Nuevo proyecto <span className="badge badge-cyan">Gestión</span></div>
                  </div>
                  <div className="composer-body">
                    <div className="composer-row">
                      <input className="note-input" placeholder="Nombre del proyecto" maxLength="50" style={{ flex: 2 }}
                        value={projForm.name} onChange={(e) => setProjForm((p) => ({ ...p, name: e.target.value }))} />
                      <select className="tag-select" value={projForm.tag}
                        onChange={(e) => setProjForm((p) => ({ ...p, tag: e.target.value }))}>
                        <option value="desarrollo">💻 Desarrollo</option>
                        <option value="diseño">🎨 Diseño</option>
                        <option value="investigacion">🔬 Investigación</option>
                        <option value="escritura">✍️ Escritura</option>
                        <option value="estudio">📚 Estudio</option>
                        <option value="otro">📁 Otro</option>
                      </select>
                    </div>
                    <input className="note-input" placeholder="Descripción breve (opcional)" maxLength="120" style={{ width: '100%' }}
                      value={projForm.desc} onChange={(e) => setProjForm((p) => ({ ...p, desc: e.target.value }))} />
                    <div className="composer-row" style={{ alignItems: 'center', gap: 12 }}>
                      <label style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>Meta Pomodoros:</label>
                      <input className="note-input" type="number" min="1" max="200" style={{ maxWidth: 80, textAlign: 'center' }}
                        value={projForm.goal} onChange={(e) => setProjForm((p) => ({ ...p, goal: +e.target.value }))} />
                      <label style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>Color:</label>
                      <input type="color" value={projForm.color} onChange={(e) => setProjForm((p) => ({ ...p, color: e.target.value }))}
                        style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8 }} />
                      <button className="btn-publish" style={{ marginLeft: 'auto' }} onClick={addProject}>＋ Crear</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {projects.length === 0 ? (
                    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🚀</div>
                      <div style={{ fontSize: '0.9rem' }}>Crea tu primer proyecto arriba para empezar</div>
                    </div>
                  ) : projects.map((p) => {
                    const doneTasks = p.tasks.filter((t) => t.done).length;
                    const totalTasks = p.tasks.length;
                    const pomoPct = Math.min(100, Math.round((p.pomodoros / p.goal) * 100));
                    const isSel = p.id === selectedProjectId;
                    return (
                      <div key={p.id} className={`proj-card ${isSel ? 'selected' : ''}`}
                        style={{ '--proj-color': p.color }}
                        onClick={() => setSelectedProjectId(p.id)}>
                        <div className="proj-header">
                          <div>
                            <div className="proj-name">{p.name}</div>
                            <span className="proj-tag-badge">{TAG_LABELS_MAP[p.tag] || p.tag}</span>
                          </div>
                          <div className="proj-actions" onClick={(e) => e.stopPropagation()}>
                            <button className="proj-btn" onClick={() => addPomodoroToProject(p.id)} title="Añadir pomodoro">+🍅</button>
                            <button className="proj-btn danger" onClick={() => deleteProject(p.id)}>🗑</button>
                          </div>
                        </div>
                        {p.desc && <div className="proj-desc">{p.desc}</div>}
                        <div className="proj-progress-wrap">
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 4 }}>
                            <span>🍅 {p.pomodoros} / {p.goal} pomodoros</span><span>{pomoPct}%</span>
                          </div>
                          <div className="proj-progress-bar">
                            <div className="proj-progress-fill" style={{ width: `${pomoPct}%`, background: p.color, boxShadow: `0 0 8px ${p.color}66` }} />
                          </div>
                        </div>
                        <div className="proj-footer">
                          <span className="proj-meta">{totalTasks > 0 ? `✅ ${doneTasks}/${totalTasks} tareas` : 'Sin tareas aún'}</span>
                          <span className="proj-meta" style={{ color: p.color }}>
                            {pomoPct >= 100 ? '🏆 ¡Completado!' : pomoPct >= 50 ? '🔥 En curso' : '🌱 Iniciado'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="community-right">
                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 10px' }}>
                    ✅ Tareas {selectedProj ? `: ${selectedProj.name}` : 'del proyecto'}
                  </div>
                  <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8 }}>
                    <input className="note-input" placeholder="Nueva tarea..." style={{ flex: 1, fontSize: '0.85rem' }}
                      value={projTaskInput} onChange={(e) => setProjTaskInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addProjTask(); }} />
                    <button className="btn-add" onClick={addProjTask} style={{ width: 36, height: 36, fontSize: '1rem' }}>+</button>
                  </div>
                  {selectedProj ? (
                    <div className="tips-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {selectedProj.tasks.length === 0
                        ? <div style={{ padding: '12px 0', color: 'var(--muted)', fontSize: '0.82rem', textAlign: 'center' }}>
                            Añade tareas con el campo de arriba ☝️
                          </div>
                        : selectedProj.tasks.map((t) => (
                            <div key={t.id} className="proj-task-item">
                              <button className={`proj-task-check ${t.done ? 'done' : ''}`} onClick={() => toggleProjTask(selectedProj.id, t.id)} />
                              <span className={`proj-task-text ${t.done ? 'done' : ''}`}>{t.text}</span>
                              <button className="proj-btn danger" style={{ padding: '2px 8px', fontSize: '0.7rem', borderRadius: 6 }}
                                onClick={() => deleteProjTask(selectedProj.id, t.id)}>✕</button>
                            </div>
                          ))}
                    </div>
                  ) : (
                    <div style={{ padding: '8px 16px 16px', color: 'var(--muted)', fontSize: '0.72rem' }}>
                      👆 Selecciona un proyecto para ver sus tareas
                    </div>
                  )}
                </div>

                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 12px' }}>📈 Resumen de proyectos</div>
                  <div className="tips-list">
                    <div className="tip-item"><span className="tip-icon">📁</span><span>{projects.length} proyecto{projects.length !== 1 ? 's' : ''} activo{projects.length !== 1 ? 's' : ''}</span></div>
                    <div className="tip-item"><span className="tip-icon">🍅</span><span>{projects.reduce((s, p) => s + p.pomodoros, 0)} pomodoros invertidos</span></div>
                    <div className="tip-item"><span className="tip-icon">🏆</span><span>{projects.filter((p) => p.pomodoros >= p.goal).length} completado(s)</span></div>
                    <div className="tip-item"><span className="tip-icon">✅</span><span>
                      {projects.reduce((s, p) => s + p.tasks.filter((t) => t.done).length, 0)}/
                      {projects.reduce((s, p) => s + p.tasks.length, 0)} tareas hechas
                    </span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SETTINGS PANEL */}
        {activeTab === 'settings' && (
          <section className="community-panel">
            <div className="community-inner">
              <div className="community-left">
                <div className="card composer-card">
                  <div className="card-corner-tl"></div><div className="card-corner-br"></div>
                  <div className="composer-header">
                    <div className="card-title">⚙️ Ajustes generales</div>
                  </div>
                  <div className="composer-body" style={{ gap: 0 }}>
                    <div className="settings-group">
                      <div className="settings-group-title">👤 Perfil</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Tu nombre</span>
                          <span className="setting-desc">Se usa en la comunidad y el ranking</span>
                        </div>
                        <input className="note-input" placeholder="Tu apodo" maxLength="24"
                          style={{ maxWidth: 160, textAlign: 'center' }}
                          value={appSettings.name || ''}
                          onChange={(e) => saveSetting('name', e.target.value)} />
                      </div>
                    </div>

                    <div className="settings-group">
                      <div className="settings-group-title">🔔 Sonidos</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Sonidos arcade</span>
                          <span className="setting-desc">Efectos al iniciar, pausar y completar sesiones</span>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={appSettings.sounds !== false}
                            onChange={(e) => saveSetting('sounds', e.target.checked)} />
                          <span className="toggle-track"></span>
                        </label>
                      </div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Sonido al añadir notas</span>
                          <span className="setting-desc">Efecto de moneda al agregar tareas</span>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={appSettings.noteSounds !== false}
                            onChange={(e) => saveSetting('noteSounds', e.target.checked)} />
                          <span className="toggle-track"></span>
                        </label>
                      </div>
                    </div>

                    <div className="settings-group">
                      <div className="settings-group-title">⏱ Temporizador</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Auto-avanzar sesiones</span>
                          <span className="setting-desc">Iniciar automáticamente la siguiente sesión</span>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={!!appSettings.autoAdvance}
                            onChange={(e) => saveSetting('autoAdvance', e.target.checked)} />
                          <span className="toggle-track"></span>
                        </label>
                      </div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Notificaciones del navegador</span>
                          <span className="setting-desc">Avisar cuando termina cada sesión</span>
                        </div>
                        <button className="btn-refresh" onClick={requestNotifPermission} style={{ whiteSpace: 'nowrap' }}>
                          {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? '✓ Activadas' : 'Activar'}
                        </button>
                      </div>
                      <div className="setting-row">
                        <div className="setting-info"><span className="setting-label">Duración trabajo (min)</span></div>
                        <input type="number" className="note-input" min="1" max="60" value={workMin}
                          style={{ maxWidth: 70, textAlign: 'center' }}
                          onChange={(e) => { const v = +e.target.value; setWorkMin(v); saveSetting('work', v); }} />
                      </div>
                      <div className="setting-row">
                        <div className="setting-info"><span className="setting-label">Pausa corta (min)</span></div>
                        <input type="number" className="note-input" min="1" max="30" value={shortMin}
                          style={{ maxWidth: 70, textAlign: 'center' }}
                          onChange={(e) => { const v = +e.target.value; setShortMin(v); saveSetting('short', v); }} />
                      </div>
                      <div className="setting-row">
                        <div className="setting-info"><span className="setting-label">Pausa larga (min)</span></div>
                        <input type="number" className="note-input" min="1" max="60" value={longMin}
                          style={{ maxWidth: 70, textAlign: 'center' }}
                          onChange={(e) => { const v = +e.target.value; setLongMin(v); saveSetting('long', v); }} />
                      </div>
                    </div>

                    <div className="settings-group">
                      <div className="settings-group-title">🐈‍⬛ Orion IA</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">API Key de Claude</span>
                          <span className="setting-desc">Tu clave de Anthropic (se guarda solo en tu navegador)</span>
                        </div>
                        <input className="note-input" type="password" placeholder="sk-ant-..."
                          style={{ maxWidth: 200, fontSize: '0.8rem' }}
                          value={appSettings.claudeApiKey || ''}
                          onChange={(e) => saveSetting('claudeApiKey', e.target.value)} />
                      </div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <span className="setting-label">Mensajes automáticos</span>
                          <span className="setting-desc">Orion te envía motivación al completar sesiones</span>
                        </div>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={appSettings.aiAuto !== false}
                            onChange={(e) => saveSetting('aiAuto', e.target.checked)} />
                          <span className="toggle-track"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="community-right">
                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 14px' }}>ℹ️ Acerca de BrainHub</div>
                  <div className="tips-list">
                    <div className="tip-item"><span className="tip-icon">🚀</span><span><strong>BrainHub Studio</strong><br /><small style={{ color: 'var(--muted)' }}>Tu espacio inteligente de productividad</small></span></div>
                    <div className="tip-item"><span className="tip-icon">🐈‍⬛</span><span>Orion IA integrado con Claude Sonnet para apoyo académico</span></div>
                    <div className="tip-item"><span className="tip-icon">👥</span><span>Comunidad en tiempo real con almacenamiento compartido</span></div>
                    <div className="tip-item"><span className="tip-icon">📊</span><span>Estadísticas y seguimiento de progreso en vivo</span></div>
                  </div>
                </div>
                <div className="card tips-card">
                  <div className="card-title" style={{ padding: '20px 20px 12px' }}>🔒 Datos y privacidad</div>
                  <div className="tips-list">
                    <div className="tip-item"><span className="tip-icon">💾</span><span>Tus notas y proyectos se guardan localmente en tu navegador</span></div>
                    <div className="tip-item"><span className="tip-icon">🌐</span><span>Las publicaciones en la comunidad son visibles para todos</span></div>
                  </div>
                  <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-refresh" onClick={exportData} style={{ flex: 1 }}>📤 Exportar datos</button>
                    <button className="btn-refresh" onClick={clearAllData} style={{ flex: 1, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}>🗑 Borrar todo</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* PRO MODAL */}
      <div className={`modal-overlay ${proOpen ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setProOpen(false); }}>
        <div className="pro-modal" role="dialog" aria-modal="true">
          <header>
            <div>
              <h2>Pro Studio</h2>
              <p>Encuentra un plan accesible y céntrate en lo que importa. Actualiza cuando quieras.</p>
            </div>
            <button className="close-btn" onClick={() => setProOpen(false)} aria-label="Cerrar">✕</button>
          </header>
          <div className="plans">
            <div className="plan">
              <h3>Gratis</h3>
              <div className="price">$0 COP</div>
              <p className="features">Temporizador ilimitado<br />Notas & tareas<br />Comunidad básica</p>
              <button onClick={() => { localStorage.setItem('ff_selected_plan', 'Gratis'); setProOpen(false); showToast('📦 Plan seleccionado: Gratis'); }}>Elegir</button>
            </div>
            <div className="plan">
              <h3>Estudiante</h3>
              <div className="price">$9.900 COP / mes</div>
              <p className="features">Historial + estadísticas<br />Temas adicionales<br />Modo oscuro mejorado<br />Prioridad en soporte</p>
              <button onClick={() => { localStorage.setItem('ff_selected_plan', 'Estudiante'); setProOpen(false); showToast('📦 Plan seleccionado: Estudiante'); }}>Elegir</button>
            </div>
            <div className="plan">
              <h3>Pro</h3>
              <div className="price">$24.900 COP / mes</div>
              <p className="features">Exportar datos<br />Personalización avanzada<br />Prioridad en comunidad<br />Análisis profundo</p>
              <button onClick={() => { localStorage.setItem('ff_selected_plan', 'Pro'); setProOpen(false); showToast('📦 Plan seleccionado: Pro'); }}>Elegir</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`toast ${toast.show ? 'show' : ''}`}>{toast.msg}</div>

      {scorePopups.map((p) => (
        <div key={p.id} className="score-popup" style={{ left: p.x, top: p.y }}>{p.text}</div>
      ))}
    </>
  );
}
