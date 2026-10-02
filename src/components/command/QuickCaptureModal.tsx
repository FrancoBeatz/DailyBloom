import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckSquare,
  FolderDot,
  Target,
  Zap,
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Tag,
  Layers,
  Sparkles,
} from "lucide-react";
import { useProductivity, Task, Goal } from "@/lib/ProductivityContext";
import { toast } from "sonner";
import { audioService } from "@/lib/AudioService";

interface QuickCaptureModalProps {
  isOpen: boolean;
  initialTab?: "task" | "project" | "goal" | "habit" | "learning";
  onClose: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  initialTab = "task",
  onClose,
}) => {
  const {
    projects,
    workspaces,
    addTask,
    addProject,
    addGoal,
    addHabit,
    addLearningTopic,
    saveJournalEntry,
  } = useProductivity();

  const [activeTab, setActiveTab] = useState<"task" | "project" | "goal" | "habit" | "learning">(
    initialTab
  );

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState<Task["priority"]>("medium");
  const [taskProjId, setTaskProjId] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskEstHours, setTaskEstHours] = useState(1);
  const [taskTags, setTaskTags] = useState("");

  // Project form state
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projDeadline, setProjDeadline] = useState("");
  const [projMilestones, setProjMilestones] = useState("");

  // Goal form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<Goal["type"]>("monthly");
  const [goalTargetDate, setGoalTargetDate] = useState("");
  const [goalMilestones, setGoalMilestones] = useState("");

  // Habit form state
  const [habitName, setHabitName] = useState("");
  const [habitTargetDays, setHabitTargetDays] = useState(7);

  // Learning form state
  const [learningTitle, setLearningTitle] = useState("");
  const [learningDesc, setLearningDesc] = useState("");
  const [learningTargetHours, setLearningTargetHours] = useState(10);

  // Handle task submission
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const tagsArray = taskTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await addTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      priority: taskPriority,
      project_id: taskProjId || undefined,
      due_date: taskDueDate || undefined,
      estimated_time: Number(taskEstHours) || 1,
      actual_time: 0,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
    });

    audioService.playSuccessChime();
    toast.success(`Task "${taskTitle}" captured`);
    setTaskTitle("");
    setTaskDesc("");
    setTaskTags("");
    onClose();
  };

  // Handle project submission
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    const msArray = projMilestones
      .split("\n")
      .map((m) => m.trim())
      .filter(Boolean);

    await addProject({
      name: projName.trim(),
      description: projDesc.trim() || undefined,
      deadline: projDeadline || undefined,
      milestones: msArray.length > 0 ? msArray : undefined,
    });

    audioService.playSuccessChime();
    toast.success(`Project "${projName}" launched`);
    setProjName("");
    setProjDesc("");
    setProjMilestones("");
    onClose();
  };

  // Handle goal submission
  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    const ms = goalMilestones
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
    toast.success(`Goal "${goalTitle}" locked in`);
    setGoalTitle("");
    setGoalMilestones("");
    onClose();
  };

  // Handle habit submission
  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    await addHabit({
      name: habitName.trim(),
      target_days_per_week: habitTargetDays,
    });

    audioService.playSuccessChime();
    toast.success(`Habit "${habitName}" registered`);
    setHabitName("");
    onClose();
  };

  // Handle learning submission
  const handleCreateLearning = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!learningTitle.trim()) return;

    await addLearningTopic({
      title: learningTitle.trim(),
      description: learningDesc.trim() || "Deep study module",
      target_hours: Number(learningTargetHours) || 10,
    });

    audioService.playSuccessChime();
    toast.success(`Learning path "${learningTitle}" established`);
    setLearningTitle("");
    setLearningDesc("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="relative w-full max-w-xl bg-white rounded-3xl border border-[#6F4E37]/20 shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#6F4E37]/10 bg-[#FFF8E7]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6F4E37] text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#6F4E37]">Quick Capture</h3>
                <p className="text-[11px] text-[#7A6F62]">Seamlessly input into your workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-[#6F4E37]/10 text-[#6F4E37] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector with Framer Motion Animated Slider Pill */}
          <div className="flex p-1.5 mx-6 mt-4 bg-[#FFF8E7] rounded-2xl border border-[#6F4E37]/10 relative">
            {[
              { id: "task", label: "Task", icon: CheckSquare },
              { id: "project", label: "Project", icon: FolderDot },
              { id: "goal", label: "Goal", icon: Target },
              { id: "habit", label: "Habit", icon: Zap },
              { id: "learning", label: "Study", icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 relative flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-colors z-10 cursor-pointer ${
                    isActive ? "text-white" : "text-[#7A6F62] hover:text-[#6F4E37]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="quickCaptureActivePill"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      className="absolute inset-0 bg-[#6F4E37] rounded-xl shadow-xs -z-10"
                    />
                  )}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Forms Body */}
          <div className="p-6">
            {/* 1. TASK FORM */}
            {activeTab === "task" && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="E.g. Refactor API endpoints, complete sprint notes..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Project Tracker
                    </label>
                    <select
                      value={taskProjId}
                      onChange={(e) => setTaskProjId(e.target.value)}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    >
                      <option value="">No Project (General)</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority ⚡</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Estimated Focus (Hours)
                    </label>
                    <input
                      type="number"
                      min={0.25}
                      step={0.25}
                      value={taskEstHours}
                      onChange={(e) => setTaskEstHours(Number(e.target.value))}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Create Smart Task ☕
                </button>
              </form>
            )}

            {/* 2. PROJECT FORM */}
            {activeTab === "project" && (
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Mobile Redesign, Portfolio 2026..."
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Key Milestones (One per line)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Design wireframes&#10;Implement core DB&#10;Production deploy"
                    value={projMilestones}
                    onChange={(e) => setProjMilestones(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-medium border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Launch Project Tracker 📁
                </button>
              </form>
            )}

            {/* 3. GOAL FORM */}
            {activeTab === "goal" && (
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Goal Objective *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Ship 3 client apps, master TypeScript generics..."
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Cadence
                    </label>
                    <select
                      value={goalType}
                      onChange={(e) => setGoalType(e.target.value as any)}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    >
                      <option value="monthly">Monthly Cycle</option>
                      <option value="quarterly">Quarterly Objective</option>
                      <option value="yearly">Yearly Milestone</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={goalTargetDate}
                      onChange={(e) => setGoalTargetDate(e.target.value)}
                      className="w-full mt-1.5 p-2.5 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Set Strategic Goal 🎯
                </button>
              </form>
            )}

            {/* 4. HABIT FORM */}
            {activeTab === "habit" && (
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Daily Habit Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Read 20 pages, 30m code review, 5km walk..."
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Frequency: {habitTargetDays} Days per week
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={habitTargetDays}
                    onChange={(e) => setHabitTargetDays(Number(e.target.value))}
                    className="w-full mt-2 accent-[#6F4E37]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Register Habit Loop ⚡
                </button>
              </form>
            )}

            {/* 5. LEARNING FORM */}
            {activeTab === "learning" && (
              <form onSubmit={handleCreateLearning} className="space-y-4">
                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Topic / Skill Module *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Rust Systems, LLM Prompt Engineering, WebGL Shaders..."
                    value={learningTitle}
                    onChange={(e) => setLearningTitle(e.target.value)}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase font-bold tracking-wider text-[#6F4E37]">
                    Target Hours Allocation
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={learningTargetHours}
                    onChange={(e) => setLearningTargetHours(Number(e.target.value))}
                    className="w-full mt-1.5 p-3 text-xs font-semibold border border-[#6F4E37]/20 rounded-xl focus:outline-none focus:border-[#6F4E37] bg-[#FFF8E7]/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#6F4E37] hover:bg-[#5a3e2b] text-white font-serif font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  Launch Study Path 📚
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default QuickCaptureModal;
