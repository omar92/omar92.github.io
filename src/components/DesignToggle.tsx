import { LayoutGrid, Gamepad2 } from 'lucide-react';

type DesignMode = 'main' | 'steam';

type DesignToggleProps = {
  mode: DesignMode;
  onToggle: () => void;
  compact?: boolean;
};

const DesignToggle = ({ mode, onToggle, compact = false }: DesignToggleProps) => {
  const isSteam = mode === 'steam';
  const frameClass = isSteam
    ? 'border-[#3a556f]/70 bg-[#101926]/85'
    : 'border-cyan-400/35 bg-slate-950/65';
  const trackClass = isSteam
    ? 'border-[#486581]/70 bg-[#0b1724]/90'
    : 'border-cyan-400/30 bg-slate-900/80';

  return (
    <div className={`rounded-xl border p-1.5 shadow-2xl backdrop-blur-md ${frameClass} ${compact ? 'shadow-lg' : ''}`}>
      {!compact && (
        <div className={`mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isSteam ? 'text-[#8fa2b5]' : 'text-cyan-200/70'}`}>
          Theme
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className={`group relative grid grid-cols-2 overflow-hidden rounded-lg border ${trackClass} ${compact ? 'h-9 w-[154px]' : 'h-10 w-[180px]'}`}
        aria-label={isSteam ? 'Switch to main design' : 'Switch to steam design'}
        title={isSteam ? 'Switch to main design' : 'Switch to steam design'}
      >
        <span
          className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-md transition-all duration-300 ${
            isSteam
              ? 'left-[calc(50%+1px)] bg-[#2a475e]/70 shadow-[0_0_0_1px_rgba(102,192,244,0.55),0_0_20px_rgba(102,192,244,0.25)]'
              : 'left-0.5 bg-cyan-500/30 shadow-[0_0_0_1px_rgba(34,211,238,0.5),0_0_20px_rgba(34,211,238,0.2)]'
          }`}
        />

        <span
          className={`relative z-10 flex items-center justify-center gap-1.5 font-semibold transition-colors ${compact ? 'text-[10px]' : 'text-[11px]'} ${
            !isSteam ? 'text-slate-100' : 'text-[#8fa2b5] group-hover:text-[#c6d4df]'
          }`}
        >
          <LayoutGrid size={compact ? 11 : 12} />
          Main
        </span>

        <span
          className={`relative z-10 flex items-center justify-center gap-1.5 font-semibold transition-colors ${compact ? 'text-[10px]' : 'text-[11px]'} ${
            isSteam ? 'text-slate-100' : 'text-slate-400 group-hover:text-cyan-200'
          }`}
        >
          <Gamepad2 size={compact ? 11 : 12} />
          Steam
        </span>
      </button>
    </div>
  );
};

export default DesignToggle;
