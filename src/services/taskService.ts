import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Task, TaskFormData } from '../types/task';

const TASKS_COLLECTION = 'tasks';

/**
 * Subscribe to tasks belonging exclusively to the authenticated user.
 * Strictly isolates tasks so users only receive and view their own records.
 */
export function subscribeToUserTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError?: (error: Error) => void
): () => void {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const q = query(
    tasksRef,
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          description: data.description || '',
          completed: !!data.completed,
          priority: data.priority || 'medium',
          category: data.category || 'General',
          dueDate: data.dueDate || null,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      // Sort client-side by createdAt descending to avoid composite index requirement
      tasks.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });

      onTasks(tasks);
    },
    (error) => {
      console.error('Error listening to tasks:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, TASKS_COLLECTION);
      } catch (err: any) {
        if (onError) onError(err);
      }
    }
  );

  return unsubscribe;
}

/**
 * Create a new task owned by the authenticated user.
 */
export async function createTask(userId: string, data: TaskFormData): Promise<string> {
  const newDocRef = doc(collection(db, TASKS_COLLECTION));
  const path = `${TASKS_COLLECTION}/${newDocRef.id}`;

  const sanitizedTitle = data.title.trim().slice(0, 256);
  const sanitizedDesc = (data.description || '').trim().slice(0, 2000);
  const sanitizedCategory = (data.category || 'General').trim().slice(0, 64);
  const validPriorities = ['low', 'medium', 'high', 'urgent'];
  const priority = validPriorities.includes(data.priority) ? data.priority : 'medium';

  const payload: Record<string, any> = {
    id: newDocRef.id,
    userId,
    title: sanitizedTitle,
    completed: false,
    priority,
    category: sanitizedCategory,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (sanitizedDesc) {
    payload.description = sanitizedDesc;
  }
  if (data.dueDate) {
    payload.dueDate = data.dueDate;
  }

  try {
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Toggle the completion status of a task.
 */
export async function toggleTaskComplete(task: Task): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, task.id);
  const path = `${TASKS_COLLECTION}/${task.id}`;

  try {
    await updateDoc(taskRef, {
      completed: !task.completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Update an existing task's fields.
 */
export async function updateTask(
  taskId: string,
  data: Partial<TaskFormData>
): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const path = `${TASKS_COLLECTION}/${taskId}`;

  const payload: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) {
    payload.title = data.title.trim().slice(0, 256);
  }
  if (data.description !== undefined) {
    payload.description = data.description.trim().slice(0, 2000);
  }
  if (data.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    payload.priority = validPriorities.includes(data.priority) ? data.priority : 'medium';
  }
  if (data.category !== undefined) {
    payload.category = data.category.trim().slice(0, 64) || 'General';
  }
  if (data.dueDate !== undefined) {
    payload.dueDate = data.dueDate || null;
  }

  try {
    await updateDoc(taskRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete a task.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const path = `${TASKS_COLLECTION}/${taskId}`;

  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Delete all completed tasks for a user in a batch.
 */
export async function deleteCompletedTasks(tasks: Task[]): Promise<void> {
  const completedTasks = tasks.filter((t) => t.completed);
  if (completedTasks.length === 0) return;

  const batch = writeBatch(db);
  completedTasks.forEach((task) => {
    const taskRef = doc(db, TASKS_COLLECTION, task.id);
    batch.delete(taskRef);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, TASKS_COLLECTION);
  }
}
