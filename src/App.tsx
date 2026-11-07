import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { TaskStats } from './components/TaskStats';
import { TaskFilterBar } from './components/TaskFilterBar';
import { TaskItem } from './components/TaskItem';
import { TaskModal } from './components/TaskModal';
import { EmptyState } from './components/EmptyState';
import {
  Task,
  TaskFormData,
  TaskPriority,
  TaskSortBy,
  TaskStatusFilter,
} from './types/task';
import {
  subscribeToUserTasks,
  createTask,
  updateTask,
  toggleTaskComplete,
  deleteTask,
  deleteCompletedTasks,
} from './services/taskService';
import { AlertCircle, Loader2, Sparkles } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Real-time Firestore subscription isolated to authenticated user
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }

    setTasksLoading(true);
    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (userTasks) => {
        setTasks(userTasks);
        setTasksLoading(false);
      },
      (error) => {
        setErrorMessage(
          error.message.includes('permission')
            ? 'Access denied. You can only view and manage your own isolated tasks.'
            : 'Error synchronizing tasks with cloud database.'
        );
        setTasksLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Extract unique categories from tasks
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Status filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;

        // Category filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
          const matchCat = task.category?.toLowerCase().includes(q) ?? false;
          if (!matchTitle && !matchDesc && !matchCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created_desc') {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeB - timeA;
        }
        if (sortBy === 'created_asc') {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          return timeA - timeB;
        }
        if (sortBy === 'due_asc') {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'priority_desc') {
          const priorityScore: Record<TaskPriority, number> = {
            urgent: 4,
            high: 3,
            medium: 2,
            low: 1,
          };
          const scoreA = a.priority ? priorityScore[a.priority] : 2;
          const scoreB = b.priority ? priorityScore[b.priority] : 2;
          return scoreB - scoreA;
        }
        if (sortBy === 'title_asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [tasks, statusFilter, selectedCategory, selectedPriority, searchQuery, sortBy]);

  // Handlers
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (data: TaskFormData) => {
    if (!user) return;
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(user.uid, data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save task.');
      throw err;
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await toggleTaskComplete(task);
    } catch (err: any) {
      setErrorMessage('Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err: any) {
      setErrorMessage('Failed to delete task.');
    }
  };

  const handleClearCompleted = async () => {
    if (confirm('Are you sure you want to delete all completed tasks?')) {
      try {
        await deleteCompletedTasks(tasks);
      } catch (err: any) {
        setErrorMessage('Failed to clear completed tasks.');
      }
    }
  };

  const handleExportTasks = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      totalCount: tasks.length,
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description || '',
        completed: t.completed,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleQuickAdd = async (
    title: string,
    category: string,
    priority: TaskPriority
  ) => {
    if (!user) return;
    try {
      await createTask(user.uid, {
        title,
        description: '',
        category,
        priority,
        dueDate: '',
      });
    } catch (err: any) {
      setErrorMessage('Failed to add template task.');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setSelectedCategory('all');
    setSelectedPriority('all');
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenNewTask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-medium">Connecting to Firebase...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar onOpenNewTask={() => {}} tasksCount={0} />
        <AuthScreen />
      </div>
    );
  }

  const isFiltered =
    searchQuery.trim().length > 0 ||
    statusFilter !== 'all' ||
    selectedCategory !== 'all' ||
    selectedPriority !== 'all';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      <Navbar onOpenNewTask={handleOpenNewTask} tasksCount={tasks.length} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Notification Banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline ml-4 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Dashboard Statistics */}
        <TaskStats tasks={tasks} />

        {/* Filters, Search & Sorter */}
        <TaskFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={existingCategories}
          selectedPriority={selectedPriority}
          onPriorityChange={setSelectedPriority}
          sortBy={sortBy}
          onSortChange={setSortBy}
          tasks={tasks}
          onClearCompleted={handleClearCompleted}
          onExportTasks={handleExportTasks}
        />

        {/* Task List Section */}
        {tasksLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-xs">Loading your secure tasks from Firestore...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            isFiltered={isFiltered}
            onOpenNewTask={handleOpenNewTask}
            onClearFilters={handleClearFilters}
            onQuickAdd={handleQuickAdd}
          />
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 mb-1">
              <span>
                Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
              <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">N</kbd> to add task</span>
            </div>

            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveTask}
        editingTask={editingTask}
        existingCategories={existingCategories}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-400">
        <p>
          SyncTasks &bull; Backed by Firebase Firestore & Google Sign-In &bull; Data Isolation Enforced
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
