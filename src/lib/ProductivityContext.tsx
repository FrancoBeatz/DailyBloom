import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/supabase";

export interface Workspace {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  deadline?: string;
  progress?: number;
  milestones?: string[];
  workspace_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "Todo" | "In Progress" | "Review" | "Complete";
  due_date?: string;
  estimated_time?: number;
  actual_time?: number;
  tags?: string[];
  project_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface GoalMilestone {
  id: string;
  title?: string;
  text?: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  type: "monthly" | "quarterly" | "yearly";
  target_date?: string;
  progress?: number;
  milestones: GoalMilestone[];
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  streak_count: number;
  target_days_per_week: number;
  completed_today: boolean;
  history?: string[];
  created_at: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  description: string;
  target_hours: number;
  logged_hours: number;
  status: "Not Started" | "In Progress" | "Mastered";
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface FocusSession {
  id: string;
  task_id?: string;
  duration_minutes: number;
  created_at: string;
}

export interface DeveloperMetrics {
  coding_hours: number;
  learning_hours: number;
  projects_completed: number;
  current_streak: number;
}

interface UserPreferences {
  persona: string;
  goals: string[];
  onboarding_completed: boolean;
}

interface ProductivityContextType {
  onboardingCompleted: boolean;
  preferences: UserPreferences | null;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  projects: Project[];
  tasks: Task[];
  goals: Goal[];
  habits: Habit[];
  learningTopics: LearningTopic[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  achievements: Achievement[];
  focusSessions: FocusSession[];
  developerMetrics: DeveloperMetrics;

  // Timer State
  timer: {
    is_running: boolean;
    duration_minutes: number;
    seconds_remaining: number;
    active_task_id: string | null;
  };
  setTimerState: React.Dispatch<React.SetStateAction<any>>;

  // Actions
  completeOnboarding: (
    persona: string,
    goals: string[],
    workspaceName: string,
    projectName: string,
    taskTitle: string
  ) => void;

  addWorkspace: (name: string) => Workspace;
  addProject: (
    input:
      | { name: string; description?: string; deadline?: string; milestones?: string[] }
      | string,
    desc?: string,
    deadline?: string,
    milestones?: string[]
  ) => Promise<Project>;
  deleteProject: (id: string) => void;

  addTask: (
    task: Partial<Task> & { title: string }
  ) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  addGoal: (
    goalOrTitle: Partial<Goal> & { title: string } | string,
    type?: "monthly" | "quarterly" | "yearly",
    target_date?: string,
    milestones?: any[]
  ) => Promise<Goal>;
  toggleGoalMilestone: (goalId: string, milestoneId: string) => void;
  deleteGoal: (id: string) => void;

  addHabit: (habit: Partial<Habit> & { name: string }) => Promise<Habit>;
  toggleHabitToday: (id: string) => void;
  deleteHabit: (id: string) => void;

  addLearningTopic: (topic: Partial<LearningTopic> & { title: string }) => Promise<LearningTopic>;
  updateLearningHours: (id: string, hours: number) => void;
  deleteLearningTopic: (id: string) => void;

  startFocus: (taskId?: string, durationMins?: number) => void;
  stopFocus: () => void;
  logFocusSession: (minutes: number, taskId?: string) => void;
  updateDeveloperHours: (coding: number, learning: number) => void;

  saveJournalEntry?: (title: string, content: string, mood?: string, tags?: string[]) => Promise<any>;

  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  resetAccount: () => void;
}

const ProductivityContext = createContext<ProductivityContextType | undefined>(undefined);

const MASTER_ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-task",
    title: "First Step",
    description: "Completed your first focus task",
    icon: "☕",
  },
  {
    id: "streak-7",
    title: "7-Day Flow",
    description: "Maintained a continuous 7-day productivity streak",
    icon: "🔥",
  },
  {
    id: "project-master",
    title: "Project Finisher",
    description: "Successfully pushed a project to completion",
    icon: "🎯",
  },
  {
    id: "focus-champ",
    title: "Deep Work Master",
    description: "Logged 4 or more focus sprints",
    icon: "🧠",
  },
];

export const ProductivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getStored = <T,>(key: string, backup: T): T => {
    try {
      const val = localStorage.getItem(`creamflow_${key}`);
      return val ? JSON.parse(val) : backup;
    } catch {
      return backup;
    }
  };

  const saveStored = (key: string, data: any) => {
    try {
      localStorage.setItem(`creamflow_${key}`, JSON.stringify(data));
    } catch {}
  };

  // State initialization
  const [preferences, setPreferences] = useState<UserPreferences | null>(() =>
    getStored<UserPreferences | null>("preferences", null)
  );

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
    getStored<Workspace[]>("workspaces", [
      { id: "ws-default", name: "Primary HQ", created_at: new Date().toISOString() },
    ])
  );

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(() =>
    getStored<string | null>("active_ws_id", "ws-default")
  );

  const [projects, setProjects] = useState<Project[]>(() =>
    getStored<Project[]>("projects", [
      {
        id: "proj-1",
        name: "Core Platform Sprint",
        description: "High-impact productivity engineering and architecture",
        progress: 50,
        milestones: ["Design token system", "Build interactive components", "Deploy to cloud"],
        workspace_id: "ws-default",
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    getStored<Task[]>("tasks", [
      {
        id: "t-1",
        title: "Calibrate workspace components",
        description: "Implement interactive motion physics & spotlight cards",
        priority: "high",
        status: "Todo",
        project_id: "proj-1",
        estimated_time: 1.5,
        actual_time: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: "t-2",
        title: "Plan deep work sprinting blocks",
        description: "Schedule 25m Pomodoro cycles for the afternoon",
        priority: "medium",
        status: "Complete",
        project_id: "proj-1",
        estimated_time: 1,
        actual_time: 1,
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [goals, setGoals] = useState<Goal[]>(() =>
    getStored<Goal[]>("goals", [
      {
        id: "g-1",
        title: "Master TypeScript Architecture",
        type: "monthly",
        progress: 60,
        milestones: [
          { id: "m-1", title: "Generics deep dive", text: "Generics deep dive", completed: true },
          { id: "m-2", title: "Build custom AST parser", text: "Build custom AST parser", completed: false },
        ],
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [habits, setHabits] = useState<Habit[]>(() =>
    getStored<Habit[]>("habits", [
      {
        id: "h-1",
        name: "Morning Code Review",
        streak_count: 5,
        target_days_per_week: 7,
        completed_today: false,
        created_at: new Date().toISOString(),
      },
      {
        id: "h-2",
        name: "Read 20 pages tech literature",
        streak_count: 3,
        target_days_per_week: 5,
        completed_today: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "h-3",
        name: "Hydrate (8 glasses)",
        streak_count: 7,
        target_days_per_week: 7,
        completed_today: false,
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>(() =>
    getStored<LearningTopic[]>("learning_topics", [
      {
        id: "lt-1",
        title: "Framer Motion Physics & Shaders",
        description: "Spring dynamics, layoutId animations, and magnetic button listeners",
        target_hours: 15,
        logged_hours: 8,
        status: "In Progress",
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    getStored<ActivityLog[]>("activity_logs", [])
  );

  const [notifications, setNotifications] = useState<Notification[]>(() =>
    getStored<Notification[]>("notifications", [
      {
        id: "notif-1",
        title: "Welcome to CreamFlow",
        message: "Your workspace is ready. Press ⌘K for command palette.",
        read: false,
        created_at: new Date().toISOString(),
      },
    ])
  );

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() =>
    getStored<FocusSession[]>("focus_sessions", [])
  );

  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    getStored<Achievement[]>("achievements", MASTER_ACHIEVEMENTS)
  );

  const [developerMetrics, setDeveloperMetrics] = useState<DeveloperMetrics>(() =>
    getStored<DeveloperMetrics>("developer_metrics", {
      coding_hours: 4.5,
      learning_hours: 2.0,
      projects_completed: 1,
      current_streak: 5,
    })
  );

  // Focus Timer state
  const [timer, setTimerState] = useState({
    is_running: false,
    duration_minutes: 25,
    seconds_remaining: 25 * 60,
    active_task_id: null as string | null,
  });

  const onboardingCompleted = !!preferences?.onboarding_completed;

  // Save changes
  useEffect(() => { saveStored("preferences", preferences); }, [preferences]);
  useEffect(() => { saveStored("workspaces", workspaces); }, [workspaces]);
  useEffect(() => { saveStored("active_ws_id", activeWorkspaceId); }, [activeWorkspaceId]);
  useEffect(() => { saveStored("projects", projects); }, [projects]);
  useEffect(() => { saveStored("tasks", tasks); }, [tasks]);
  useEffect(() => { saveStored("goals", goals); }, [goals]);
  useEffect(() => { saveStored("habits", habits); }, [habits]);
  useEffect(() => { saveStored("learning_topics", learningTopics); }, [learningTopics]);
  useEffect(() => { saveStored("activity_logs", activityLogs); }, [activityLogs]);
  useEffect(() => { saveStored("notifications", notifications); }, [notifications]);
  useEffect(() => { saveStored("focus_sessions", focusSessions); }, [focusSessions]);
  useEffect(() => { saveStored("achievements", achievements); }, [achievements]);
  useEffect(() => { saveStored("developer_metrics", developerMetrics); }, [developerMetrics]);

  // Global Timer Countdown Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.is_running) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          if (prev.seconds_remaining <= 1) {
            clearInterval(interval!);
            toast.success("🧠 Focus session complete! Outstanding flow state!");
            logFocusSession(prev.duration_minutes, prev.active_task_id || undefined);
            return {
              ...prev,
              is_running: false,
              seconds_remaining: prev.duration_minutes * 60,
            };
          }
          return {
            ...prev,
            seconds_remaining: prev.seconds_remaining - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.is_running]);

  // Onboarding completion
  const completeOnboarding = (
    persona: string,
    goalsList: string[],
    workspaceName: string,
    projectName: string,
    taskTitle: string
  ) => {
    const wsId = `ws-${Date.now()}`;
    const newWs: Workspace = { id: wsId, name: workspaceName, created_at: new Date().toISOString() };
    const projId = `proj-${Date.now()}`;
    const newProj: Project = {
      id: projId,
      name: projectName,
      progress: 0,
      milestones: ["Initial Sprint Planning", "Implementation Cycle 1"],
      workspace_id: wsId,
      created_at: new Date().toISOString(),
    };
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: taskTitle,
      priority: "high",
      status: "Todo",
      project_id: projId,
      estimated_time: 1,
      actual_time: 0,
      created_at: new Date().toISOString(),
    };

    setWorkspaces([newWs]);
    setActiveWorkspaceId(wsId);
    setProjects([newProj]);
    setTasks([newTask]);
    setPreferences({
      persona,
      goals: goalsList,
      onboarding_completed: true,
    });

    toast.success("CreamFlow configured successfully! Enjoy the flow ☕");
  };

  const addWorkspace = (name: string): Workspace => {
    const newWs: Workspace = { id: `ws-${Date.now()}`, name, created_at: new Date().toISOString() };
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspaceId(newWs.id);
    return newWs;
  };

  const addProject = async (
    input: any,
    desc?: string,
    deadline?: string,
    milestones?: string[]
  ): Promise<Project> => {
    let name = "";
    let description = desc || "";
    let deadl = deadline || "";
    let mstones = milestones || [];

    if (typeof input === "object") {
      name = input.name;
      description = input.description || "";
      deadl = input.deadline || "";
      mstones = input.milestones || [];
    } else {
      name = input;
    }

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name,
      description,
      deadline: deadl,
      progress: 0,
      milestones: mstones,
      workspace_id: activeWorkspaceId || undefined,
      created_at: new Date().toISOString(),
    };

    setProjects((prev) => [newProj, ...prev]);
    return newProj;
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast.info("Project deleted");
  };

  const addTask = async (task: Partial<Task> & { title: string }): Promise<Task> => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: task.title,
      description: task.description || "",
      priority: task.priority || "medium",
      status: task.status || "Todo",
      due_date: task.due_date,
      estimated_time: task.estimated_time || 1,
      actual_time: task.actual_time || 0,
      tags: task.tags || [],
      project_id: task.project_id,
      created_at: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.info("Task removed");
  };

  const addGoal = async (
    goalOrTitle: any,
    type?: "monthly" | "quarterly" | "yearly",
    target_date?: string,
    milestones?: any[]
  ): Promise<Goal> => {
    let title = "";
    let gType: "monthly" | "quarterly" | "yearly" = type || "monthly";
    let gTarget = target_date || "";
    let gMilestones: GoalMilestone[] = milestones || [];

    if (typeof goalOrTitle === "object") {
      title = goalOrTitle.title;
      gType = goalOrTitle.type || "monthly";
      gTarget = goalOrTitle.target_date || "";
      gMilestones = (goalOrTitle.milestones || []).map((m: any, idx: number) =>
        typeof m === "string" ? { id: `m-${Date.now()}-${idx}`, title: m, text: m, completed: false } : m
      );
    } else {
      title = goalOrTitle;
      gMilestones = (milestones || []).map((m: any, idx: number) =>
        typeof m === "string" ? { id: `m-${Date.now()}-${idx}`, title: m, text: m, completed: false } : m
      );
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title,
      type: gType,
      target_date: gTarget,
      progress: 0,
      milestones: gMilestones,
      created_at: new Date().toISOString(),
    };

    setGoals((prev) => [newGoal, ...prev]);
    return newGoal;
  };

  const toggleGoalMilestone = (goalId: string, milestoneId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const updatedMs = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const doneCount = updatedMs.filter((m) => m.completed).length;
        const progress = updatedMs.length > 0 ? Math.round((doneCount / updatedMs.length) * 100) : 0;
        return { ...g, milestones: updatedMs, progress };
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast.info("Goal deleted");
  };

  const addHabit = async (habit: Partial<Habit> & { name: string }): Promise<Habit> => {
    const newHabit: Habit = {
      id: `h-${Date.now()}`,
      name: habit.name,
      streak_count: 0,
      target_days_per_week: habit.target_days_per_week || 7,
      completed_today: false,
      created_at: new Date().toISOString(),
    };
    setHabits((prev) => [newHabit, ...prev]);
    return newHabit;
  };

  const toggleHabitToday = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const nextState = !h.completed_today;
        return {
          ...h,
          completed_today: nextState,
          streak_count: nextState ? h.streak_count + 1 : Math.max(0, h.streak_count - 1),
        };
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast.info("Habit removed");
  };

  const addLearningTopic = async (
    topic: Partial<LearningTopic> & { title: string }
  ): Promise<LearningTopic> => {
    const newTopic: LearningTopic = {
      id: `lt-${Date.now()}`,
      title: topic.title,
      description: topic.description || "",
      target_hours: topic.target_hours || 10,
      logged_hours: topic.logged_hours || 0,
      status: "In Progress",
      created_at: new Date().toISOString(),
    };
    setLearningTopics((prev) => [newTopic, ...prev]);
    return newTopic;
  };

  const updateLearningHours = (id: string, hours: number) => {
    setLearningTopics((prev) =>
      prev.map((lt) => {
        if (lt.id !== id) return lt;
        const total = Math.max(0, lt.logged_hours + hours);
        const status = total >= lt.target_hours ? "Mastered" : "In Progress";
        return { ...lt, logged_hours: total, status };
      })
    );
    setDeveloperMetrics((prev) => ({
      ...prev,
      learning_hours: prev.learning_hours + hours,
    }));
  };

  const deleteLearningTopic = (id: string) => {
    setLearningTopics((prev) => prev.filter((lt) => lt.id !== id));
    toast.info("Learning topic removed");
  };

  const startFocus = (taskId?: string, durationMins: number = 25) => {
    setTimerState({
      is_running: true,
      duration_minutes: durationMins,
      seconds_remaining: durationMins * 60,
      active_task_id: taskId || null,
    });
  };

  const stopFocus = () => {
    setTimerState((prev) => ({ ...prev, is_running: false }));
  };

  const logFocusSession = (minutes: number, taskId?: string) => {
    const session: FocusSession = {
      id: `fs-${Date.now()}`,
      task_id: taskId,
      duration_minutes: minutes,
      created_at: new Date().toISOString(),
    };
    setFocusSessions((prev) => [session, ...prev]);

    // Update actual task time if attached
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, actual_time: (t.actual_time || 0) + minutes / 60 }
            : t
        )
      );
    }

    setDeveloperMetrics((prev) => ({
      ...prev,
      coding_hours: prev.coding_hours + minutes / 60,
    }));
  };

  const updateDeveloperHours = (coding: number, learning: number) => {
    setDeveloperMetrics((prev) => ({
      ...prev,
      coding_hours: Math.max(0, prev.coding_hours + coding),
      learning_hours: Math.max(0, prev.learning_hours + learning),
    }));
    toast.success("Hours logged successfully ☕");
  };

  const saveJournalEntry = async (title: string, content: string, mood?: string, tags?: string[]) => {
    const entry = {
      id: `j-${Date.now()}`,
      title,
      content,
      mood: mood || "Flow",
      tags: tags || [],
      created_at: new Date().toISOString(),
    };
    const stored = getStored<any[]>("journals", []);
    saveStored("journals", [entry, ...stored]);
    return entry;
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const resetAccount = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <ProductivityContext.Provider
      value={{
        onboardingCompleted,
        preferences,
        workspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        projects,
        tasks,
        goals,
        habits,
        learningTopics,
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
        addTask,
        updateTask,
        deleteTask,
        addGoal,
        toggleGoalMilestone,
        deleteGoal,
        addHabit,
        toggleHabitToday,
        deleteHabit,
        addLearningTopic,
        updateLearningHours,
        deleteLearningTopic,
        startFocus,
        stopFocus,
        logFocusSession,
        updateDeveloperHours,
        saveJournalEntry,
        dismissNotification,
        clearAllNotifications,
        resetAccount,
      }}
    >
      {children}
    </ProductivityContext.Provider>
  );
};

export const useProductivity = () => {
  const ctx = useContext(ProductivityContext);
  if (!ctx) throw new Error("useProductivity must be used within ProductivityProvider");
  return ctx;
};
