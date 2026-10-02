import React, { useState, useMemo } from "react";
import { useProductivity, Task, Project, Goal, Habit } from "@/lib/ProductivityContext";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckSquare,
  TrendingUp,
  Award,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  Plus,
  Trash2,
  ChevronRight,
  Filter,
  CheckCircle,
  FolderDot,
  Lightbulb,
  Cpu,
  Bookmark,
  Coffee,
  Activity,
  UserCheck,
  Zap,
  RotateCcw,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { format } from "date-fns";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AnimatedCheckbox } from "@/components/motion/AnimatedCheckbox";
import { ShimmerText, MagneticButton } from "@/components/motion/MagneticButton";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/lib/utils";
import { audioService } from "@/lib/AudioService";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    preferences,
    workspaces,
    projects,
    tasks,
    goals,
    habits,
    activityLogs,
    achievements,
    focusSessions,
    developerMetrics,
    timer,
    startFocus,
    stopFocus,
    addProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addGoal,
    toggleGoalMilestone,
    deleteGoal,
    toggleHabitToday,
    resetAccount,
  } = useProductivity();

  // Task form modal/input states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("medium");
  const [taskProjId, setTaskProjId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskEstTime, setTaskEstTime] = useState(1);
  const [taskTagsText, setTaskTagsText] = useState("");
  const [taskFilterStatus, setTaskFilterStatus] = useState<
    "All" | "Todo" | "In Progress" | "Review" | "Complete"
  >("All");

  // Project creator states
  const [showProjForm, setShowProjForm] = useState(false);
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDeadline, setProjDeadline] = useState("");
  const [projMilestonesInput, setProjMilestonesInput] = useState("");

  // Goal creator states
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalMilestonesText, setGoalMilestonesText] = useState("");

  // Math Computations (Zero mock data - derived from actual activity)
  const totalTasksCount = tasks.length;
  const completedTasksList = tasks.filter((t) => t.status === "Complete");
  const completedCount = completedTasksList.length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  // Real focus accumulated time
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalFocusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;

  // Real productivity score derived from tasks + habits + study
  const productivityScore = useMemo(() => {
    if (totalTasksCount === 0 && habits.length === 0) return 0;
    const taskScore = completionRate * 0.5;
    const habitScore =
      habits.length > 0
        ? (habits.filter((h) => h.completed_today).length / habits.length) * 30
        : 15;
    const focusBonus = Math.min(20, (totalFocusMinutes / 60) * 5);
    return Math.min(100, Math.round(taskScore + habitScore + focusBonus));
  }, [completionRate, habits, totalTasksCount, totalFocusMinutes]);

  // Active streak
  const currentStreak = developerMetrics?.current_streak || 1;

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const tagsArray = taskTagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      priority: taskPriority,
      project_id: taskProjId || undefined,
      due_date: taskDueDate || undefined,
      estimated_time: Number(taskEstTime) || 1,
      actual_time: 0,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    });

    audioService.playSuccessChime();
    toast.success("Task created in workspace");
    setTaskTitle("");
    setTaskDesc("");
    setTaskTagsText("");
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    const ms = projMilestonesInput
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    await addProject({
      name: projName.trim(),
      description: projDesc.trim() || undefined,
      deadline: projDeadline || undefined,
      milestones: ms,
    });

    audioService.playSuccessChime();
    toast.success(`Project "${projName}" launched`);
    setProjName("");
    setProjDesc("");
    setProjMilestonesInput("");
    setShowProjForm(false);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const ms = goalMilestonesText
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean)
      .map((title, idx) => ({ id: `m-${Date.now()}-${idx}`, title, completed: false }));

    await addGoal({
      title: goalTitle.trim(),
      type: goalType,
      target_date: goalTargetDate || undefined,
      milestones: ms,
    });

    audioService.playSuccessChime();
    toast.success(`Strategic goal "${goalTitle}" locked in`);
    setGoalTitle("");
    setGoalMilestonesText("");
    setShowGoalForm(false);
  };

  const filteredTasks = useMemo(() => {
    if (taskFilterStatus === "All") return tasks;
    return tasks.filter((t) => t.status === taskFilterStatus);
  }, [tasks, taskFilterStatus]);

  const userName =
    user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Leader";

  return (
    <div className="space-y-8 font-sans">
      {/* 1. HERO HEADER WITH SHIMMER & GREETING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-white via-white to-[#FFF8E7] p-6 sm:p-8 rounded-3xl border border-[#6F4E37]/15 shadow-sm relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#6F4E37]/10 text-[#6F4E37] rounded-lg">
              OPERATING HUB
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-[#D4A017]">
              <Flame className="w-3.5 h-3.5 fill-[#D4A017]" />
              <span>{currentStreak} Day Flow Streak</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#6F4E37] tracking-tight flex items-center gap-2">
            Welcome back, <ShimmerText text={userName} /> ☕
          </h1>
          <p className="text-xs text-[#7A6F62] max-w-xl leading-relaxed">
            Your unified workspace is calibrated. All metrics and completion timelines are computed
            in real time from your live tasks and focus sprints.
          </p>
        </div>

        {/* Quick Focus Sprint Launch Button */}
        <div className="flex items-center gap-3 relative z-10">
          <MagneticButton
            onClick={() => {
              startFocus(tasks[0]?.id || undefined, 25);
              navigate(createPageUrl("DailyFocus"));
              toast.success("Focus sprint activated!");
            }}
            className="px-5 py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-2xl shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#D4A017]" />
            <span>Launch 25m Focus Sprint</span>
          </MagneticButton>
        </div>
      </div>

      {/* 2. METRICS SPOTLIGHT BENTO GRID (REACT BITS STYLE) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Productivity Score */}
        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Flow Score
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber value={productivityScore} />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">/ 100</span>
          </div>
          <p className="text-[11px] text-[#7A6F62] mt-1 font-medium">Derived from habits & tasks</p>
        </SpotlightCard>

        {/* Tasks Completed */}
        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Completed Tasks
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber value={completedCount} />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">/ {totalTasksCount}</span>
          </div>
          <div className="mt-2 w-full bg-[#6F4E37]/10 h-1.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-[#6F4E37] h-full rounded-full"
            />
          </div>
        </SpotlightCard>

        {/* Deep Focus Time */}
        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Deep Focus Hours
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber
                value={totalFocusHours}
                format={(n) => n.toFixed(1)}
              />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">hrs</span>
          </div>
          <p className="text-[11px] text-[#7A6F62] mt-1 font-medium">
            {focusSessions.length} sessions logged
          </p>
        </SpotlightCard>

        {/* Habit Rhythm */}
        <SpotlightCard tiltEffect className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F62]">
              Habit Rhythm
            </span>
            <div className="p-2 rounded-xl bg-[#6F4E37]/10 text-[#6F4E37]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-serif font-black text-[#6F4E37]">
              <AnimatedNumber
                value={
                  habits.length > 0
                    ? habits.filter((h) => h.completed_today).length
                    : 0
                }
              />
            </span>
            <span className="text-xs text-[#7A6F62] font-semibold">/ {habits.length}</span>
          </div>
          <p className="text-[11px] text-[#7A6F62] mt-1 font-medium">
            {currentStreak} consecutive active days
          </p>
        </SpotlightCard>
      </div>

      {/* 3. CORE TWO-COLUMN COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Task Manager & Quick Entry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#6F4E37] flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#D4A017]" />
                  <span>Interactive Smart Tasks</span>
                </h2>
                <p className="text-xs text-[#7A6F62]">
                  Tick tasks to trigger celebration particles and real-time project updates
                </p>
              </div>

              {/* Fluid Filter Tabs with Animated Slider Pill */}
              <div className="flex p-1 bg-[#FFF8E7] rounded-xl border border-[#6F4E37]/10 relative">
                {(["All", "Todo", "In Progress", "Complete"] as const).map((st) => {
                  const isActive = taskFilterStatus === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setTaskFilterStatus(st)}
                      className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        isActive ? "text-white" : "text-[#7A6F62] hover:text-[#6F4E37]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="taskStatusTab"
                          transition={{ type: "spring", stiffness: 450, damping: 30 }}
                          className="absolute inset-0 bg-[#6F4E37] rounded-lg -z-10 shadow-xs"
                        />
                      )}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inline Quick Task Creator Form */}
            <form onSubmit={handleCreateTask} className="space-y-3 bg-[#FFF8E7]/40 p-4 rounded-2xl border border-[#6F4E37]/10">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new action task..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-white placeholder-[#7A6F62]/50"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={taskProjId}
                  onChange={(e) => setTaskProjId(e.target.value)}
                  className="p-2 text-xs font-medium border border-[#6F4E37]/15 rounded-xl bg-white focus:outline-none text-[#6F4E37]"
                >
                  <option value="">No Project (General)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="p-2 text-xs font-medium border border-[#6F4E37]/15 rounded-xl bg-white focus:outline-none text-[#6F4E37]"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority ⚡</option>
                </select>

                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="p-2 text-xs font-medium border border-[#6F4E37]/15 rounded-xl bg-white focus:outline-none text-[#6F4E37]"
                />
              </div>
            </form>

            {/* Task List */}
            <div className="space-y-2.5">
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#7A6F62]">
                    No tasks found in this filter view.
                  </div>
                ) : (
                  filteredTasks.map((task) => {
                    const isComplete = task.status === "Complete";
                    const project = projects.find((p) => p.id === task.project_id);

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isComplete
                            ? "bg-[#FFF8E7]/30 border-[#6F4E37]/10 opacity-75"
                            : "bg-white border-[#6F4E37]/15 hover:border-[#6F4E37]/30 shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <AnimatedCheckbox
                            checked={isComplete}
                            onChange={(checked) => {
                              updateTask(task.id, {
                                status: checked ? "Complete" : "Todo",
                              });
                              if (checked) {
                                audioService.playSuccessChime();
                              }
                            }}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold transition-all truncate ${
                                isComplete
                                  ? "line-through text-[#7A6F62]"
                                  : "text-[#2E2E2E]"
                              }`}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#7A6F62]">
                              {project && (
                                <span className="text-[#6F4E37] font-semibold">
                                  📁 {project.name}
                                </span>
                              )}
                              {task.due_date && <span>📅 {task.due_date}</span>}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                  task.priority === "high"
                                    ? "bg-red-50 text-red-600 border border-red-200"
                                    : task.priority === "medium"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-stone-100 text-stone-600"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Task Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              startFocus(task.id, 25);
                              navigate(createPageUrl("DailyFocus"));
                              toast.success(`Focus sprint started for "${task.title}"`);
                            }}
                            title="Focus on this task"
                            className="p-1.5 rounded-lg hover:bg-[#6F4E37]/10 text-[#6F4E37] transition cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#7A6F62] hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active Projects Tracker */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#6F4E37]/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#6F4E37] flex items-center gap-2">
                  <FolderDot className="w-5 h-5 text-[#D4A017]" />
                  <span>Project Milestones</span>
                </h2>
                <p className="text-xs text-[#7A6F62]">
                  Track progress across development, work sprints, and deliverables
                </p>
              </div>

              <button
                onClick={() => setShowProjForm(!showProjForm)}
                className="px-3 py-1.5 text-xs font-bold bg-[#6F4E37]/10 text-[#6F4E37] hover:bg-[#6F4E37]/20 rounded-xl transition cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>

            {/* Project Creator Form Modal Dropdown */}
            <AnimatePresence>
              {showProjForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateProject}
                  className="p-4 bg-[#FFF8E7]/50 rounded-2xl border border-[#6F4E37]/15 space-y-3"
                >
                  <input
                    type="text"
                    required
                    placeholder="Project Name..."
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full p-2.5 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none text-[#2E2E2E]"
                  />
                  <textarea
                    rows={2}
                    placeholder="Milestones (one per line)..."
                    value={projMilestonesInput}
                    onChange={(e) => setProjMilestonesInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none text-[#2E2E2E] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowProjForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl hover:bg-[#6F4E37]/10 text-[#7A6F62]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#6F4E37] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Create Project
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-[#7A6F62]">
                  No active projects yet. Click &ldquo;New Project&rdquo; to launch one.
                </div>
              ) : (
                projects.map((proj) => {
                  const projTasks = tasks.filter((t) => t.project_id === proj.id);
                  const projCompleted = projTasks.filter((t) => t.status === "Complete").length;
                  const progressPct =
                    projTasks.length > 0 ? Math.round((projCompleted / projTasks.length) * 100) : 0;

                  return (
                    <div
                      key={proj.id}
                      className="p-4 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/15 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-[#6F4E37] truncate">{proj.name}</h3>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="text-[#7A6F62] hover:text-red-500 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-[#7A6F62] font-semibold">
                          <span>
                            {projCompleted}/{projTasks.length} Tasks Done
                          </span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full bg-[#6F4E37]/10 h-1.5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-[#6F4E37] h-full rounded-full"
                          />
                        </div>
                      </div>

                      {proj.milestones && proj.milestones.length > 0 && (
                        <div className="pt-2 border-t border-[#6F4E37]/10 space-y-1">
                          <span className="text-[9px] uppercase font-bold text-[#7A6F62]">
                            Milestones
                          </span>
                          <div className="space-y-1">
                            {proj.milestones.slice(0, 3).map((m, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 text-[10px] text-[#2E2E2E]"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017]" />
                                <span className="truncate">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Daily Habits & Strategic Goals */}
        <div className="space-y-6">
          {/* Daily Habit Streaks */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4A017]" />
                <h3 className="text-sm font-serif font-bold text-[#6F4E37]">Daily Habit Loops</h3>
              </div>
              <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-wider">
                TODAY
              </span>
            </div>

            <div className="space-y-2.5">
              {habits.length === 0 ? (
                <p className="text-xs text-[#7A6F62] py-4 text-center">
                  No habits registered yet.
                </p>
              ) : (
                habits.map((habit) => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabitToday(habit.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      habit.completed_today
                        ? "bg-[#6F4E37]/10 border-[#6F4E37]/30 text-[#6F4E37]"
                        : "bg-[#FFF8E7]/30 border-[#6F4E37]/10 hover:border-[#6F4E37]/25 text-[#2E2E2E]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AnimatedCheckbox
                        checked={habit.completed_today}
                        onChange={() => toggleHabitToday(habit.id)}
                      />
                      <div>
                        <p className="text-xs font-bold">{habit.name}</p>
                        <p className="text-[10px] text-[#7A6F62]">
                          Streak: {habit.streak_count} days
                        </p>
                      </div>
                    </div>
                    {habit.completed_today && (
                      <span className="text-xs font-bold text-[#6F4E37]">Done ☕</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Strategic Goals & Milestones */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#D4A017]" />
                <h3 className="text-sm font-serif font-bold text-[#6F4E37]">Strategic Goals</h3>
              </div>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="text-xs text-[#6F4E37] font-bold hover:underline"
              >
                + Goal
              </button>
            </div>

            {/* Goal Creator Inline */}
            <AnimatePresence>
              {showGoalForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleCreateGoal}
                  className="p-3.5 bg-[#FFF8E7]/50 rounded-2xl border border-[#6F4E37]/15 space-y-2.5"
                >
                  <input
                    type="text"
                    required
                    placeholder="Objective title..."
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full p-2 text-xs font-semibold bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Milestones (one per line)..."
                    value={goalMilestonesText}
                    onChange={(e) => setGoalMilestonesText(e.target.value)}
                    className="w-full p-2 text-xs font-medium bg-white border border-[#6F4E37]/20 rounded-xl focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#6F4E37] text-white text-xs font-bold rounded-xl"
                    >
                      Save Goal
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-xs text-[#7A6F62] py-4 text-center">
                  No strategic goals established.
                </p>
              ) : (
                goals.map((goal) => {
                  const milestones = goal.milestones || [];
                  const doneMs = milestones.filter((m) => m.completed).length;
                  const msPct =
                    milestones.length > 0 ? Math.round((doneMs / milestones.length) * 100) : 0;

                  return (
                    <div
                      key={goal.id}
                      className="p-3.5 rounded-2xl bg-[#FFF8E7]/30 border border-[#6F4E37]/10 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-[#6F4E37] truncate">{goal.title}</p>
                        <span className="text-[10px] font-mono font-bold text-[#D4A017]">
                          {msPct}%
                        </span>
                      </div>

                      {milestones.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          {milestones.map((m) => (
                            <div
                              key={m.id}
                              onClick={() => toggleGoalMilestone(goal.id, m.id)}
                              className="flex items-center gap-2 cursor-pointer text-[11px]"
                            >
                              <AnimatedCheckbox
                                checked={m.completed}
                                size={16}
                                onChange={() => toggleGoalMilestone(goal.id, m.id)}
                              />
                              <span
                                className={`truncate ${
                                  m.completed ? "line-through text-[#7A6F62]" : "text-[#2E2E2E]"
                                }`}
                              >
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
