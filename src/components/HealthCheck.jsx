import React, { useState, useEffect } from 'react';

export default function HealthCheck() {
  const [status, setStatus] = useState({
    gateway: { status: 'LOADING' },
    weatherService: { status: 'LOADING' },
    timeService: { status: 'LOADING' }
  });

  const checkHealth = async () => {
    try {
      const response = await fetch('http://177.7.42.180:3003/health');
      if (!response.ok && response.status !== 207) {
        throw new Error('Gateway returned error status');
      }
      const data = await response.json();
      setStatus({
        gateway: data.gateway || { status: 'DOWN' },
        weatherService: data.weatherService || { status: 'DOWN' },
        timeService: data.timeService || { status: 'DOWN' }
      });
    } catch (error) {
      console.error('Failed to fetch health check:', error);
      setStatus({
        gateway: { status: 'DOWN', message: error.message },
        weatherService: { status: 'DOWN', message: 'Gateway inalcanzable' },
        timeService: { status: 'DOWN', message: 'Gateway inalcanzable' }
      });
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (serviceStatus) => {
    switch (serviceStatus) {
      case 'UP':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
          text: 'En línea',
          label: 'ONLINE'
        };
      case 'DOWN':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
          dot: 'bg-rose-400 animate-pulse shadow-[0_0_8px_#f43f5e]',
          text: 'Fuera de línea',
          label: 'OFFLINE'
        };
      case 'LOADING':
        return {
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
          dot: 'bg-slate-400 animate-ping',
          text: 'Comprobando...',
          label: 'PENDING'
        };
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
          text: 'Desconocido',
          label: 'UNKNOWN'
        };
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status.gateway.status === 'UP' ? 'bg-emerald-400' : 'bg-rose-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              status.gateway.status === 'UP' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}></span>
          </div>
          <span className="text-slate-400 text-sm font-medium tracking-wide">
            Monitoreo de Servicios del VPS
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 md:flex md:items-center">
          {[
            { id: 'gateway', name: 'API Gateway (3003)', state: status.gateway },
            { id: 'weather', name: 'Weather Svc (3001)', state: status.weatherService },
            { id: 'time', name: 'Time Svc (3002)', state: status.timeService }
          ].map((svc) => {
            const conf = getStatusConfig(svc.state.status);
            return (
              <div
                key={svc.id}
                className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl transition-all duration-300 ${conf.bg}`}
              >
                <div className={`h-2 w-2 rounded-full ${conf.dot}`} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {svc.name}
                  </span>
                  <span className="text-xs font-semibold leading-tight">
                    {conf.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
