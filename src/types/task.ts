export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority?: TaskPriority;
  category?: string;
  dueDate?: string | null;
  createdAt: any;
  updatedAt: any;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: string;
  dueDate: string;
}

export type TaskStatusFilter = 'all' | 'active' | 'completed';
export type TaskSortBy = 'created_desc' | 'created_asc' | 'due_asc' | 'priority_desc' | 'title_asc';

export interface UserProfile {
  userId: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: any;
  updatedAt: any;
}
