import { useEffect, useState } from 'react';

const colorMap = {
  acne: { bg: 'bg-error/15', fill: 'bg-error/70', icon: 'healing' },
  redness: { bg: 'bg-error-container/20', fill: 'bg-error-container/80', icon: 'thermostat' },
  dryness: { bg: 'bg-secondary-container/30', fill: 'bg-secondary/70', icon: 'water_drop' },
  dark_circles: { bg: 'bg-tertiary-container/30', fill: 'bg-tertiary/70', icon: 'visibility' },
};

export default function MetricBar({ label, value, maxValue = 10, delay = 0 }) {
  const [width, setWidth] = useState(0);
  const percentage = (value / maxValue) * 100;
  const config = colorMap[label] || colorMap.acne;

  const displayLabel = label.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 100 + delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_rgba(45,52,53,0.03)] animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined text-lg">{config.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-2">
          <span className="font-headline font-semibold text-sm text-on-surface">{displayLabel}</span>
          <span className="font-headline font-extrabold text-lg text-on-surface">{value}<span className="text-xs text-on-surface-variant font-normal">/{maxValue}</span></span>
        </div>
        <div className={`h-2 ${config.bg} rounded-full overflow-hidden`}>
          <div
            className={`h-full ${config.fill} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${width}%` }}
          />
        </div>
      </div>
    </div>
  );
}
