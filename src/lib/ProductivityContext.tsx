import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/supabase";

// Interfaces following requested Supabase Backend Architecture exactly
export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number; // calculated 0 to 100
  doneCount: number;
  remainingCount: number;
  deadline: string;
  milestones: string[]; // custom benchmarks
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: "high" | "medium" | "low";
  tags: string[];
  status: "Todo" | "In Progress" | "Review" | "Complete";
  estimated_time: number; // in hours
  actual_time: number; // in hours
  project_id?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  target_date: string;
  type: "monthly" | "quarterly" | "yearly";
  progress: number;
  milestones: { id: string; text: string; completed: boolean }[];
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  name: string;
  category: "Exercise" | "Reading" | "Coding" | "Water" | "Sleep";
  streak: number;
  completed_days: string[]; // Dates strings: "YYYY-MM-DD"
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  action_type: "task_created" | "task_updated" | "task_completed" | "goal_created" | "project_created" | "habit_completed";
  description: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: "deadline" | "milestone" | "habit" | "project";
  read: boolean;
  created_at: string;
}

export interface DeveloperMetrics {
  coding_hours: number;
  learning_hours: number;
  projects_completed: number;
  portfolio_progress: number;
  job_applications: number;
}

export interface FocusSession {
  id: string;
  task_id?: string;
  duration_minutes: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

interface UserPreferences {
  persona: string;
  goals: string[];
  onboarding_completed: boolean;
}

interface CreamFlowContextType {
  onboardingCompleted: boolean;
  preferences: UserPreferences | null;
  workspaces: Workspace[];
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  achievements: Achievement[];
  focusSessions: FocusSession[];
  developerMetrics: DeveloperMetrics;
  
  // Timer state
  timer: {
    minutes: number;
    seconds: number;
    isRunning: boolean;
    timeLeft: number;
    totalDuration: number;
    taskId?: string;
  };
  setTimerState: React.Dispatch<React.SetStateAction<any>>;

  // Onboarding sequence
  completeOnboarding: (
    persona: string,
    goals: string[],
    workspaceName: string,
    projectName: string,
    taskTitle: string
  ) => void;

  // CRUD Actions
  addWorkspace: (name: string) => string;
  addProject: (name: string, description: string, deadline: string, milestones?: string[]) => string;
  deleteProject: (id: string) => void;
  updateProjectProgress: (id: string) => void;

  addTask: (task: Omit<Task, "id" | "created_at" | "updated_at">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addGoal: (title: string, type: "monthly" | "quarterly" | "yearly", target_date: string, milestones: string[]) => void;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;

  toggleHabitToday: (id: string) => void;
  addActivityLog: (type: ActivityLog["action_type"], desc: string) => void;
  addNotification: (title: string, content: string, type: Notification["type"]) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Focus Actions
  startFocus: (taskId?: string) => void;
  stopFocus: () => void;
  logFocusSession: (minutes: number, taskId?: string) => void;
  updateDeveloperHours: (coding: number, learning: number) => void;
  resetAccount: () => void;
}

const CreamFlowContext = createContext<CreamFlowContextType | undefined>(undefined);

const MASTER_ACHIEVEMENTS: Achievement[] = [
  { id: "first-task", title: "First Task", description: "Successfully crossed off your first priority milestone", icon: "☕" },
  { id: "streak-7", title: "7-Day Streak", description: "Maintained a sharp continuous streak of seven positive days", icon: "🔥" },
  { id: "streak-30", title: "30-Day Streak", description: "Established a legendary month-long rhythm of productivity", icon: "⭐" },
  { id: "comp-100", title: "100 Tasks Completed", description: "Logged 100 actual tasks with no compromises", icon: "👑" },
  { id: "project-master", title: "Project Master", description: "Pushed an active project to 100% completion metrics", icon: "🎯" },
  { id: "focus-champ", title: "Focus Champion", description: "Logged a cumulative focus sessions total of 4 or more", icon: "🧠" },
];

export function ProductivityProvider({ children }: { children: React.ReactNode }) {
  const getStored = <T,>(key: string, backup: T): T => {
    const val = localStorage.getItem(`creamflow_${key}`);
    return val ? JSON.parse(val) : backup;
  };

  const saveStored = (key: string, data: any) => {
    localStorage.setItem(`creamflow_${key}`, JSON.stringify(data));
  };

  // States
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => getStored<UserPreferences | null>("preferences", null));
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => getStored<Workspace[]>("workspaces", []));
  const [projects, setProjects] = useState<Project[]>(() => getStored<Project[]>("projects", []));
  const [tasks, setTasks] = useState<Task[]>(() => getStored<Task[]>("tasks", []));
  const [goals, setGoals] = useState<Goal[]>(() => getStored<Goal[]>("goals", []));
  
  // Standard habits structured beautifully but empty logs
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = getStored<Habit[]>("habits", []);
    if (stored.length > 0) return stored;
    return [
      { id: "h_exercise", name: "Morning Exercise", category: "Exercise", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_reading", name: "Daily Book Reading", category: "Reading", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_coding", name: "Coding Terminal Sprint", category: "Coding", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_water", name: "8 Glasses of Water", category: "Water", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_sleep", name: "8 Hours Healthy Sleep", category: "Sleep", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => getStored<ActivityLog[]>("activity_logs", []));
  const [notifications, setNotifications] = useState<Notification[]>(() => getStored<Notification[]>("notifications", []));
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => getStored<FocusSession[]>("focus_sessions", []));
  const [achievements, setAchievements] = useState<Achievement[]>(() => getStored<Achievement[]>("achievements", MASTER_ACHIEVEMENTS));
  const [developerMetrics, setDeveloperMetrics] = useState<DeveloperMetrics>(() => getStored<DeveloperMetrics>("developer_metrics", {
    coding_hours: 0,
    learning_hours: 0,
    projects_completed: 0,
    portfolio_progress: 0,
    job_applications: 0
  }));

  // Timer state
  const [timer, setTimerState] = useState({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    taskId: undefined as string | undefined
  });

  const onboardingCompleted = !!preferences?.onboarding_completed;

  // Persistence triggers
  useEffect(() => { saveStored("preferences", preferences); }, [preferences]);
  useEffect(() => { saveStored("workspaces", workspaces); }, [workspaces]);
  useEffect(() => { saveStored("goals", goals); }, [goals]);
  useEffect(() => { saveStored("habits", habits); }, [habits]);
  useEffect(() => { saveStored("activity_logs", activityLogs); }, [activityLogs]);
  useEffect(() => { saveStored("notifications", notifications); }, [notifications]);
  useEffect(() => { saveStored("focus_sessions", focusSessions); }, [focusSessions]);
  useEffect(() => { saveStored("achievements", achievements); }, [achievements]);
  useEffect(() => { saveStored("developer_metrics", developerMetrics); }, [developerMetrics]);

  // Sync Projects and compute their progress automatically when tasks change
  useEffect(() => {
    saveStored("tasks", tasks);
    
    // Automatically recalculate project progress from real database/local tasks
    if (projects.length > 0) {
      const updatedProjects = projects.map(proj => {
        const projTasks = tasks.filter(t => t.project_id === proj.id);
        const total = projTasks.length;
        const complete = projTasks.filter(t => t.status === "Complete").length;
        return {
          ...proj,
          progress: total === 0 ? 0 : Math.round((complete / total) * 100),
          doneCount: complete,
          remainingCount: total - complete
        };
      });
      // Check if project metrics shifted to save
      const isDifferent = JSON.stringify(updatedProjects) !== JSON.stringify(projects);
      if (isDifferent) {
        setProjects(updatedProjects);
        saveStored("projects", updatedProjects);
      }
    }
  }, [tasks]);

  // Sync developer completed projects count
  useEffect(() => {
    const completeProjects = projects.filter(p => p.progress === 100).length;
    if (developerMetrics.projects_completed !== completeProjects) {
      setDeveloperMetrics(prev => ({
        ...prev,
        projects_completed: completeProjects
      }));
    }
  }, [projects]);

  // Secondary project direct sync
  useEffect(() => {
    saveStored("projects", projects);
  }, [projects]);

  // Global Pomodoro Ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.isRunning) {
      interval = setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            clearInterval(interval!);
            toast.success("🧠 Concentration Focus Session Complete! Excellent Flow!");
            
            // Add focus session logs
            const roundedMins = Math.round(prev.totalDuration / 60);
            setTimeout(() => {
              logFocusSession(roundedMins, prev.taskId);
            }, 5);

            return {
              ...prev,
              isRunning: false,
              timeLeft: 25 * 60,
              minutes: 25,
              seconds: 0
            };
          }
          const nextTime = prev.timeLeft - 1;
          return {
            ...prev,
            timeLeft: nextTime,
            minutes: Math.floor(nextTime / 60),
            seconds: nextTime % 60
          };
        });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [timer.isRunning]);

  // Achievement Check Engine dynamically reflecting metrics
  useEffect(() => {
    if (!onboardingCompleted) return;

    let unlockedAny = false;
    const todayStr = new Date().toISOString().split("T")[0];

    const updated = achievements.map(badge => {
      if (badge.unlockedAt) return badge;

      let meetsCriteria = false;

      if (badge.id === "first-task") {
        meetsCriteria = tasks.some(t => t.status === "Complete");
      } else if (badge.id === "streak-7") {
        // Simple streak index: total completed activity logs or entries over 7 days span
        meetsCriteria = focusSessions.length >= 7 || habits.some(h => h.streak >= 7);
      } else if (badge.id === "streak-30") {
        meetsCriteria = focusSessions.length >= 30 || habits.some(h => h.streak >= 30);
      } else if (badge.id === "comp-100") {
        meetsCriteria = tasks.filter(t => t.status === "Complete").length >= 100;
      } else if (badge.id === "project-master") {
        meetsCriteria = projects.some(p => p.progress === 100);
      } else if (badge.id === "focus-champ") {
        meetsCriteria = focusSessions.length >= 4;
      }

      if (meetsCriteria) {
        unlockedAny = true;
        toast.success(`🎖️ Achievement Unlocked: ${badge.title}!`, {
          description: badge.description,
          duration: 5000,
        });
        
        // Log activity
        setTimeout(() => {
          addActivityLog("task_completed", `Unlocked Achievement Badge: "${badge.title}"`);
          addNotification("Achievement Secured!", `You've unlocked the "${badge.title}" badge for your CreamFlow portfolio.`, "milestone");
        }, 10);

        return { ...badge, unlockedAt: new Date().toISOString() };
      }
      return badge;
    });

    if (unlockedAny) {
      setAchievements(updated);
    }
  }, [tasks, projects, focusSessions, habits, onboardingCompleted]);

  // Action methods
  const completeOnboarding = (
    persona: string,
    goalsList: string[],
    workspaceName: string,
    projectName: string,
    taskTitle: string
  ) => {
    const wsId = "ws_" + Math.random().toString(36).substring(2, 9);
    const projId = "proj_" + Math.random().toString(36).substring(2, 9);
    const taskId = "task_" + Math.random().toString(36).substring(2, 9);

    const newWorkspace: Workspace = {
      id: wsId,
      name: workspaceName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newProject: Project = {
      id: projId,
      name: projectName,
      description: `Core objectives for ${projectName}`,
      progress: 0,
      doneCount: 0,
      remainingCount: 1,
      deadline: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0], // 2 weeks out
      milestones: ["Initialize Phase", "Review Benchmarks"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newPref: UserPreferences = {
      persona,
      goals: goalsList,
      onboarding_completed: true,
    };

    const firstTask: Task = {
      id: taskId,
      title: taskTitle,
      description: "My first action sprint task in CreamFlow workspace",
      due_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      priority: "high",
      tags: ["Launch", "First Sprints"],
      status: "Todo",
      estimated_time: 1.5,
      actual_time: 0,
      project_id: projId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWorkspaces([newWorkspace]);
    setProjects([newProject]);
    setTasks([firstTask]);
    setPreferences(newPref);

    // Seed logs
    setActivityLogs([
      {
        id: "log_" + Math.random().toString(36).substring(2, 9),
        action_type: "project_created",
        description: `Created first workspace "${workspaceName}" and premium project "${projectName}"`,
        timestamp: new Date().toISOString(),
      },
      {
        id: "log_" + Math.random().toString(36).substring(2, 9),
        action_type: "task_created",
        description: `Created core task: "${taskTitle}"`,
        timestamp: new Date().toISOString(),
      }
    ]);

    setNotifications([
      {
        id: "notif_" + Math.random().toString(36).substring(2, 9),
        title: "Welcome to CreamFlow!",
        content: `Your high-end professional ecosystem is now online. Good luck with your ${persona} focus metrics!`,
        type: "project",
        read: false,
        created_at: new Date().toISOString()
      }
    ]);

    toast.success("CreamFlow System Active! Onboarding Finished.");
  };

  const addWorkspace = (name: string) => {
    const id = "ws_" + Math.random().toString(36).substring(2, 9);
    setWorkspaces(prev => [...prev, {
      id,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);
    toast.success(`Workspace "${name}" launched successfully.`);
    return id;
  };

  const addProject = (name: string, description: string, deadline: string, milestones: string[] = []) => {
    const id = "proj_" + Math.random().toString(36).substring(2, 9);
    const newProj: Project = {
      id,
      name,
      description,
      progress: 0,
      doneCount: 0,
      remainingCount: 0,
      deadline: deadline || "",
      milestones: milestones.length > 0 ? milestones : ["Kickoff", "Deployment"],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
    addActivityLog("project_created", `Launched elite project tracker: "${name}"`);
    addNotification("Project Released", `New milestones added for "${name}".`, "project");
    toast.success(`Project "${name}" opened successfully.`);
    return id;
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTasks(prev => prev.filter(t => t.project_id !== id));
    toast.info("Project workspace archived.");
  };

  const updateProjectProgress = (id: string) => {
    // handled synchronously by tasks hook but defined here for coverage
  };

  const addTask = (taskInput: Omit<Task, "id" | "created_at" | "updated_at">) => {
    const newTask: Task = {
      ...taskInput,
      id: "t_" + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    addActivityLog("task_created", `Added task: "${newTask.title}"`);
    
    // Check for deadline notification trigger
    if (newTask.due_date) {
      addNotification("Upcoming Focus Deadline", `"${newTask.title}" is scheduled due on ${newTask.due_date}.`, "deadline");
    }

    toast.success("Productive Task Added");
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = { ...t, ...updates, updated_at: new Date().toISOString() };
        
        // Log status change metrics
        if (updates.status && updates.status !== t.status) {
          if (updates.status === "Complete") {
            setTimeout(() => {
              addActivityLog("task_completed", `Completed focus task: "${next.title}"`);
            }, 5);
          } else {
            setTimeout(() => {
              addActivityLog("task_updated", `Shifted status of "${next.title}" to ${updates.status}`);
            }, 5);
          }
        }
        return next;
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.info("Task removed from active backlog.");
  };

  const addGoal = (title: string, type: "monthly" | "quarterly" | "yearly", target_date: string, milestones: string[]) => {
    const formattedMilestones = milestones.map(m => ({
      id: "g_ms_" + Math.random().toString(36).substring(2, 9),
      text: m,
      completed: false
    }));

    const newGoal: Goal = {
      id: "goal_" + Math.random().toString(36).substring(2, 9),
      title,
      target_date,
      type,
      progress: 0,
      milestones: formattedMilestones,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setGoals(prev => [...prev, newGoal]);
    addActivityLog("goal_created", `Set new ${type} goal: "${title}"`);
    addNotification("Sovereignty Goal Created", `Focus on completing milestones for "${title}".`, "milestone");
    toast.success("Premium objective goal locked.");
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedMilestones = g.milestones.map(m => 
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const total = updatedMilestones.length;
        const complete = updatedMilestones.filter(m => m.completed).length;
        const progress = total === 0 ? 0 : Math.round((complete / total) * 100);
        return {
          ...g,
          milestones: updatedMilestones,
          progress,
          updated_at: new Date().toISOString()
        };
      }
      return g;
    }));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.info("Goal tracker deleted.");
  };

  const toggleHabitToday = (id: string) => {
    const todayStr = new Date().toISOString().split("T")[0];

    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompletedToday = h.completed_days.includes(todayStr);
        let nextDays = [...h.completed_days];

        if (isCompletedToday) {
          nextDays = nextDays.filter(d => d !== todayStr);
          toast.info(`Habit "${h.name}" unmarked for today.`);
        } else {
          nextDays.push(todayStr);
          addActivityLog("habit_completed", `Logged complete routine: "${h.name}"`);
          toast.success(`Habit "${h.name}" logged for today! Keep the flow going! ☕`);
        }

        // Simple streak calculation
        let streak = 0;
        const sortedDays = [...nextDays].sort((a,b) => new Date(b).getTime() - new Date(a).getTime());
        if (sortedDays.length > 0) {
          // Check if today or yesterday is logged
          const lastLog = sortedDays[0];
          const diffMs = new Date(todayStr).getTime() - new Date(lastLog).getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          
          if (diffDays <= 1) {
            // Count backwards
            streak = 1;
            let currentCheck = new Date(lastLog);
            for (let i = 1; i < sortedDays.length; i++) {
              currentCheck.setDate(currentCheck.getDate() - 1);
              const checkStr = currentCheck.toISOString().split("T")[0];
              if (sortedDays[i] === checkStr) {
                streak++;
              } else {
                break;
              }
            }
          }
        }

        return {
          ...h,
          completed_days: nextDays,
          streak,
          updated_at: new Date().toISOString()
        };
      }
      return h;
    }));
  };

  const addActivityLog = (action_type: ActivityLog["action_type"], description: string) => {
    const newLog: ActivityLog = {
      id: "log_" + Math.random().toString(36).substring(2, 9),
      action_type,
      description,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 100)); // cap at 100 entries
  };

  const addNotification = (title: string, content: string, type: Notification["type"]) => {
    const newNotif: Notification = {
      id: "notif_" + Math.random().toString(36).substring(2, 9),
      title,
      content,
      type,
      read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("Cleared notifications center.");
  };

  // Focus mechanics
  const startFocus = (taskId?: string) => {
    setTimerState(prev => ({
      ...prev,
      isRunning: true,
      taskId
    }));
    toast.info("Timer active! Flow focus mode initialized.");
  };

  const stopFocus = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false
    }));
    toast.info("Timer paused.");
  };

  const logFocusSession = (minutes: number, taskId?: string) => {
    const newSession: FocusSession = {
      id: "f_sess_" + Math.random().toString(36).substring(2, 9),
      task_id: taskId,
      duration_minutes: minutes,
      created_at: new Date().toISOString()
    };
    setFocusSessions(prev => [newSession, ...prev]);
    
    // Add real developer tracking coding hours
    const increment = Number((minutes / 60).toFixed(2));
    setDeveloperMetrics(prev => ({
      ...prev,
      coding_hours: Number((prev.coding_hours + increment).toFixed(2)),
      learning_hours: prev.learning_hours
    }));

    if (taskId) {
      updateTask(taskId, {
        actual_time: Number((tasks.find(t => t.id === taskId)?.actual_time || 0 + increment).toFixed(2))
      });
    }

    addActivityLog("task_completed", `Completed a focused flow sprint of ${minutes} minutes.`);
  };

  const updateDeveloperHours = (coding: number, learning: number) => {
    setDeveloperMetrics(prev => ({
      ...prev,
      coding_hours: Number((prev.coding_hours + coding).toFixed(2)),
      learning_hours: Number((prev.learning_hours + learning).toFixed(2))
    }));
    toast.success("Additional deep study and coding metrics log applied.");
  };

  const resetAccount = () => {
    setPreferences(null);
    setWorkspaces([]);
    setProjects([]);
    setTasks([]);
    setGoals([]);
    setActivityLogs([]);
    setNotifications([]);
    setFocusSessions([]);
    setDeveloperMetrics({
      coding_hours: 0,
      learning_hours: 0,
      projects_completed: 0,
      portfolio_progress: 0,
      job_applications: 0
    });
    setTimerState({
      minutes: 25,
      seconds: 0,
      isRunning: false,
      timeLeft: 25 * 60,
      totalDuration: 25 * 60,
      taskId: undefined
    });
    setHabits([
      { id: "h_exercise", name: "Morning Exercise", category: "Exercise", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_reading", name: "Daily Book Reading", category: "Reading", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_coding", name: "Coding Terminal Sprint", category: "Coding", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_water", name: "8 Glasses of Water", category: "Water", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "h_sleep", name: "8 Hours Healthy Sleep", category: "Sleep", streak: 0, completed_days: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ]);
    localStorage.clear();
    toast.success("CreamFlow system factory reset complete.");
    window.location.reload();
  };

  return (
    <CreamFlowContext.Provider
      value={{
        onboardingCompleted,
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
        setTimerState,
        completeOnboarding,
        addWorkspace,
        addProject,
        deleteProject,
        updateProjectProgress,
        addTask,
        updateTask,
        deleteTask,
        addGoal,
        toggleGoalMilestone,
        deleteGoal,
        toggleHabitToday,
        addActivityLog,
        addNotification,
        dismissNotification,
        clearAllNotifications,
        startFocus,
        stopFocus,
        logFocusSession,
        updateDeveloperHours,
        resetAccount
      }}
    >
      {children}
    </CreamFlowContext.Provider>
  );
}

export function useProductivity() {
  const context = useContext(CreamFlowContext);
  if (!context) throw new Error("useProductivity must be used inside a CreamFlow ProductivityProvider");
  return context;
}
