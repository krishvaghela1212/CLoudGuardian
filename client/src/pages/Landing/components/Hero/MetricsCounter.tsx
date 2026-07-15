import { HERO_METRICS } from '../../utils/constants';
import { useCountUp } from '../../hooks/useCountUp';

function MetricCard({ label, value, prefix, suffix, color }: {
  label: string;
  value: number;
  prefix?: string;
  suffix: string;
  color: string;
}) {
  const { value: animatedValue, ref } = useCountUp(value);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      <div className="text-2xl font-bold text-white">
        {prefix && <span>{prefix}</span>}
        <span>{animatedValue.toLocaleString()}</span>
        {suffix && <span className="text-lg">{suffix}</span>}
      </div>
      <div className="text-sm text-[#94A3B8] mt-1">{label}</div>
    </div>
  );
}

export default function MetricsCounter() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
      {HERO_METRICS.map((metric) => (
        <MetricCard
          key={metric.id}
          label={metric.label}
          value={metric.value}
          prefix={metric.prefix}
          suffix={metric.suffix}
          color={metric.color}
        />
      ))}
    </div>
  );
}
