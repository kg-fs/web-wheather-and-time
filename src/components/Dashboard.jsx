import React, { useState, useEffect } from 'react';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [tick, setTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = async (queryToSearch) => {
    const term = (queryToSearch || searchQuery).trim();
    if (!term) return;

    setLoading(true);
    setError(null);

    try {
      const weatherRes = await fetch(`http://177.7.42.180:3003/api/weather?country=${encodeURIComponent(term)}`);
      if (!weatherRes.ok) {
        const errData = await weatherRes.json().catch(() => ({}));
        throw new Error(errData.message || `Error en el servicio de clima: ${weatherRes.status}`);
      }
      const weatherData = await weatherRes.json();

      const timeRes = await fetch(`http://177.7.42.180:3003/api/time?country=${encodeURIComponent(term)}`);
      if (!timeRes.ok) {
        const errData = await timeRes.json().catch(() => ({}));
        throw new Error(errData.message || `Error en el servicio de tiempo: ${timeRes.status}`);
      }
      const timeData = await timeRes.json();

      const nicaTimeRes = await fetch('http://177.7.42.180:3003/api/time?country=Nicaragua');
      let nicaTimeData = null;
      if (nicaTimeRes.ok) {
        nicaTimeData = await nicaTimeRes.json();
      }

      const targetServerTime = new Date(timeData.localtime.replace(' ', 'T'));
      const targetOffset = targetServerTime.getTime() - Date.now();

      let nicaOffset = 0;
      if (nicaTimeData) {
        const nicaServerTime = new Date(nicaTimeData.localtime.replace(' ', 'T'));
        nicaOffset = nicaServerTime.getTime() - Date.now();
      }

      setData({
        weather: weatherData,
        time: timeData,
        nicaTime: nicaTimeData,
        targetTimeOffset: targetOffset,
        nicaTimeOffset: nicaOffset
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTickingTime = (now, offset) => {
    if (offset === undefined) return null;
    const localDate = new Date(now + offset);
    
    const timeStr = localDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const dateStr = localDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

    return { timeStr, dateStr, hours: localDate.getHours() };
  };

  const getTemperatureGradient = (temp) => {
    if (temp <= 15) return 'from-blue-600/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400';
    if (temp <= 25) return 'from-teal-600/20 to-emerald-500/20 border-emerald-500/30 text-emerald-400';
    if (temp <= 32) return 'from-amber-600/20 to-orange-500/20 border-orange-500/30 text-amber-400';
    return 'from-red-600/20 to-rose-500/20 border-rose-500/30 text-rose-400';
  };

  const getWeatherIcon = (condition) => {
    const cond = condition.toLowerCase();
    if (cond.includes('rain') || cond.includes('shower') || cond.includes('llovizna') || cond.includes('lluvia')) {
      return (
        <svg className="w-12 h-12 text-blue-400 drop-shadow-[0_0_8px_#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M20 14a8 8 0 11-16 0c0-3.3 2-6.2 5-7.4v.4a3 3 0 006 0v-.4c3 1.2 5 4.1 5 7.4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 20v2m4-2v2m4-2v2" className="animate-bounce" />
        </svg>
      );
    }
    if (cond.includes('cloud') || cond.includes('nublado') || cond.includes('cubierto') || cond.includes('overcast')) {
      return (
        <svg className="w-12 h-12 text-slate-300 drop-shadow-[0_0_8px_#cbd5e1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        </svg>
      );
    }
    if (cond.includes('clear') || cond.includes('despejado') || cond.includes('sunny') || cond.includes('sol')) {
      return (
        <svg className="w-12 h-12 text-amber-400 animate-spin-slow drop-shadow-[0_0_8px_#fbbf24]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41m12.72-12.72l-1.41 1.41" />
        </svg>
      );
    }
    return (
      <svg className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_8px_#818cf8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M20 14a8 8 0 11-16 0c0-3.3 2-6.2 5-7.4v.4" />
      </svg>
    );
  };

  useEffect(() => {
    handleSearch('Spain');
  }, []);

  const targetClock = data ? getTickingTime(tick, data.targetTimeOffset) : null;
  const nicaClock = data ? getTickingTime(tick, data.nicaTimeOffset) : null;

  let timeDifferenceText = '';
  if (targetClock && nicaClock && data.time && data.nicaTime) {
    const diffMs = (tick + data.targetTimeOffset) - (tick + data.nicaTimeOffset);
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      timeDifferenceText = 'Tiene la misma hora que Nicaragua';
    } else {
      timeDifferenceText = `${Math.abs(diffHours)} ${Math.abs(diffHours) === 1 ? 'hora' : 'horas'} ${diffHours > 0 ? 'adelante' : 'atrás'} de Nicaragua`;
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="relative mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur-lg border border-slate-800/80 rounded-2xl shadow-2xl focus-within:border-indigo-500/50 transition-all duration-300"
        >
          <div className="relative flex-1 flex items-center pl-3">
            <svg className="w-5 h-5 text-slate-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Busca un país o ciudad... (ej. Spain, Argentina, Tokyo, Managua)"
              className="w-full bg-transparent border-none text-slate-100 placeholder-slate-500 outline-none text-sm py-2 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <div className="flex justify-center mt-3">
          <select
            onChange={(e) => {
              const selected = e.target.value;
              if (selected) {
                setSearchQuery(selected);
                handleSearch(selected);
              }
            }}
            className="text-xs font-semibold px-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 outline-none focus:border-indigo-500/50 cursor-pointer transition-all duration-200 hover:border-slate-700"
          >
            <option value="" className="bg-slate-950 text-slate-500">-- Selecciona un país rápido --</option>
            <option value="Spain" className="bg-slate-950 text-slate-300">España 🇪🇸</option>
            <option value="Nicaragua" className="bg-slate-950 text-slate-300">Nicaragua 🇳🇮</option>
            <option value="Japan" className="bg-slate-950 text-slate-300">Japón 🇯🇵</option>
            <option value="Argentina" className="bg-slate-950 text-slate-300">Argentina 🇦🇷</option>
            <option value="Colombia" className="bg-slate-950 text-slate-300">Colombia 🇨🇴</option>
            <option value="United States" className="bg-slate-950 text-slate-300">Estados Unidos 🇺🇸</option>
            <option value="United Kingdom" className="bg-slate-950 text-slate-300">Reino Unido 🇬🇧</option>
            <option value="France" className="bg-slate-950 text-slate-300">Francia 🇫🇷</option>
            <option value="Germany" className="bg-slate-950 text-slate-300">Alemania 🇩🇪</option>
            <option value="Mexico" className="bg-slate-950 text-slate-300">México 🇲🇽</option>
            <option value="Brazil" className="bg-slate-950 text-slate-300">Brasil 🇧🇷</option>
            <option value="Italy" className="bg-slate-950 text-slate-300">Italia 🇮🇹</option>
            <option value="Canada" className="bg-slate-950 text-slate-300">Canadá 🇨🇦</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start gap-3 shadow-lg">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold block text-sm">Error de Solicitud</span>
            <span className="text-xs opacity-90">{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-80 bg-slate-900/60 border border-slate-800/80 rounded-3xl" />
          <div className="h-80 bg-slate-900/60 border border-slate-800/80 rounded-3xl" />
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-slate-800/80 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-500" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
                  Destino Consultado
                </span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">
                  {data.time.name}
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  {data.time.country}
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                {getWeatherIcon(data.weather.requestedCountry.condition)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all duration-500 bg-gradient-to-br ${getTemperatureGradient(data.weather.requestedCountry.temp_c)}`}>
                <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
                  Temperatura
                </span>
                <span className="text-4xl font-black mt-1">
                  {data.weather.requestedCountry.temp_c}°C
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-800/20 border border-slate-800 rounded-2xl text-slate-300">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Condición
                </span>
                <span className="text-sm font-bold text-center mt-2 leading-snug">
                  {data.weather.requestedCountry.condition}
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl text-slate-300">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                Hora Local en Tiempo Real
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-indigo-300 font-mono tracking-wider">
                  {targetClock ? targetClock.timeStr : '--:--:--'}
                </span>
                <span className="text-xs text-indigo-400 font-semibold uppercase">
                  {targetClock ? targetClock.dateStr : ''}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-indigo-950 flex items-center justify-between text-xs text-slate-400">
                <span>Zona Horaria:</span>
                <span className="font-mono text-slate-300 font-medium">{data.time.timezone}</span>
              </div>
            </div>

            {timeDifferenceText && (
              <div className="mt-4 px-3 py-2 bg-slate-850/50 border border-slate-800 rounded-xl text-center text-xs text-indigo-300 font-semibold">
                ⏳ {timeDifferenceText}
              </div>
            )}
          </div>

          <div className="relative group overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-slate-800/80 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:border-slate-700/80">
            <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Comparación
                </span>
                <h2 className="text-3xl font-extrabold text-slate-100 mt-2 tracking-tight">
                  Managua
                </h2>
                <p className="text-slate-400 font-medium text-sm">
                  Nicaragua 🇳🇮
                </p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30">
                {getWeatherIcon(data.weather.nicaragua.condition)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`flex flex-col items-center justify-center p-4 border rounded-2xl transition-all duration-500 bg-gradient-to-br ${getTemperatureGradient(data.weather.nicaragua.temp_c)}`}>
                <span className="text-xs uppercase font-extrabold tracking-wider opacity-60">
                  Temperatura
                </span>
                <span className="text-4xl font-black mt-1">
                  {data.weather.nicaragua.temp_c}°C
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-800/20 border border-slate-800 rounded-2xl text-slate-300">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Condición
                </span>
                <span className="text-sm font-bold text-center mt-2 leading-snug">
                  {data.weather.nicaragua.condition}
                </span>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-2xl text-slate-300">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                Hora Local en Tiempo Real
              </span>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-emerald-300 font-mono tracking-wider">
                  {nicaClock ? nicaClock.timeStr : '--:--:--'}
                </span>
                <span className="text-xs text-emerald-400 font-semibold uppercase">
                  {nicaClock ? nicaClock.dateStr : ''}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-950 flex items-center justify-between text-xs text-slate-400">
                <span>Zona Horaria:</span>
                <span className="font-mono text-slate-300 font-medium">
                  {data.nicaTime ? data.nicaTime.timezone : 'America/Managua'}
                </span>
              </div>
            </div>

            {data && (
              <div className="mt-4 px-3 py-2 bg-slate-850/50 border border-slate-800 rounded-xl text-center text-xs text-slate-300">
                🌡️ La temperatura en {data.time.name} es{' '}
                <span className="font-bold">
                  {Math.abs(data.weather.requestedCountry.temp_c - data.weather.nicaragua.temp_c).toFixed(1)}°C{' '}
                  {data.weather.requestedCountry.temp_c > data.weather.nicaragua.temp_c ? 'más cálida' : 'más fría'}
                </span>{' '}
                que en Managua.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
