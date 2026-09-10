"use client";
import { Slider, Label } from "@heroui/react";
import type { Mode, Opts, PassphraseOpts } from "@/lib/utils/password";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-1 cursor-pointer">
      <span className="text-sm text-foreground">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${checked ? "bg-primary border-primary" : "bg-muted border-border"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

type Props = {
  mode: Mode;
  opts: Opts;
  onOptsChange: (o: Opts) => void;
  pinLength: number;
  onPinLengthChange: (n: number) => void;
  ppOpts: PassphraseOpts;
  onPpOptsChange: (o: PassphraseOpts) => void;
};

export function PasswordControls({ mode, opts, onOptsChange, pinLength, onPinLengthChange, ppOpts, onPpOptsChange }: Props) {
  if (mode === "pin") {
    return (
      <div className="flex flex-col gap-2">
        <Slider value={pinLength} minValue={3} maxValue={12} step={1} onChange={(v) => onPinLengthChange(typeof v === "number" ? v : Number((v as number[])[0]))} className="w-full gap-2">
          <div className="flex items-center justify-between w-full"><Label className="text-sm text-foreground">PIN length</Label><Slider.Output className="text-sm font-semibold text-foreground" /></div>
          <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
        </Slider>
        <div className="flex justify-between text-[10px] text-muted-foreground -mt-1"><span>3</span><span>12</span></div>
        <p className="text-xs text-muted-foreground pt-1">Digits only — great for device PINs.</p>
      </div>
    );
  }
  if (mode === "passphrase") {
    return (
      <>
        <Slider value={ppOpts.numWords} minValue={3} maxValue={7} step={1} onChange={(v) => onPpOptsChange({ ...ppOpts, numWords: typeof v === "number" ? v : Number((v as number[])[0]) })} className="w-full gap-2">
          <div className="flex items-center justify-between w-full"><Label className="text-sm text-foreground">Number of words</Label><Slider.Output className="text-sm font-semibold text-foreground" /></div>
          <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
        </Slider>
        <div className="flex justify-between text-[10px] text-muted-foreground -mt-1"><span>3</span><span>7</span></div>
        <div className="flex items-center justify-between gap-4 py-1"><span className="text-sm text-foreground">Word separator</span><div className="flex gap-1">{["-", "_", ".", " "].map((s) => (<button key={s === " " ? "space" : s} type="button" onClick={() => onPpOptsChange({ ...ppOpts, separator: s })} className={`h-7 min-w-7 px-2 rounded-md border text-sm font-mono transition-colors ${ppOpts.separator === s ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border hover:bg-muted"}`} aria-label={s === " " ? "space" : s}>{s === " " ? "␣" : s}</button>))}</div></div>
        <div className="flex flex-col gap-1"><Toggle checked={ppOpts.capitalize} onChange={(v) => onPpOptsChange({ ...ppOpts, capitalize: v })} label="Capitalize Words" /><Toggle checked={ppOpts.includeNumber} onChange={(v) => onPpOptsChange({ ...ppOpts, includeNumber: v })} label="Include Number" /></div>
      </>
    );
  }
  return (
    <>
      <Slider value={opts.length} minValue={6} maxValue={32} step={1} onChange={(v) => onOptsChange({ ...opts, length: typeof v === "number" ? v : Number((v as number[])[0]) })} className="w-full gap-2">
        <div className="flex items-center justify-between w-full"><Label className="text-sm text-foreground">Password length</Label><Slider.Output className="text-sm font-semibold text-foreground" /></div>
        <Slider.Track><Slider.Fill /><Slider.Thumb /></Slider.Track>
      </Slider>
      <div className="flex justify-between text-sm text-muted-foreground -mt-3"><span>6</span><span>32</span></div>
      <div className="flex flex-col gap-1"><Toggle checked={opts.uppercase} onChange={(v) => onOptsChange({ ...opts, uppercase: v })} label="Include Uppercase Letters" /><Toggle checked={opts.lowercase} onChange={(v) => onOptsChange({ ...opts, lowercase: v })} label="Include Lowercase Letters" /><Toggle checked={opts.numbers} onChange={(v) => onOptsChange({ ...opts, numbers: v })} label="Include Numbers" /><Toggle checked={opts.symbols} onChange={(v) => onOptsChange({ ...opts, symbols: v })} label="Include Symbols" /></div>
    </>
  );
}
