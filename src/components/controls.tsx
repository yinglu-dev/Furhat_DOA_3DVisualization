// Small reusable form controls used by StyleControls.

interface ColorControlProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorControl({ id, label, value, onChange }: ColorControlProps) {
  return (
    <div className="control-row">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

interface SliderControlProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function SliderControl({ id, label, value, min, max, step = 0.01, onChange }: SliderControlProps) {
  return (
    <div className="control-row">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="mini-value">{value.toFixed(2)}</span>
    </div>
  );
}
