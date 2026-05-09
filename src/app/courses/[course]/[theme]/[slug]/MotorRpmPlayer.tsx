"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEAD_BAND,
  FULL_THROTTLE_RPM,
  MAX_ADC,
  MID_ADC,
  MOTOR_MAX,
  configureMotor,
  expectedPulsesPerSecond,
  pulsesToRPM,
  type MotorMode,
} from "@/lib/projects/motorRpm/motorRpm";

const TICK_MS = 1000;

const MODE_COLORS: Record<MotorMode, string> = {
  FWD: "#10b981",
  REV: "#f59e0b",
  BRAKE: "#ef4444",
};

export function MotorRpmPlayer() {
  const [adc, setAdc] = useState(MID_ADC);
  const [pulsesThisSecond, setPulsesThisSecond] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [running, setRunning] = useState(true);
  const pulseAcc = useRef(0);
  const angleRef = useRef(0);
  const [angleDeg, setAngleDeg] = useState(0);

  const command = configureMotor(adc);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const cmd = configureMotor(adc);
      const ppsExpected = expectedPulsesPerSecond(cmd);
      // Add Poisson-ish jitter for realism
      const noisy = Math.max(0, Math.round(ppsExpected + (Math.random() - 0.5) * 3));
      pulseAcc.current = noisy;
      const r = pulsesToRPM(noisy, cmd.mode);
      setPulsesThisSecond(noisy);
      setRpm(r);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [running, adc]);

  // Smooth shaft animation @ 30fps
  useEffect(() => {
    const id = setInterval(() => {
      const cmd = configureMotor(adc);
      const dutyFraction = cmd.pwm / MOTOR_MAX;
      const rpmInst = (cmd.mode === "REV" ? -1 : cmd.mode === "FWD" ? 1 : 0) * dutyFraction * FULL_THROTTLE_RPM;
      // degrees per 1/30 s = rpm * 360 / 60 / 30
      const dDeg = (rpmInst * 360) / 60 / 30;
      angleRef.current += dDeg;
      setAngleDeg(angleRef.current);
    }, 1000 / 30);
    return () => clearInterval(id);
  }, [adc]);

  const dutyPercent = (command.pwm / MOTOR_MAX) * 100;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">DC motor + PWM + RPM speedometer</h2>
        <p className="text-sm text-foreground/70">
          Lab 7. A pot reads into the AVR&apos;s 10-bit ADC; the firmware decides motor
          mode (FWD / BRAKE / REV) and a PWM duty value. A speed sensor on PIND7 fires a
          pin-change interrupt once per propeller blade — three pulses per revolution —
          and the firmware computes RPM = 3 × pulses every second.
        </p>
      </header>

      <section className="rounded-md border border-foreground/15 p-4 space-y-3">
        <label className="block">
          <span className="text-sm">
            potentiometer (ADC ch 0) <span className="font-mono">{adc} / 1023</span>
          </span>
          <input
            type="range"
            min={0}
            max={MAX_ADC}
            step={1}
            value={adc}
            onChange={(e) => setAdc(parseInt(e.target.value, 10))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-foreground/60">
            <span>REV (0)</span>
            <span>BRAKE band ({MID_ADC}±{DEAD_BAND})</span>
            <span>FWD ({MAX_ADC})</span>
          </div>
        </label>
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded bg-foreground px-3 py-1 text-sm text-background"
        >
          {running ? "Pause" : "Resume"}
        </button>
      </section>

      <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-md border border-foreground/15 p-4 flex flex-col items-center gap-3">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            motor shaft
          </div>
          <svg width={160} height={160} viewBox="0 0 160 160">
            <circle cx={80} cy={80} r={70} fill="none" stroke="#444" strokeWidth={2} />
            <g transform={`translate(80,80) rotate(${angleDeg})`}>
              <ellipse cx={0} cy={-50} rx={6} ry={50} fill={MODE_COLORS[command.mode]} />
              <ellipse cx={0} cy={50} rx={6} ry={50} fill={MODE_COLORS[command.mode]} />
              <ellipse cx={-50} cy={0} rx={50} ry={6} fill={MODE_COLORS[command.mode]} opacity={0.4} />
              <ellipse cx={50} cy={0} rx={50} ry={6} fill={MODE_COLORS[command.mode]} opacity={0.4} />
              <circle cx={0} cy={0} r={10} fill="#222" stroke="#666" strokeWidth={2} />
            </g>
          </svg>
          <div className="text-center">
            <div
              className="rounded px-3 py-1 text-sm font-semibold text-white"
              style={{ background: MODE_COLORS[command.mode] }}
            >
              {command.mode}
            </div>
            <div className="mt-1 text-xs text-foreground/60">PWM duty {dutyPercent.toFixed(1)}%</div>
          </div>
        </div>

        <div className="rounded-md border border-foreground/15 p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-foreground/60">
            speedometer
          </div>
          <div className="font-mono text-3xl">{rpm} RPM</div>
          <div className="text-xs text-foreground/60">
            {pulsesThisSecond} pulses last second × 3 (signed by direction)
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-12 text-right">PWM</span>
              <div className="h-2 flex-1 rounded bg-foreground/10">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${Math.min(100, (command.pwm / MOTOR_MAX) * 100)}%`,
                    background: MODE_COLORS[command.mode],
                  }}
                />
              </div>
              <span className="w-12">{command.pwm}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-12 text-right">|RPM|</span>
              <div className="h-2 flex-1 rounded bg-foreground/10">
                <div
                  className="h-full rounded bg-blue-500"
                  style={{
                    width: `${Math.min(100, (Math.abs(rpm) / FULL_THROTTLE_RPM) * 100)}%`,
                  }}
                />
              </div>
              <span className="w-12">{Math.abs(rpm)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
