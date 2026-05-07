-- ============================================================
--  SCHEMA POSTGRESQL v3.0 — BRAINHUB STUDIO
--  Alineado al frontend: Pomodoro + Notas + Chat IA +
--  Comunidad + Leaderboard + Stats + Planes + Logros
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS (lógica fija de negocio)
-- ============================================================

CREATE TYPE modo_pomodoro      AS ENUM ('work', 'short', 'long');
CREATE TYPE estado_sesion      AS ENUM ('activa', 'completada', 'cancelada');
CREATE TYPE rol_mensaje        AS ENUM ('user', 'assistant', 'system');
CREATE TYPE estado_publicacion AS ENUM ('activa', 'eliminada', 'reportada');

-- ============================================================
-- CATÁLOGOS DINÁMICOS
-- ============================================================

-- Planes de suscripción (Gratis / Estudiante / Pro)
CREATE TABLE cat_plan (
    id           SMALLINT     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo       VARCHAR(30)  NOT NULL UNIQUE,
    nombre       VARCHAR(100) NOT NULL,
    precio_cop   INT          NOT NULL DEFAULT 0 CHECK (precio_cop >= 0),
    descripcion  TEXT,
    activo       BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO cat_plan (codigo, nombre, precio_cop, descripcion) VALUES
('gratis',      'Gratis',      0,      'Temporizador ilimitado, notas & tareas, comunidad básica'),
('estudiante',  'Estudiante',  9900,   'Historial + estadísticas, temas adicionales, modo oscuro mejorado, prioridad en soporte'),
('pro',         'Pro',         24900,  'Exportar datos, personalización avanzada, prioridad en comunidad, análisis profundo');

-- Categorías de publicaciones de comunidad
CREATE TABLE cat_categoria_post (
    id     SMALLINT     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo VARCHAR(30)  NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    emoji  VARCHAR(10),
    activo BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO cat_categoria_post (codigo, nombre, emoji) VALUES
('trabajo',     'Trabajo',     '💻'),
('proyecto',    'Proyecto',    '🚀'),
('recurso',     'Recurso',     '📚'),
('logro',       'Logro',       '🏆'),
('pregunta',    'Pregunta',    '❓'),
('inspiracion', 'Inspiración', '✨');

-- Etiquetas de notas rápidas
CREATE TABLE cat_etiqueta_nota (
    id     SMALLINT     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo VARCHAR(30)  NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO cat_etiqueta_nota (codigo, nombre) VALUES
('work',  'Trabajo'),
('break', 'Pausa'),
('idea',  'Idea');

-- Logros / badges del sistema
CREATE TABLE cat_logro (
    id          SMALLINT     PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    codigo      VARCHAR(50)  NOT NULL UNIQUE,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    emoji       VARCHAR(10),
    condicion   JSONB,       -- ej: {"tipo": "pomodoros", "cantidad": 10}
    activo      BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO cat_logro (codigo, nombre, descripcion, emoji, condicion) VALUES
('primer_pomodoro',   'Primer Enfoque',      'Completa tu primer pomodoro',          '🍅', '{"tipo":"pomodoros","cantidad":1}'),
('racha_7',           'Racha Semanal',        'Estudia 7 días seguidos',              '🔥', '{"tipo":"racha_dias","cantidad":7}'),
('meta_diaria',       'Meta Cumplida',        'Alcanza tu meta diaria de pomodoros',  '🎯', '{"tipo":"meta_diaria","cantidad":1}'),
('pomodoros_10',      'Concentración Pro',    'Completa 10 pomodoros en total',       '💪', '{"tipo":"pomodoros","cantidad":10}'),
('comunidad_activa',  'Voz de la Comunidad',  'Publica por primera vez en comunidad', '📡', '{"tipo":"publicaciones","cantidad":1}');

-- ============================================================
-- 1. USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre           VARCHAR(100) NOT NULL,
    apellido         VARCHAR(100) NOT NULL,
    apodo            VARCHAR(24)  UNIQUE,      -- nick visible en comunidad y leaderboard
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    TEXT         NOT NULL,
    plan_id          SMALLINT     NOT NULL REFERENCES cat_plan(id) DEFAULT 1,
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verificado BOOLEAN      NOT NULL DEFAULT FALSE,
    ultimo_login     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. SESIONES DE AUTENTICACIÓN
-- ============================================================

CREATE TABLE sesiones_auth (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    expira_en  TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sesiones_auth_usuario ON sesiones_auth(usuario_id);

-- ============================================================
-- 3. CONFIGURACIÓN POMODORO (1 por usuario)
-- ============================================================

CREATE TABLE config_pomodoro (
    usuario_id           UUID     PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    duracion_trabajo_min SMALLINT NOT NULL DEFAULT 25 CHECK (duracion_trabajo_min > 0),
    descanso_corto_min   SMALLINT NOT NULL DEFAULT 5  CHECK (descanso_corto_min > 0),
    descanso_largo_min   SMALLINT NOT NULL DEFAULT 15 CHECK (descanso_largo_min > 0),
    ciclos_antes_largo   SMALLINT NOT NULL DEFAULT 4  CHECK (ciclos_antes_largo > 0),
    meta_diaria          SMALLINT NOT NULL DEFAULT 8  CHECK (meta_diaria > 0),  -- input dailyGoal del frontend
    sonido_activo        BOOLEAN  NOT NULL DEFAULT TRUE,
    auto_iniciar         BOOLEAN  NOT NULL DEFAULT FALSE
);

-- ============================================================
-- 4. SESIONES POMODORO (historial completo)
-- ============================================================

CREATE TABLE sesiones_pomodoro (
    id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID          NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    modo         modo_pomodoro NOT NULL,               -- work / short / long
    estado       estado_sesion NOT NULL DEFAULT 'activa',
    duracion_min SMALLINT      NOT NULL CHECK (duracion_min > 0),
    inicio       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    fin          TIMESTAMPTZ,
    CONSTRAINT chk_fin_despues_inicio CHECK (fin IS NULL OR fin > inicio)
);

CREATE INDEX idx_sesiones_pomodoro_usuario ON sesiones_pomodoro(usuario_id, inicio);

-- ============================================================
-- 5. ESTADÍSTICAS DIARIAS
-- El frontend muestra: pomodoros, tiempo enfocado, tareas ✓,
-- racha de días, meta diaria, distribución por hora
-- ============================================================

CREATE TABLE estadisticas_diarias (
    id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id            UUID    NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha                 DATE    NOT NULL,
    pomodoros_completados INT     NOT NULL DEFAULT 0 CHECK (pomodoros_completados >= 0),
    minutos_enfocados     INT     NOT NULL DEFAULT 0 CHECK (minutos_enfocados >= 0),
    tareas_completadas    INT     NOT NULL DEFAULT 0 CHECK (tareas_completadas >= 0),
    meta_alcanzada        BOOLEAN NOT NULL DEFAULT FALSE,
    distribucion_horas    JSONB,  -- ej: {"08":2, "09":1, "14":3} → mini chart del frontend
    UNIQUE (usuario_id, fecha)
);

CREATE INDEX idx_estadisticas_fecha ON estadisticas_diarias(usuario_id, fecha);

-- Racha de días (calculada y cacheada para el frontend)
CREATE TABLE racha_usuario (
    usuario_id       UUID    PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    racha_actual     INT     NOT NULL DEFAULT 0 CHECK (racha_actual >= 0),
    racha_maxima     INT     NOT NULL DEFAULT 0 CHECK (racha_maxima >= 0),
    ultima_actividad DATE
);

-- ============================================================
-- 6. NOTAS RÁPIDAS
-- El frontend tiene: texto, etiqueta (work/break/idea),
-- estado completado, botón eliminar
-- ============================================================

CREATE TABLE notas (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    etiqueta_id  SMALLINT    REFERENCES cat_etiqueta_nota(id) ON DELETE SET NULL,
    contenido    TEXT        NOT NULL,
    completada   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notas_usuario ON notas(usuario_id, created_at DESC);

-- ============================================================
-- 7. CHAT IA (Orion)
-- El frontend tiene: mensajes user/assistant, adjuntos de
-- archivos (imagen/pdf/texto), sugerencias predefinidas
-- ============================================================

CREATE TABLE chats_ia (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo     VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chats_usuario ON chats_ia(usuario_id);

CREATE TABLE mensajes_chat (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id    UUID         NOT NULL REFERENCES chats_ia(id) ON DELETE CASCADE,
    rol        rol_mensaje  NOT NULL,
    contenido  TEXT         NOT NULL,
    modelo_ia  VARCHAR(100),            -- ej: 'claude-sonnet-4'
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mensajes_chat ON mensajes_chat(chat_id, created_at);

-- Archivos adjuntos al chat (imagen/pdf/texto)
CREATE TABLE adjuntos_chat (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    mensaje_id      UUID        NOT NULL REFERENCES mensajes_chat(id) ON DELETE CASCADE,
    nombre_original VARCHAR(255) NOT NULL,
    tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('image', 'pdf', 'text')),
    ruta_storage    TEXT        NOT NULL,
    tamano_bytes    BIGINT      NOT NULL CHECK (tamano_bytes > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. COMUNIDAD — PUBLICACIONES
-- El frontend tiene: nick, título, cuerpo, categoría,
-- likes, comentarios, filtros por categoría
-- ============================================================

CREATE TABLE publicaciones (
    id           UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID                NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    categoria_id SMALLINT            NOT NULL REFERENCES cat_categoria_post(id),
    nick         VARCHAR(24)         NOT NULL,   -- apodo visible en el post
    titulo       VARCHAR(80)         NOT NULL,
    cuerpo       VARCHAR(500)        NOT NULL,
    estado       estado_publicacion  NOT NULL DEFAULT 'activa',
    likes        INT                 NOT NULL DEFAULT 0 CHECK (likes >= 0),
    created_at   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_publicaciones_categoria ON publicaciones(categoria_id, created_at DESC);
CREATE INDEX idx_publicaciones_usuario   ON publicaciones(usuario_id);

-- Likes de publicaciones (evita que un usuario dé like dos veces)
CREATE TABLE publicacion_likes (
    publicacion_id UUID NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id     UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (publicacion_id, usuario_id)
);

-- Comentarios de publicaciones
CREATE TABLE comentarios (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    publicacion_id UUID        NOT NULL REFERENCES publicaciones(id) ON DELETE CASCADE,
    usuario_id     UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nick           VARCHAR(24) NOT NULL,
    contenido      VARCHAR(300) NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comentarios_publicacion ON comentarios(publicacion_id, created_at);

-- ============================================================
-- 9. LEADERBOARD — TOP POMODOROS
-- El frontend muestra ranking con nombre y puntuación
-- y permite "Enviar mi puntuación"
-- ============================================================

CREATE TABLE leaderboard (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id        UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nick              VARCHAR(24) NOT NULL,
    pomodoros_totales INT         NOT NULL DEFAULT 0 CHECK (pomodoros_totales >= 0),
    semana            DATE        NOT NULL,  -- lunes de la semana (para ranking semanal)
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (usuario_id, semana)
);

CREATE INDEX idx_leaderboard_semana ON leaderboard(semana, pomodoros_totales DESC);

-- ============================================================
-- 10. LOGROS DESBLOQUEADOS POR USUARIO
-- ============================================================

CREATE TABLE usuario_logros (
    usuario_id  UUID        NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    logro_id    SMALLINT    NOT NULL REFERENCES cat_logro(id),
    desbloqueado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, logro_id)
);

-- ============================================================
-- TRIGGERS: updated_at y leaderboard automático
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_leaderboard_updated_at
    BEFORE UPDATE ON leaderboard
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- VISTA: ranking de la semana actual (para el frontend)
-- ============================================================

CREATE VIEW v_leaderboard_semana AS
SELECT
    l.nick,
    l.pomodoros_totales,
    RANK() OVER (ORDER BY l.pomodoros_totales DESC) AS posicion
FROM leaderboard l
WHERE l.semana = date_trunc('week', CURRENT_DATE)::date
ORDER BY l.pomodoros_totales DESC
LIMIT 20;

-- ============================================================
-- VISTA: catálogos para poblar dropdowns del frontend
-- ============================================================

CREATE VIEW v_catalogos AS
SELECT 'plan'            AS catalogo, id::TEXT, codigo, nombre, activo FROM cat_plan
UNION ALL
SELECT 'categoria_post',               id::TEXT, codigo, nombre, activo FROM cat_categoria_post
UNION ALL
SELECT 'etiqueta_nota',                id::TEXT, codigo, nombre, activo FROM cat_etiqueta_nota;
