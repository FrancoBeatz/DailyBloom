import React, { useState, useEffect } from "react";
import { useProductivity, Task } from "@/lib/ProductivityContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  Plus,
  Coffee,
  CheckSquare,
  Wind,
  Music,
} from "lucide-react";
import { format } from "date-fns";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AnimatedCheckbox } from "@/components/motion/AnimatedCheckbox";
import { SoundWaveVisualizer, BreathingCircle } from "@/components/motion/SoundWaveVisualizer";
import { ShimmerText, MagneticButton } from "@/components/motion/MagneticButton";
import { audioService } from "@/lib/AudioService";
import { toast } from "sonner";

export default function DailyFocus() {
  const {
    tasks,
    timer,
    setTimerState,
    startFocus,
    stopFocus,
    focusSessions,
    logFocusSession,
    addTask,
    updateTask,
  } = useProductivity();

  const [ambientType, setAmbientType] = useState<"none" | "rain" | "cafe" | "binaural" | "whitenoise">("none");
  const [ambientActive, setAmbientActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(timer.active_task_id || "");
  const [activeTab, setActiveTab] = useState<"timer" | "breathing">("timer");
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale" | "Ready">("Ready");
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Quick task creation inside focus chamber
  const [newTaskTitle, setNewTaskTitle] = useState("");

  // Calculate timer values
  const totalSeconds = timer.duration_minutes * 60;
  const remainingSeconds = timer.seconds_remaining;
  const elapsedSeconds = totalSeconds - remainingSeconds;
  const progressPercent = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Active task details
  const activeTask = tasks.find((t) => t.id === selectedTaskId || t.id === timer.active_task_id);

  // Handle ambient sound toggle
  const handleAmbientChange = (type: typeof ambientType) => {
    if (type === "none" || (ambientActive && ambientType === type)) {
      audioService.stopAmbient();
      setAmbientActive(false);
      setAmbientType("none");
      toast.info("Ambient sound stopped");
    } else {
      audioService.startAmbient(type as any, 0.35);
      setAmbientActive(true);
      setAmbientType(type);
      toast.success(`Ambient ${type} active 🎧`);
    }
  };

  // Breathing cycle effect
  useEffect(() => {
    if (!isBreathingActive) {
      setBreathPhase("Ready");
      return;
    }

    let isMounted = true;
    const runCycle = async () => {
      while (isMounted && isBreathingActive) {
        setBreathPhase("Inhale");
        await new Promise((r) => setTimeout(r, 4000));
        if (!isMounted || !isBreathingActive) break;

        setBreathPhase("Hold");
        await new Promise((r) => setTimeout(r, 4000));
        if (!isMounted || !isBreathingActive) break;

        setBreathPhase("Exhale");
        await new Promise((r) => setTimeout(r, 4000));
        if (!isMounted || !isBreathingActive) break;

        setBreathPhase("Hold");
        await new Promise((r) => setTimeout(r, 2000));
      }
    };

    runCycle();
    return () => {
      isMounted = false;
    };
  }, [isBreathingActive]);

  // Preset durations
  const setPreset = (minsCount: number) => {
    stopFocus();
    setTimerState({
      is_running: false,
      duration_minutes: minsCount,
      seconds_remaining: minsCount * 60,
      active_task_id: selectedTaskId || null,
    });
    toast.info(`Timer set to ${minsCount} minutes`);
  };

  const handleCreateFocusTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = await addTask({
      title: newTaskTitle.trim(),
      priority: "high",
      estimated_time: 1,
    });
    audioService.playSuccessChime();
    toast.success("Task locked into focus chamber");
    setSelectedTaskId(newTask.id);
    setNewTaskTitle("");
  };

  const totalFocusMins = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#D4A017]">
            DEEP WORK SANCTUARY
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#6F4E37] tracking-tight flex items-center gap-2">
            Focus Chamber ☕
          </h1>
          <p className="text-xs text-[#7A6F62]">
            Immerse in uninterrupted flow blocks. Time is automatically synchronized to your tasks.
          </p>
        </div>

        {/* Focus Mode Selector (Timer vs Breathing) */}
        <div className="flex p-1 bg-white rounded-2xl border border-[#6F4E37]/15 shadow-xs relative">
          <button
            onClick={() => setActiveTab("timer")}
            className={`relative px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "timer" ? "text-white" : "text-[#7A6F62] hover:text-[#6F4E37]"
            }`}
          >
            {activeTab === "timer" && (
              <motion.div
                layoutId="focusChamberTab"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-[#6F4E37] rounded-xl -z-10 shadow-xs"
              />
            )}
            <Clock className="w-3.5 h-3.5" />
            <span>Deep Work Timer</span>
          </button>

          <button
            onClick={() => setActiveTab("breathing")}
            className={`relative px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "breathing" ? "text-white" : "text-[#7A6F62] hover:text-[#6F4E37]"
            }`}
          >
            {activeTab === "breathing" && (
              <motion.div
                layoutId="focusChamberTab"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute inset-0 bg-[#6F4E37] rounded-xl -z-10 shadow-xs"
              />
            )}
            <Wind className="w-3.5 h-3.5" />
            <span>Mindful Reset</span>
          </button>
        </div>
      </div>

      {/* MAIN FOCUS ZONE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Central Timer / Breathing Display */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 sm:p-12 border border-[#6F4E37]/15 shadow-sm text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[480px]">
          {/* Ambient visualizer in background */}
          {ambientActive && (
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF8E7] border border-[#6F4E37]/10 text-xs text-[#6F4E37] font-semibold">
              <SoundWaveVisualizer isPlaying={true} barCount={6} height={16} />
              <span className="capitalize">{ambientType} Playing</span>
            </div>
          )}

          {activeTab === "timer" ? (
            <div className="w-full max-w-md mx-auto space-y-8">
              {/* Circular Radial Timer Progress */}
              <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="text-[#FFF8E7]"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="44"
                    className="text-[#6F4E37]"
                    strokeWidth="5"
                    strokeDasharray="276.46"
                    animate={{
                      strokeDashoffset: 276.46 - (276.46 * progressPercent) / 100,
                    }}
                    transition={{ duration: 0.5, ease: "linear" }}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>

                {/* Digital Countdown Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl sm:text-6xl font-serif font-black text-[#6F4E37] tracking-tight font-mono">
                    {timeFormatted}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4A017] mt-1">
                    {timer.is_running ? "SPRINT IN PROGRESS" : "READY TO FLOW"}
                  </span>
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    stopFocus();
                    setTimerState({
                      is_running: false,
                      seconds_remaining: timer.duration_minutes * 60,
                    });
                  }}
                  className="p-3.5 rounded-2xl bg-[#FFF8E7] hover:bg-[#6F4E37]/10 text-[#6F4E37] transition cursor-pointer"
                  title="Reset Sprint"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                <MagneticButton
                  onClick={() => {
                    if (timer.is_running) {
                      stopFocus();
                      toast.info("Focus session paused");
                    } else {
                      startFocus(selectedTaskId || undefined, timer.duration_minutes);
                      audioService.playTimerDing();
                      toast.success("Focus sprint activated!");
                    }
                  }}
                  className="px-8 py-4 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-2xl shadow-lg font-serif font-bold text-sm flex items-center gap-2.5 cursor-pointer"
                >
                  {timer.is_running ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause Sprint</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-white" />
                      <span>Start Focus Block</span>
                    </>
                  )}
                </MagneticButton>
              </div>

              {/* Interval Presets */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {[
                  { label: "25m Sprint", mins: 25 },
                  { label: "50m Deep Flow", mins: 50 },
                  { label: "5m Break", mins: 5 },
                  { label: "15m Long Rest", mins: 15 },
                ].map((p) => (
                  <button
                    key={p.mins}
                    onClick={() => setPreset(p.mins)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      timer.duration_minutes === p.mins
                        ? "bg-[#6F4E37]/10 border-[#6F4E37] text-[#6F4E37]"
                        : "bg-white border-[#6F4E37]/15 text-[#7A6F62] hover:border-[#6F4E37]/30"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Breathing Guide View */
            <div className="w-full max-w-md mx-auto space-y-8 py-4">
              <BreathingCircle phase={breathPhase} size={220} />

              <div className="space-y-2">
                <h3 className="text-xl font-serif font-bold text-[#6F4E37]">
                  4-4-4 Box Breathing
                </h3>
                <p className="text-xs text-[#7A6F62] max-w-xs mx-auto">
                  Reset your nervous system before complex coding or sprint cycles.
                </p>
              </div>

              <MagneticButton
                onClick={() => setIsBreathingActive(!isBreathingActive)}
                className="px-8 py-3.5 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white rounded-2xl shadow-md font-serif font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer"
              >
                {isBreathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isBreathingActive ? "Pause Exercise" : "Begin Box Breathing"}</span>
              </MagneticButton>
            </div>
          )}
        </div>

        {/* Right Column: Linked Focus Task & Ambient Audio */}
        <div className="space-y-6">
          {/* Linked Target Task */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#D4A017]" />
                <h3 className="text-sm font-serif font-bold text-[#6F4E37]">Target Focus Task</h3>
              </div>
              <span className="text-[10px] font-bold text-[#6F4E37] uppercase">ACTIVE</span>
            </div>

            {/* Task selector dropdown */}
            <select
              value={selectedTaskId}
              onChange={(e) => {
                setSelectedTaskId(e.target.value);
                setTimerState({ active_task_id: e.target.value || null });
              }}
              className="w-full p-3 text-xs font-semibold bg-[#FFF8E7]/40 border border-[#6F4E37]/20 rounded-xl text-[#6F4E37] focus:outline-none"
            >
              <option value="">Select a task to link...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>

            {/* If task is selected, show details */}
            {activeTask && (
              <div className="p-3.5 rounded-2xl bg-[#FFF8E7]/50 border border-[#6F4E37]/15 space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6F4E37]">{activeTask.title}</span>
                  <AnimatedCheckbox
                    checked={activeTask.status === "Complete"}
                    onChange={(checked) => {
                      updateTask(activeTask.id, {
                        status: checked ? "Complete" : "Todo",
                      });
                      if (checked) audioService.playSuccessChime();
                    }}
                  />
                </div>
                {activeTask.description && (
                  <p className="text-[11px] text-[#7A6F62]">{activeTask.description}</p>
                )}
                <div className="flex items-center gap-3 text-[10px] text-[#7A6F62] pt-1 border-t border-[#6F4E37]/10">
                  <span>Est: {activeTask.estimated_time}h</span>
                  <span>Logged: {activeTask.actual_time || 0}h</span>
                </div>
              </div>
            )}

            {/* Quick Task Creation */}
            <form onSubmit={handleCreateFocusTask} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Or quick add focus task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="flex-1 p-2.5 text-xs font-medium bg-[#FFF8E7]/30 border border-[#6F4E37]/20 rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 bg-[#6F4E37] text-white rounded-xl text-xs font-bold hover:bg-[#5a3e2b] cursor-pointer"
              >
                +
              </button>
            </form>
          </div>

          {/* Ambient Sound Synthesizer Panel */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#D4A017]" />
                <h3 className="text-sm font-serif font-bold text-[#6F4E37]">Ambient Flow Sound</h3>
              </div>
              {ambientActive && <SoundWaveVisualizer isPlaying={true} barCount={4} height={12} />}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "cafe", label: "Warm Cafe ☕", desc: "Filtered organic flutter" },
                { id: "rain", label: "Rain Storm 🌧️", desc: "Brown noise relaxation" },
                { id: "binaural", label: "432Hz Binaural 🎧", desc: "Theta deep focus wave" },
                { id: "whitenoise", label: "Pure Stream 🌊", desc: "Zero-distraction filter" },
              ].map((sound) => {
                const isSelected = ambientActive && ambientType === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleAmbientChange(sound.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#6F4E37] text-white border-transparent shadow-md"
                        : "bg-[#FFF8E7]/40 border-[#6F4E37]/15 hover:border-[#6F4E37]/30 text-[#2E2E2E]"
                    }`}
                  >
                    <p className="text-xs font-bold">{sound.label}</p>
                    <p
                      className={`text-[9px] mt-0.5 ${
                        isSelected ? "text-white/80" : "text-[#7A6F62]"
                      }`}
                    >
                      {sound.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
