/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';
import { createPerfil, getPerfilMe, loginApi } from '../http';

const AuthContext = createContext();

/**
 * Proveedor global de autenticación.
 * Expone user, session, perfil, loading y funciones login/signup/logout.
 * Escucha cambios de sesión via supabase.auth.onAuthStateChange.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const hasAuthEventFired = useRef(false);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!cancelled && !hasAuthEventFired.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }
        if (!cancelled) setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        hasAuthEventFired.current = true;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession) setPerfil(null);
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.access_token) {
      getPerfilMe(session.access_token)
        .then(setPerfil)
        .catch(() => setPerfil(null));
    }
  }, [session]);

  /**
   * Inicia sesión con email y contraseña a través del backend.
   * El backend valida las credenciales contra Supabase Auth y devuelve
   * los tokens de sesión. Luego se establece la sesión localmente
   * para que onAuthStateChange la detecte y actualice el estado global.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ user: object, session: object, perfil: object|null }>}
   */
  const login = async (email, password) => {
    const data = await loginApi(email, password);

    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    return data;
  };

  /**
   * Registra un nuevo usuario y crea su perfil vía POST /api/perfiles.
   * Si no hay sesión al instante, el usuario debe confirmar su correo.
   *
   * @param {object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {string} params.nombre
   * @param {string} params.apellido
   * @param {string} [params.dni]
   * @returns {Promise<{data?: object, error?: object}>}
   */
  const signup = async ({ email, password, nombre, apellido, dni }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      const nuevoPerfil = await createPerfil(
        { nombre, apellido, dni },
        data.session.access_token
      );
      setSession(data.session);
      setUser(data.user);
      setPerfil(nuevoPerfil);
    }

    return data;
  };

  /**
   * Cierra la sesión del usuario.
   */
  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, perfil, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de autenticación.
 * @returns {{ user, session, perfil, loading, login, signup, logout }}
 * @throws {Error} Si se usa fuera de AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
