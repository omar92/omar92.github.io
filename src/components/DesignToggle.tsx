import { LayoutGrid, Gamepad2 } from 'lucide-react';

type DesignMode = 'main' | 'steam';

type DesignToggleProps = {
  mode: DesignMode;
  onToggle: () => void;
};

const DesignToggle = ({ mode, onToggle }: DesignToggleProps) => {
  const isSteam = mode === 'steam';

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-950/70 p-1.5 shadow-2xl backdrop-blur-md">
      <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Theme
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="group relative grid h-10 w-[180px] grid-cols-2 overflow-hidden rounded-lg border border-slate-700/70 bg-slate-900/80"
        aria-label={isSteam ? 'Switch to main design' : 'Switch to steam design'}
        title={isSteam ? 'Switch to main design' : 'Switch to steam design'}
      >
        <span
          className={`absolute top-0.5 h-[calc(100%-4px)] w-[calc(50%-2px)] rounded-md transition-all duration-300 ${
            isSteam
              ? 'left-[calc(50%+1px)] bg-cyan-500/30 shadow-[0_0_0_1px_rgba(34,211,238,0.45),0_0_20px_rgba(34,211,238,0.2)]'
              : 'left-0.5 bg-emerald-500/25 shadow-[0_0_0_1px_rgba(16,185,129,0.45),0_0_20px_rgba(16,185,129,0.15)]'
          }`}
        />

        <span
          className={`relative z-10 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors ${
            !isSteam ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'
          }`}
        >
          <LayoutGrid size={12} />
          Main
        </span>

        <span
          className={`relative z-10 flex items-center justify-center gap-1.5 text-[11px] font-semibold transition-colors ${
            isSteam ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'
          }`}
        >
          <Gamepad2 size={12} />
          Steam
        </span>
      </button>
    </div>
  );
};

export default DesignToggle;
