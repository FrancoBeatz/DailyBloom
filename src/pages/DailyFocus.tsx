import React, { useState, useEffect, useRef } from "react";
import { useProductivity, Task } from "@/lib/ProductivityContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  CheckCircle2,
  Circle,
  Trophy,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Clock,
  Lightbulb,
  Plus,
  Compass,
  Zap,
  Coffee,
  CheckSquare
} from "lucide-react";
import { format, subDays } from "date-fns";
import PremiumTooltip from "@/components/PremiumTooltip";

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
    achievements
  } = useProductivity();

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [ambientSound, setAmbientSound] = useState<"none" | "rain" | "clock" | "forest">("none");
  const [taskInput, setTaskInput] = useState("");
  const [selectedTaskForTimer, setSelectedTaskForTimer] = useState<string>("");

  // Synthesizer Audio State using pristine Web Audio API synthesis
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const startAmbientSynth = (type: typeof ambientSound) => {
    if (!soundEnabled) return;
    try {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.012, ctx.currentTime);
      gainNode.connect(ctx.destination);
      gainNodeRef.current = gainNode;

      if (type === "clock") {
        // Metronome clicks
        const interval = setInterval(() => {
          if (ambientSound !== "clock" || !soundEnabled || ctx.state === "closed") {
            clearInterval(interval);
            return;
          }
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.connect(g);
          g.connect(ctx.destination);
          g.gain.setValueAtTime(0.003, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.08);
          osc.frequency.setValueAtTime(900, ctx.currentTime);
          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }, 1000);
      } else if (type === "rain") {
        // Brown noise rain simulation
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.0; 
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const lowpass = ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.value = 400;

        whiteNoise.connect(lowpass);
        lowpass.connect(gainNode);
        whiteNoise.start();
      } else if (type === "forest") {
        // Forest waves sweep simulator
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(110, ctx.currentTime);
        
        const sweepEnv = ctx.createGain();
        sweepEnv.gain.setValueAtTime(0.015, ctx.currentTime);
        
        osc.connect(sweepEnv);
        sweepEnv.connect(gainNode);
        osc.start();
      }
    } catch (e) {
      console.log("Web Audio Context could not initialize", e);
    }
  };

  const handleAmbientChange = (type: typeof ambientSound) => {
    setAmbientSound(type);
    if (type === "none" || !soundEnabled) {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    } else {
      setTimeout(() => startAmbientSynth(type), 10);
    }
  };

  const toggleSoundConfig = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (!next && audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handleToggleButton = () => {
    if (timer.isRunning) {
      stopFocus();
    } else {
      startFocus(selectedTaskForTimer || undefined);
    }
  };

  const resetTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.totalDuration,
      minutes: Math.floor(prev.totalDuration / 60),
      seconds: 0
    }));
  };

  const selectTimerMode = (minutesDuration: number) => {
    const secs = minutesDuration * 60;
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: secs,
      totalDuration: secs,
      minutes: minutesDuration,
      seconds: 0
    }));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    
    addTask({
      title: taskInput.trim(),
      description: "Allocated inside Focus Chamber",
      due_date: new Date().toISOString().split("T")[0],
      priority: "medium",
      tags: ["Focus-Arena"],
      status: "Todo",
      estimated_time: 1,
      actual_time: 0
    });
    setTaskInput("");
  };

  // Keep top 3 tasks
  const uncompletedTasksList = tasks.filter(t => t.status !== "Complete");
  const topThreeObjectives = uncompletedTasksList.slice(0, 3);
  const completedTodayTasks = tasks.filter(t => t.status === "Complete" && t.updated_at.startsWith(new Date().toISOString().split("T")[0]));

  // Heatmap formulation: past 12 weeks representation
  const heatmapTotalDays = 12 * 7;
  const heatmapDaysGrid = Array.from({ length: heatmapTotalDays }).map((_, i) => {
    const targetDay = subDays(new Date(), heatmapTotalDays - 1 - i);
    const dayStr = targetDay.toISOString().split("T")[0];

    // count completions & focus minutes
    const comps = tasks.filter(t => t.status === "Complete" && t.updated_at.startsWith(dayStr)).length;
    const focMins = focusSessions
      .filter(s => s.created_at.startsWith(dayStr))
      .reduce((sum, item) => sum + item.duration_minutes, 0);

    const scoreRating = comps * 3 + Math.round(focMins / 5);

    return {
      date: targetDay,
      dayString: dayStr,
      completions: comps,
      focusMinutes: focMins,
      activityScore: scoreRating
    };
  });

  const getHeatmapColor = (score: number) => {
    if (score === 0) return "bg-white border border-[#6F4E37]/5";
    if (score <= 3) return "bg-[#6F4E37]/10 border border-[#6F4E37]/15";
    if (score <= 8) return "bg-[#6F4E37]/25 border border-[#6F4E37]/20";
    if (score <= 15) return "bg-[#6F4E37]/50 border border-[#6F4E37]/35 text-white";
    return "bg-[#6F4E37] text-white border border-transparent";
  };

  const elapsedPercent = timer.totalDuration > 0
    ? Math.round(((timer.totalDuration - timer.timeLeft) / timer.totalDuration) * 100)
    : 0;

  // Streak logic
  const getStreakNumber = () => {
    let streak = 0;
    let dayCursor = new Date();
    while (true) {
      const cursorString = dayCursor.toISOString().split("T")[0];
      const hasCompleteness = tasks.some(t => t.status === "Complete" && t.updated_at.startsWith(cursorString)) ||
                             focusSessions.some(s => s.created_at.startsWith(cursorString));
      if (hasCompleteness) {
        streak++;
        dayCursor = subDays(dayCursor, 1);
      } else {
        break;
      }
      if (streak > 500) break; 
    }
    return streak;
  };

  const streakValue = getStreakNumber();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#6F4E37]/10 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-[10px] bg-[#6F4E37]/5 px-2.5 py-1 rounded-md text-[#6F4E37] font-mono tracking-widest font-black uppercase">
            CreamFlow Cognitive Cocoon
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#6F4E37] tracking-tight mt-2">
            Focus Chamber <span className="font-sans text-xs italic text-[#7A6F62] ml-1">Distraction-Free Deep Sprints</span>
          </h1>
          <p className="text-xs text-[#7A6F62] mt-1 font-medium leading-relaxed">
            Lower cognitive load. Isolate your active top 3 objectives, toggle ambient neuron-ticking sounds, and log real-time hours.
          </p>
        </div>

        {/* Running Streak badge */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#FFF8E7] border border-[#6F4E37]/25 rounded-2xl shadow-sm">
          <Flame className="w-5 h-5 text-[#D4A017] fill-[#D4A017]/10 animate-pulse" />
          <div className="text-left">
            <span className="text-[10px] text-[#7A6F62] font-mono uppercase font-bold tracking-wider block">Running Streak</span>
            <span className="text-xs font-bold text-[#6F4E37]">{streakValue} Day Flow Streak</span>
          </div>
        </div>
      </div>

      {/* Main Split Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Focus Clock Module & Binaural controllers */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#6F4E37]/[0.02] rounded-full filter blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-[#6F4E37]/10 pb-4">
              
              {/* Preset selectors */}
              <div className="flex gap-1.5 bg-[#FFF8E7] p-1 rounded-xl border border-[#6F4E37]/10">
                {[
                  { name: "Deep Work", mins: 25 },
                  { name: "Short Rest", mins: 5 },
                  { name: "Long Rest", mins: 15 }
                ].map(item => (
                  <button
                    key={item.name}
                    onClick={() => selectTimerMode(item.mins)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-[#7A6F62] hover:text-[#6F4E37]"
                  >
                    {item.name} ({item.mins}m)
                  </button>
                ))}
              </div>

              {/* White noise engine */}
              <div className="flex items-center gap-2">
                <PremiumTooltip
                  content={{
                    title: "Binaural Noise Engine",
                    description: "Toggles live Web Audio synthesis to mask distracting environment triggers.",
                    bestPractice: "Plug in your monitors and use 'Autumn Rain' during coding loops."
                  }}
                >
                  <button
                    onClick={toggleSoundConfig}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      soundEnabled
                        ? "border-[#6F4E37]/40 text-[#6F4E37] bg-[#FFF8E7]"
                        : "border-[#6F4E37]/10 text-[#7A6F62] hover:bg-[#6F4E37]/5"
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </PremiumTooltip>

                {soundEnabled && (
                  <select
                    value={ambientSound}
                    onChange={(e) => handleAmbientChange(e.target.value as any)}
                    className="bg-[#FFF8E7] text-[#6F4E37] border border-[#6F4E37]/15 rounded-xl text-xs p-1.5 focus:outline-none font-sans font-bold"
                  >
                    <option value="none">No Masking Noise</option>
                    <option value="rain">☕ Autumn Rain</option>
                    <option value="clock">⏱️ Focus Ticking Meter</option>
                    <option value="forest">🌌 Sub-Bass Sweep Wave</option>
                  </select>
                )}
              </div>

            </div>

            {/* Central Dial Timer Component */}
            <div className="flex flex-col items-center justify-center py-6 space-y-6">
              
              <div className="relative w-56 h-56 flex items-center justify-center">
                
                {/* Clock Circle SVG */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="112"
                    cy="112"
                    r="98"
                    className="stroke-[#FFF8E7]"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="112"
                    cy="112"
                    r="98"
                    className="stroke-[#6F4E37]"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 98}
                    animate={{
                      strokeDashoffset: (2 * Math.PI * 98) * (1 - elapsedPercent / 100),
                    }}
                    transition={{ duration: 1, ease: "linear" }}
                  />
                </svg>

                <div className="text-center z-10">
                  <span className="text-5xl font-mono font-black text-[#6F4E37] tracking-tight">
                    {String(timer.minutes).padStart(2, "0")}
                    <span className="text-[#D4A017] animate-pulse">:</span>
                    {String(timer.seconds).padStart(2, "0")}
                  </span>
                  <span className="text-[9px] tracking-widest uppercase text-[#7A6F62] block font-mono font-bold mt-1">
                    {timer.isRunning ? "Concentrating..." : "Ready to flow"}
                  </span>
                </div>

              </div>

              {/* Target Sprint Bind Select Option */}
              <div className="w-full max-w-xs space-y-1.5 text-center">
                <span className="text-[9px] uppercase font-bold text-[#7A6F62] tracking-wider block">Bind focus into action plan</span>
                <select
                  value={selectedTaskForTimer}
                  onChange={(e) => setSelectedTaskForTimer(e.target.value)}
                  className="w-full bg-[#FFF8E7]/60 border border-[#6F4E37]/15 rounded-xl p-2.5 text-xs text-[#2E2E2E] focus:outline-none text-center font-semibold"
                >
                  <option value="">No Bound Task (Raw Focus)</option>
                  {uncompletedTasksList.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Play Pause Controls */}
              <div className="flex gap-4">
                
                <button
                  onClick={handleToggleButton}
                  className="px-6 py-3 rounded-2xl bg-[#6F4E37] text-white font-bold text-xs flex items-center gap-1.5 hover:bg-[#5a3e2b] transition-all cursor-pointer shadow-md"
                >
                  {timer.isRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause Session
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" /> Trigger Concentration ☕
                    </>
                  )}
                </button>

                <button
                  onClick={resetTimer}
                  className="p-3 bg-[#FFF8E7] rounded-2xl border border-[#6F4E37]/20 text-[#6F4E37] hover:bg-[#6F4E37]/5 transition cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

          {/* Distraction-Free Top 3 Active Objectives list */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#6F4E37]/10 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#D4A017]" />
                <h3 className="text-sm font-serif font-black text-[#6F4E37]">Arena Primary Objectives</h3>
              </div>
              <span className="text-[10px] text-[#7A6F62] uppercase tracking-wider font-mono font-bold">Today's Focus Lock</span>
            </div>

            {topThreeObjectives.length === 0 ? (
              <div className="py-8 text-center bg-[#FFF8E7]/25 rounded-2xl border border-dashed border-[#6F4E37]/15">
                <p className="text-xs text-[#7A6F62] font-semibold">Focus Queue Empty. Lock new objectives below or inside Command Hub.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topThreeObjectives.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center p-4 bg-white border border-[#6F4E37]/10 rounded-2xl shadow-sm hover:border-[#6F4E37]/25 transition"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateTask(task.id, { status: "Complete" })}
                        className="text-[#7A6F62] hover:text-[#6F4E37] cursor-pointer"
                      >
                        <Circle className="w-5 h-5 text-[#6F4E37]" />
                      </button>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#6F4E37] block">{task.title}</span>
                        {task.tags.length > 0 && (
                          <span className="text-[8px] font-mono bg-[#FFF8E7] px-1.5 rounded text-[#D4A017] border border-[#6F4E37]/5">
                            #{task.tags[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[9px] font-mono tracking-wider font-bold text-[#D4A017] uppercase bg-[#6F4E37]/5 px-2 py-0.5 rounded">
                      Rank {index + 1}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

            {completedTodayTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#6F4E37]/10">
                <span className="text-[10px] text-[#7A6F62] uppercase tracking-wider font-mono font-bold">Successfully Logged Today</span>
                <div className="space-y-2 opacity-65">
                  {completedTodayTasks.map(t => (
                    <div key={t.id} className="flex items-center gap-2 text-xs text-[#7A6F62] line-through">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{t.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick adding objective */}
            <form onSubmit={handleAddTask} className="flex gap-2.5 pt-2">
              <input
                type="text"
                placeholder="Queue up another immediate milestone objectives..."
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                className="flex-1 bg-[#FFF8E7]/50 border border-[#6F4E37]/15 rounded-xl px-4 py-2.5 text-xs placeholder-[#7A6F62]/60 focus:outline-none focus:border-[#6F4E37] text-[#2E2E2E]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#6F4E37] text-white font-bold rounded-xl text-xs flex items-center gap-1 hover:bg-[#5a3e2b]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </form>

          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Heatmap Calendar Grid & Status panel */}
        <div className="space-y-6">
          
          {/* Quick Stats Panel */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-bold text-[#6F4E37] tracking-wider border-b border-[#6F4E37]/5 pb-2">
              Focus Chamber Metrics
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7A6F62]">Total Sprints Logged</span>
                <span className="font-mono font-bold text-[#6F4E37]">{focusSessions.length} sessions</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7A6F62]">Cumulative Focus Time</span>
                <span className="font-mono font-bold text-[#6F4E37]">
                  {focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0)} minutes
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#FFF8E7] rounded-xl border border-[#6F4E37]/10 text-[10.5px] leading-relaxed text-[#7A6F62]">
              💡 <strong>Hiring manager best practice:</strong> Recording consistent focus sprints allows you to discuss cognitive discipline with exact timestamps.
            </div>
          </div>

          {/* Badges System Sync list */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b border-[#6F4E37]/5 pb-2">
              <h3 className="text-xs uppercase font-bold text-[#6F4E37] tracking-wider">Focus Achievements</h3>
              <Trophy className="w-4 h-4 text-[#D4A017]" />
            </div>

            <p className="text-[10.5px] text-[#7A6F62] leading-relaxed">
              Maintain concentration streaks to unlock locked badges dynamically.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {achievements.slice(0, 3).map(ach => (
                <div
                  key={ach.id}
                  className={`p-2.5 rounded-xl text-center border transition-all duration-300 ${
                    ach.unlockedAt
                      ? "bg-[#6F4E37]/5 border-[#6F4E37]/25 text-neutral-800"
                      : "bg-white border-[#6F4E37]/5 opacity-45 grayscale"
                  }`}
                  title={ach.description}
                >
                  <span className="text-xl block">{ach.icon}</span>
                  <span className="text-[9px] font-bold block truncate mt-1 text-[#6F4E37]">{ach.title}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* FOOTER AREA: Github Style Activity Heatmap for Daily Focus Tracking */}
      <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#6F4E37]/10 pb-3">
          <div>
            <h3 className="text-sm font-serif font-black text-[#6F4E37]">SaaS Commitment Heatmap Grid</h3>
            <p className="text-xs text-[#7A6F62]">Visual audit representation of daily developer achievements (completions and concentration sprints).</p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-[#7A6F62] font-mono font-bold">
            <span>Less Flow</span>
            <span className="w-3 h-3 rounded bg-white border border-[#6F4E37]/10" />
            <span className="w-3 h-3 rounded bg-[#6F4E37]/10 border border-[#6F4E37]/15" />
            <span className="w-3 h-3 rounded bg-[#6F4E37]/25 border border-[#6F4E37]/20" />
            <span className="w-3 h-3 rounded bg-[#6F4E37]/50 border border-[#6F4E37]/35" />
            <span className="w-3 h-3 rounded bg-[#6F4E37] border border-transparent" />
            <span>High Intensity</span>
          </div>
        </div>

        {/* Heatmap renderer */}
        <div className="overflow-x-auto scrollbar-hide pt-2">
          <div className="min-w-[640px] flex gap-1.5 p-1">
            
            <div className="grid grid-rows-7 gap-1 pr-2.5 text-[9px] font-mono text-[#7A6F62] text-center select-none pt-4">
              <span>Sun</span>
              <span />
              <span>Tue</span>
              <span />
              <span>Thu</span>
              <span />
              <span>Sat</span>
            </div>

            <div className="flex-1 grid grid-flow-col grid-rows-7 gap-1">
              {heatmapDaysGrid.map(day => (
                <PremiumTooltip
                  key={day.dayString}
                  content={{
                    title: format(day.date, "MMMM d, yyyy"),
                    description: `${day.completions} tasks achieved and ${day.focusMinutes} minutes focused flow.`,
                    bestPractice: "Maintain continuous daily activity to build an impeccable audit profile."
                  }}
                >
                  <div
                    className={`w-4 h-4 rounded-md transition-all ${getHeatmapColor(day.activityScore)}`}
                  />
                </PremiumTooltip>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
