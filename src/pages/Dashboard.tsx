import React, { useState } from "react";
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
  Bell,
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
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import PremiumTooltip from "@/components/PremiumTooltip";

export default function Dashboard() {
  const { user } = useAuth();
  const {
    preferences,
    workspaces,
    projects,
    tasks,
    goals,
    habits,
    activityLogs,
    notifications,
    achievements,
    focusSessions,
    developerMetrics,
    timer,
    startFocus,
    stopFocus,
    completeOnboarding,
    addWorkspace,
    addProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    addGoal,
    toggleGoalMilestone,
    deleteGoal,
    toggleHabitToday,
    dismissNotification,
    clearAllNotifications,
    resetAccount
  } = useProductivity();

  // Task form modal/input states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("medium");
  const [taskProjId, setTaskProjId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskEstTime, setTaskEstTime] = useState(1);
  const [taskTagsText, setTaskTagsText] = useState("");
  const [taskFilterStatus, setTaskFilterStatus] = useState<"All" | "Todo" | "In Progress" | "Review" | "Complete">("All");

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

  // Notifications tray state
  const [showNotifTray, setShowNotifTray] = useState(false);

  // Math Computations (No mock data!)
  const totalTasksCount = tasks.length;
  const completedTasksList = tasks.filter(t => t.status === "Complete");
  const completedCount = completedTasksList.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 105) / 1.05 : 0;
  
  // Real focus accumulated time
  const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const focusHours = Number((totalFocusMinutes / 60).toFixed(1));

  // Productivity Index calculation: weighted average of completed tasks ratio and logged habits
  const activeHabitsTodayCount = habits.filter(h => h.completed_days.includes(new Date().toISOString().split("T")[0])).length;
  const habitRatio = habits.length > 0 ? activeHabitsTodayCount / habits.length : 0;
  const rawScore = (completionRate * 0.6) + (habitRatio * 100 * 0.4);
  const productivityScore = totalTasksCount > 0 ? Math.min(100, Math.round(rawScore)) : 50;

  // Active notifications counter
  const unreadNotifications = notifications.filter(n => !n.read);

  // Filtered Tasks list
  const filteredTasks = tasks.filter(t => {
    if (taskFilterStatus === "All") return true;
    return t.status === taskFilterStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    
    addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      due_date: taskDueDate,
      priority: taskPriority,
      tags: taskTagsText ? taskTagsText.split(",").map(s => s.trim()) : [],
      status: "Todo",
      estimated_time: Number(taskEstTime) || 1,
      actual_time: 0,
      project_id: taskProjId || undefined
    });

    setTaskTitle("");
    setTaskDesc("");
    setTaskTagsText("");
    setTaskDueDate("");
    setTaskEstTime(1);
    setTaskProjId("");
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    addProject(
      projName.trim(),
      projDesc.trim(),
      projDeadline,
      projMilestonesInput ? projMilestonesInput.split(",").map(m => m.trim()) : []
    );
    setProjName("");
    setProjDesc("");
    setProjDeadline("");
    setProjMilestonesInput("");
    setShowProjForm(false);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    addGoal(
      goalTitle.trim(),
      goalType,
      goalTargetDate,
      goalMilestonesText ? goalMilestonesText.split(",").map(m => m.trim()) : []
    );
    setGoalTitle("");
    setGoalTargetDate("");
    setGoalMilestonesText("");
    setShowGoalForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 font-sans text-[#2E2E2E]">
      
      {/* Dynamic Upper Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/75 border border-[#6F4E37]/10 p-6 rounded-3xl shadow-sm">
        <div>
          <span className="text-[10px] bg-[#6F4E37]/5 px-2.5 py-1 rounded-md text-[#6F4E37] font-mono tracking-widest font-black uppercase">
            CreamFlow Elite Command Room
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#6F4E37] tracking-tight mt-2.5">
            Flow Centre HQ <span className="font-sans text-xs italic text-[#7A6F62] ml-1">Sovereign State Mode</span>
          </h1>
          <p className="text-xs text-[#7A6F62] mt-1 font-medium leading-relaxed">
            Welcome back, <strong className="text-[#6F4E37]">{user?.user_metadata?.full_name || user?.email?.split("@")[0]}</strong>. You are currently tracking performance metrics in <strong className="text-[#6F4E37]">"{workspaces[0]?.name || "Main Workspace"}"</strong>.
          </p>
        </div>

        {/* Global Action Tools & Notifications Icon */}
        <div className="flex items-center gap-2 relative">
          
          <PremiumTooltip 
            content={{
              title: "System Notifications",
              description: "Monitors deadlines list, milestone thresholds, and productivity prompts.",
              bestPractice: "Address active reminders to maintain streak rhythm."
            }}
          >
            <button
              onClick={() => setShowNotifTray(!showNotifTray)}
              className="p-3 rounded-2xl bg-white border border-[#6F4E37]/15 text-[#6F4E37] hover:bg-[#6F4E37]/5 transition relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4A017] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </PremiumTooltip>

          {/* Quick factory reset button */}
          <PremiumTooltip
            content={{
              title: "Factory Reset Engine",
              description: "Purges custom workspaces and active task data. Returns platform into first-time onboarding.",
              bestPractice: "Only execute when you explicitly request a pristine restart."
            }}
          >
            <button
              onClick={() => {
                if (confirm("Are you absolutely sure you wish to completely archive your CreamFlow account? All workspaces, tasks, and journals will be permanently reset.")) {
                  resetAccount();
                }
              }}
              className="p-3 rounded-2xl bg-[#FFF8E7] border border-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/5 transition cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-[#EF4444]" />
            </button>
          </PremiumTooltip>

          {/* Absolute Floating Notifications Panel */}
          <AnimatePresence>
            {showNotifTray && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-3 w-80 bg-white border border-[#6F4E37]/15 rounded-3xl shadow-xl z-[90] p-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-[#6F4E37]/10 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-[#6F4E37] uppercase tracking-wider">Active Reminders</h4>
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] font-bold text-[#D4A017] hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-[11px] text-[#7A6F62] py-2 text-center italic">No active system alerts.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-xl border text-[11px] ${
                          n.read
                            ? "bg-white border-[#6F4E37]/5 text-[#7A6F62]"
                            : "bg-[#FFF8E7] border-[#D4A017]/25 text-[#2E2E2E]"
                        }`}
                        onClick={() => dismissNotification(n.id)}
                      >
                        <div className="font-bold flex justify-between items-center text-[#6F4E37]">
                          <span>{n.title}</span>
                          <span className="text-[8px] font-mono text-[#D4A017]">{n.type}</span>
                        </div>
                        <p className="mt-0.5 leading-relaxed">{n.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Analytics Suite: Four Premium Informative Containers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <PremiumTooltip
          content={{
            title: "Task Completion Index",
            description: "Percentage of completed objectives verified in active workspace databases.",
            bestPractice: "Continuously check off completed review steps to raise this score."
          }}
        >
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Completeness Rating</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-serif font-black text-[#6F4E37]">{Math.round(completionRate)}%</span>
              <span className="text-xs text-[#D4A017] font-semibold">{completedCount} of {totalTasksCount} tasks</span>
            </div>
            <div className="w-full bg-[#FFF8E7] h-1.5 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${completionRate}%` }} className="h-full bg-[#6F4E37] rounded-full transition-all" />
            </div>
            <TrendingUp className="absolute right-4 bottom-4 w-10 h-10 text-[#6F4E37]/5 pointer-events-none" />
          </div>
        </PremiumTooltip>

        <PremiumTooltip
          content={{
            title: "Dynamic Focus Accrual",
            description: "Direct measurement of cumulative focused sprint minutes from deep concentration timers.",
            bestPractice: "Perform at least two full blocks of focus daily to unlock high-capacity badges."
          }}
        >
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Concentration Focus Hour Log</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-serif font-black text-[#6F4E37]">{focusHours}h</span>
              <span className="text-xs text-[#7A6F62] font-semibold">{totalFocusMinutes} minutes</span>
            </div>
            <p className="text-[10px] text-[#7A6F62] mt-3 font-medium">Recorded across actual concentration sessions.</p>
            <Clock className="absolute right-4 bottom-4 w-10 h-10 text-[#6F4E37]/5 pointer-events-none" />
          </div>
        </PremiumTooltip>

        <PremiumTooltip
          content={{
            title: "Calculated Productivity Score",
            description: "Integrated SaaS index tracking your task success and completed routines.",
            bestPractice: "Combine focus hours and checked-off habits to push score past 85+."
          }}
        >
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Flow Productivity Score</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-serif font-black text-[#6F4E37]">{productivityScore}</span>
              <span className="text-xs text-[#4CAF50] font-mono font-bold">FLOW LIVE</span>
            </div>
            <div className="w-full bg-[#FFF8E7] h-1.5 rounded-full mt-3 overflow-hidden">
              <div style={{ width: `${productivityScore}%` }} className="h-full bg-[#D4A017] rounded-full transition-all" />
            </div>
            <Cpu className="absolute right-4 bottom-4 w-10 h-10 text-[#6F4E37]/5 pointer-events-none" />
          </div>
        </PremiumTooltip>

        <PremiumTooltip
          content={{
            title: "Developer Domain Energy Focus",
            description: "Aggregates technical metrics to display your learning speed.",
            bestPractice: "Track both coding hours and study timelines for structured presentations."
          }}
        >
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm relative overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#7A6F62] tracking-wider block">Engineering Hours</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-serif font-black text-[#6F4E37]">{developerMetrics.coding_hours}</span>
              <span className="text-xs text-[#7A6F62] font-semibold">hours coding</span>
            </div>
            <p className="text-[10px] text-[#D4A017] font-semibold mt-3 flex items-center gap-1">
              <span>🚀</span> {developerMetrics.learning_hours} hours study prep
            </p>
            <Coffee className="absolute right-4 bottom-4 w-10 h-10 text-[#6F4E37]/5 pointer-events-none" />
          </div>
        </PremiumTooltip>

      </div>

      {/* Core Split Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Smart Task sprint tracker & Habits checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Smart Tasks Segment */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#6F4E37]/10 pb-4">
              <div>
                <h3 className="text-lg font-serif font-black text-[#6F4E37]">SaaS Smart Task Backlog</h3>
                <p className="text-xs text-[#7A6F62]">Manage timelines, due dates, statuses and estimation points cleanly.</p>
              </div>

              {/* Status Filter */}
              <div className="flex gap-1 overflow-x-auto bg-[#FFF8E7] p-1 rounded-xl border border-[#6F4E37]/10">
                {(["All", "Todo", "In Progress", "Review", "Complete"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setTaskFilterStatus(s)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      taskFilterStatus === s
                        ? "bg-[#6F4E37] text-white"
                        : "text-[#7A6F62] hover:text-[#6F4E37]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Task Add Mini Form */}
            <form onSubmit={handleCreateTask} className="p-4 bg-[#FFF8E7]/40 rounded-2xl border border-[#6F4E37]/10 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Focus sprint objective..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none focus:border-[#6F4E37] text-[#2E2E2E]"
                  required
                />
                <input
                  type="text"
                  placeholder="Description (Optional)..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-xl p-3 focus:outline-none focus:border-[#6F4E37] text-[#2E2E2E]"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* Due Date */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#7A6F62]">Due Date</span>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-xl p-2 focus:outline-none text-[#2E2E2E]"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#7A6F62]">Priority</span>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-xl p-2 focus:outline-none text-[#2E2E2E]"
                  >
                    <option value="high">🌋 High Priority</option>
                    <option value="medium">⚡ Medium</option>
                    <option value="low">☕ Low Flow</option>
                  </select>
                </div>

                {/* Estimated time */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#7A6F62]">Est Hours</span>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={taskEstTime}
                    onChange={(e) => setTaskEstTime(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-xl p-2 focus:outline-none text-[#2E2E2E]"
                  />
                </div>

                {/* Project map link */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#7A6F62]">Link Project</span>
                  <select
                    value={taskProjId}
                    onChange={(e) => setTaskProjId(e.target.value)}
                    className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-xl p-2 focus:outline-none text-[#2E2E2E]"
                  >
                    <option value="">No Project Link</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="flex justify-between items-center pt-2">
                <input
                  type="text"
                  placeholder="Tags (Comma separated: Refactor, UI, Core)..."
                  value={taskTagsText}
                  onChange={(e) => setTaskTagsText(e.target.value)}
                  className="text-[10px] bg-transparent border-none placeholder-[#7A6F62]/60 focus:ring-0 text-[#2E2E2E] w-[70%]"
                />
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#6F4E37] text-white font-bold rounded-xl text-xs hover:bg-[#5a3e2b] transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Push Task</span>
                </button>
              </div>
            </form>

            {/* Smart Task Queue display */}
            <div className="space-y-2">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-10 bg-[#FFF8E7]/25 rounded-2xl border border-dashed border-[#6F4E37]/15">
                  <FolderDot className="w-8 h-8 mx-auto text-[#7A6F62]/30" />
                  <p className="text-xs text-[#7A6F62] mt-2 font-medium">No active tasks in state matching this filter status.</p>
                  <p className="text-[10.5px] text-[#D4A017] font-semibold mt-1">Setup first workflows during onboarding wizard or add above.</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-white border border-[#6F4E37]/10 rounded-2xl shadow-sm hover:border-[#6F4E37]/25 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      
                      {/* Interactive checkbox */}
                      <button
                        onClick={() => {
                          const nextStatus = task.status === "Complete" ? "Todo" : "Complete";
                          updateTask(task.id, { status: nextStatus });
                        }}
                        className="text-[#7A6F62] hover:text-[#6F4E37] mt-0.5 cursor-pointer"
                      >
                        {task.status === "Complete" ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4CAF50]" />
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-[#6F4E37]/35" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold leading-tight ${task.status === "Complete" ? "line-through text-[#7A6F62]" : "text-[#2E2E2E]"}`}>
                            {task.title}
                          </span>
                          
                          {/* Priority Ribbon */}
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                            task.priority === "high"
                              ? "bg-[#EF4444]/15 text-[#EF4444]"
                              : task.priority === "medium"
                              ? "bg-[#F59E0B]/15 text-[#F59E0B]"
                              : "bg-[#6F4E37]/15 text-[#6F4E37]"
                          }`}>
                            {task.priority}
                          </span>

                          {/* Est/Actual hours indicator */}
                          <span className="text-[9px] font-mono bg-[#6F4E37]/5 px-1.5 rounded text-[#6F4E37]">
                            ⏱️ {task.actual_time || 0}/{task.estimated_time}h
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-[11px] text-[#7A6F62] leading-relaxed line-clamp-1">{task.description}</p>
                        )}

                        {/* Tags display */}
                        {task.tags.length > 0 && (
                          <div className="flex gap-1.5 pt-1.5">
                            {task.tags.map(t => (
                              <span key={t} className="text-[9px] font-mono font-semibold bg-[#FFF8E7] text-[#6F4E37] px-2 py-0.5 rounded-md border border-[#6F4E37]/10">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Task Actions Control Bar */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      
                      {/* Cycle status changer */}
                      <select
                        value={task.status}
                        onChange={(e) => updateTask(task.id, { status: e.target.value as any })}
                        className="bg-[#FFF8E7] border border-[#6F4E37]/15 rounded-lg text-[10px] font-bold py-1 px-1.5 text-[#6F4E37]"
                      >
                        <option value="Todo">Todo</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Complete">Complete</option>
                      </select>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 px-2 hover:bg-[#EF4444]/5 text-[#7A6F62] hover:text-[#EF4444] rounded-lg transition cursor-pointer"
                        title="Delete task permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Premium Habits Checklist Loop */}
          <div className="bg-white rounded-3xl p-6 border border-[#6F4E37]/10 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-serif font-black text-[#6F4E37]">SaaS Habits Focus Tracker</h3>
              <p className="text-xs text-[#7A6F62]">Optimize mental plasticity and developer routines. Display streaks from consecutive completions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 pt-2">
              {habits.map(h => {
                const todayStr = new Date().toISOString().split("T")[0];
                const completedToday = h.completed_days.includes(todayStr);
                return (
                  <PremiumTooltip
                    key={h.id}
                    content={{
                      title: h.name,
                      description: `Completing ${h.name} daily feeds focus neurons. Logs streak of positive days.`,
                      bestPractice: `Set a fixed morning schedule to check off routines easily.`
                    }}
                  >
                    <button
                      onClick={() => toggleHabitToday(h.id)}
                      className={`w-full p-4 rounded-2xl text-center border transition-all duration-300 flex flex-col items-center justify-between min-h-32 text-[#2E2E2E] cursor-pointer ${
                        completedToday
                          ? "bg-[#6F4E37]/10 border-[#6F4E37]/45 shadow-[#6F4E37]/10"
                          : "bg-white border-[#6F4E37]/10 hover:border-[#6F4E37]/35"
                      }`}
                    >
                      <div className="text-2xl">
                        {h.category === "Exercise" ? "💪" : h.category === "Reading" ? "📚" : h.category === "Coding" ? "💻" : h.category === "Water" ? "💧" : "😴"}
                      </div>
                      
                      <div className="space-y-1 my-2">
                        <span className="text-[10px] uppercase font-bold block leading-tight text-[#6F4E37]">{h.name}</span>
                        <span className="text-[9px] text-[#7A6F62] block">Completed: {h.completed_days.length}d</span>
                      </div>

                      <div className="text-[9px] font-mono font-black text-[#D4A017] flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 " />
                        <span>STREAK: {h.streak}d</span>
                      </div>
                    </button>
                  </PremiumTooltip>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Live Projects, Milestones, Active Goals, High-Capacity Badges & Timeline activity */}
        <div className="space-y-6">
          
          {/* Active Projects Container */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#6F4E37]/10 pb-2.5">
              <h3 className="text-sm font-serif font-black text-[#6F4E37]">Progress Tracking Projects</h3>
              <button
                onClick={() => setShowProjForm(!showProjForm)}
                className="text-[11px] font-bold text-[#D4A017] hover:underline cursor-pointer"
              >
                {showProjForm ? "Cancel" : "Add Project"}
              </button>
            </div>

            {showProjForm && (
              <form onSubmit={handleCreateProject} className="p-3 bg-[#FFF8E7]/40 rounded-xl border border-[#6F4E37]/10 space-y-2">
                <input
                  type="text"
                  placeholder="E.g. Portfolio Website"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="E.g. Core goals description"
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  className="w-full text-xs bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none"
                />
                <input
                  type="date"
                  value={projDeadline}
                  onChange={(e) => setProjDeadline(e.target.value)}
                  className="w-full text-xs bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Milestones (comma separated)..."
                  value={projMilestonesInput}
                  onChange={(e) => setProjMilestonesInput(e.target.value)}
                  className="w-full text-[10px] bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-[#6F4E37] text-white font-bold text-xs"
                >
                  Create Project
                </button>
              </form>
            )}

            <div className="space-y-3.5">
              {projects.length === 0 ? (
                <p className="text-[11px] text-[#7A6F62] italic py-2">No active projects logged yet.</p>
              ) : (
                projects.map(proj => (
                  <div key={proj.id} className="space-y-1 p-3 bg-[#FFF8E7]/15 rounded-2xl border border-[#6F4E37]/5 relative group">
                    <button
                      onClick={() => deleteProject(proj.id)}
                      className="absolute right-2.5 top-2 opacity-0 group-hover:opacity-100 transition duration-150 text-[#7A6F62] hover:text-[#EF4444]"
                      title="Archive Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#6F4E37]">{proj.name}</span>
                      <span className="text-[10px] font-mono font-bold text-[#D4A017]">{proj.progress}%</span>
                    </div>
                    {proj.description && (
                      <p className="text-[10px] text-[#7A6F62] leading-relaxed">{proj.description}</p>
                    )}
                    
                    <div className="w-full bg-[#FFF8E7] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div style={{ width: `${proj.progress}%` }} className="h-full bg-[#6F4E37] rounded-full transition-all" />
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-[#7A6F62] pt-1">
                      <span>Tasks: {proj.doneCount}/{proj.doneCount + proj.remainingCount} Done</span>
                      {proj.deadline && <span className="text-[#D4A017]">Due: {proj.deadline}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Core Objectives (Goals) */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#6F4E37]/10 pb-2.5">
              <h3 className="text-sm font-serif font-black text-[#6F4E37]">Active Strategic Goals</h3>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="text-[11px] font-bold text-[#D4A017] hover:underline cursor-pointer"
              >
                {showGoalForm ? "Cancel" : "Add Goal"}
              </button>
            </div>

            {showGoalForm && (
              <form onSubmit={handleCreateGoal} className="p-3 bg-[#FFF8E7]/40 rounded-xl border border-[#6F4E37]/10 space-y-2 animate-fadeIn">
                <input
                  type="text"
                  placeholder="Goal Target (E.g. Core coding master)"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full text-xs font-bold bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none"
                  required
                />
                <select
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as any)}
                  className="w-full text-xs bg-white border border-[#6F4E37]/10 rounded-lg p-2 focus:outline-none text-[#2E2E2E]"
                >
                  <option value="monthly">📅 Monthly Target</option>
                  <option value="quarterly">🏛️ Quarterly Target</option>
                  <option value="yearly">🗽 Yearly Vision</option>
                </select>
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full text-xs bg-white border border-[#6F4E37]/15 rounded-lg p-2 focus:outline-none text-[#2E2E2E]"
                />
                <input
                  type="text"
                  placeholder="Key Milestones (comma-separated)..."
                  value={goalMilestonesText}
                  onChange={(e) => setGoalMilestonesText(e.target.value)}
                  className="w-full text-[10px] bg-white border border-[#6F4E37]/15 rounded-lg p-2 focus:outline-none text-[#2E2E2E]"
                />
                <button
                  type="submit"
                  className="w-full py-1.5 rounded-lg bg-[#6F4E37] text-white font-bold text-xs"
                >
                  Commit Goal
                </button>
              </form>
            )}

            <div className="space-y-3.5">
              {goals.length === 0 ? (
                <p className="text-[11px] text-[#7A6F62] italic py-2">No active Monthly/Yearly Objectives logged.</p>
              ) : (
                goals.map(g => (
                  <div key={g.id} className="p-3 bg-white border border-[#6F4E37]/10 rounded-2xl relative space-y-2">
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="absolute top-2 right-2 text-[#7A6F62] hover:text-[#EF4444] p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs uppercase tracking-wider font-mono font-bold text-[#D4A017]">{g.type}</span>
                      <span className="text-[10.5px] font-mono text-[#7A6F62]">{g.target_date}</span>
                    </div>

                    <h4 className="text-xs font-bold text-[#6F4E37] leading-tight">{g.title}</h4>

                    {/* Milestones list with checkbox */}
                    {g.milestones.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {g.milestones.map(m => (
                          <div key={m.id} className="flex items-center gap-1.5 text-[10.5px]">
                            <button
                              onClick={() => toggleGoalMilestone(g.id, m.id)}
                              className="text-[#7A6F62] focus:outline-none cursor-pointer"
                            >
                              {m.completed ? (
                                <CheckCircle className="w-3.5 h-3.5 text-[#4CAF50]" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded border border-[#6F4E37]/45" />
                              )}
                            </button>
                            <span className={m.completed ? "line-through text-[#7A6F62]" : "text-[#2E2E2E]"}>
                              {m.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="w-full bg-[#FFF8E7] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div style={{ width: `${g.progress}%` }} className="h-full bg-[#6F4E37] rounded-full transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Dynamic Achievement System Badges */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-3">
            <h3 className="text-sm font-serif font-black text-[#6F4E37] border-b border-[#6F4E37]/5 pb-2">
              Sovereignty Badges Portfolio
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {achievements.map(ach => (
                <PremiumTooltip
                  key={ach.id}
                  content={{
                    title: ach.title,
                    description: ach.unlockedAt 
                      ? `Unlocked on ${format(new Date(ach.unlockedAt), "MMM d, yyyy")}. ${ach.description}`
                      : `${ach.description}. Currently locked to mirror real workspace achievements.`,
                    bestPractice: "Track projects and complete active checklists to open additional achievements."
                  }}
                >
                  <div
                    className={`p-3 rounded-2xl text-center border transition-all duration-300 ${
                      ach.unlockedAt
                        ? "bg-[#6F4E37]/5 border-[#6F4E37]/25 text-neutral-800"
                        : "bg-white border-[#6F4E37]/5 opacity-40 select-none grayscale"
                    }`}
                  >
                    <span className="text-2xl block">{ach.icon}</span>
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#6F4E37] mt-1.5 block leading-tight">
                      {ach.title}
                    </span>
                  </div>
                </PremiumTooltip>
              ))}
            </div>
          </div>

          {/* activityLogs Real Activity Timeline feed */}
          <div className="bg-white rounded-3xl p-5 border border-[#6F4E37]/10 shadow-sm space-y-3">
            <h3 className="text-sm font-serif font-black text-[#6F4E37] border-b border-[#6F4E37]/5 pb-2">
              Security Audit Flow Log
            </h3>
            
            <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
              {activityLogs.length === 0 ? (
                <p className="text-[11px] text-[#7A6F62] py-2 italic">Nothing logged during this cycle.</p>
              ) : (
                activityLogs.map(log => (
                  <div key={log.id} className="text-[10.5px] leading-relaxed flex gap-2 border-l border-[#6F4E37]/15 pl-3 py-0.5 relative">
                    <div className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-[#D4A017]" />
                    <div>
                      <span className="text-[#6F4E37] font-semibold">[{log.action_type.toUpperCase()}]</span>{" "}
                      <span className="text-[#2E2E2E]">{log.description}</span>
                      <p className="text-[9px] text-[#7A6F62] font-mono mt-0.5">
                        {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
