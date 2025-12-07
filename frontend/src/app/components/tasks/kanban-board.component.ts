import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TaskPriority, TaskResponse, TaskStatus } from '../../models/task.model';

interface KanbanColumn {
  key: TaskStatus;
  title: string;
  description: string;
  accent: string;
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <!-- Header -->
      <nav class="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center space-x-8">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">TaskMaster Pro</h1>
              <div class="flex space-x-4">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/tasks"
                  routerLinkActive="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  All Tasks
                </a>
                <a
                  routerLink="/kanban"
                  routerLinkActive="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Kanban
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button
                (click)="themeService.toggleDarkMode()"
                class="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Toggle dark mode"
              >
                <svg *ngIf="!themeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <svg *ngIf="themeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </button>
              <span class="text-gray-700 dark:text-gray-300">Hello, {{ displayName }}!</span>
              <button
                (click)="logout()"
                class="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p class="text-sm text-blue-600 dark:text-blue-400 font-semibold">Kanban Board</p>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Drag tasks across statuses</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Drop cards to update status instantly.</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              (click)="loadTasks()"
              class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Refresh
            </button>
            <a
              routerLink="/tasks/create"
              class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors inline-flex items-center"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              New Task
            </a>
          </div>
        </div>

        <div *ngIf="loading" class="text-center py-12 text-gray-600 dark:text-gray-300">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
          Loading board...
        </div>

        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            *ngFor="let column of columns"
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow dark:shadow-gray-900/50 flex flex-col transition-colors"
            (dragover)="allowDrop($event, column.key)"
            (dragenter)="allowDrop($event, column.key)"
            (drop)="drop($event, column.key)"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="h-2.5 w-2.5 rounded-full" [ngClass]="getAccentClass(column.accent)"></span>
                  <p class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{{ column.title }}</p>
                </div>
                <p class="text-sm text-gray-700 dark:text-gray-300">{{ column.description }}</p>
              </div>
              <span class="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                {{ tasksByStatus(column.key).length }}
              </span>
            </div>

            <div
              class="p-3 space-y-3 flex-1 min-h-[120px] transition-colors"
              [class.bg-blue-50]="dragOverStatus === column.key"
              [class.dark:bg-blue-900/20]="dragOverStatus === column.key"
            >
              <div
                *ngFor="let task of tasksByStatus(column.key); trackBy: trackByTaskId"
                class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm cursor-move transition-colors"
                draggable="true"
                (dragstart)="startDrag($event, task)"
                (dragend)="resetDrag()"
                [class.opacity-60]="updatingStatusId === task.id"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ task.title }}</h4>
                    <p *ngIf="task.description" class="text-sm text-gray-600 dark:text-gray-400">
                      {{ task.description }}
                    </p>
                    <div class="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span *ngIf="task.dueDate">Due: {{ task.dueDate | date:'shortDate' }}</span>
                      <span class="px-2 py-1 rounded-full font-medium" [ngClass]="getPriorityBadgeClass(task.priority)">
                        {{ getPriorityLabel(task.priority) }}
                      </span>
                    </div>
                  </div>
                  <button
                    class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    (click)="editTask(task.id)"
                    type="button"
                  >
                    Edit
                  </button>
                </div>
                <div class="flex flex-wrap gap-2 mt-3">
                  <button
                    *ngFor="let target of columns"
                    type="button"
                    class="text-[11px] px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md hover:border-blue-500 dark:hover:border-blue-400 text-gray-600 dark:text-gray-300 transition-colors"
                    (click)="moveTo(task, target.key)"
                    [disabled]="target.key === task.status"
                  >
                    Move to {{ target.title }}
                  </button>
                </div>
              </div>

              <p *ngIf="tasksByStatus(column.key).length === 0" class="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No tasks here yet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanBoardComponent implements OnInit {
  tasks: TaskResponse[] = [];
  loading = true;
  updatingStatusId: string | null = null;
  draggedTask: TaskResponse | null = null;
  dragOverStatus: TaskStatus | null = null;
  currentUser: any;
  TaskStatus = TaskStatus;

  columns: KanbanColumn[] = [
    { key: TaskStatus.Pending, title: 'Pending', description: 'Not started yet', accent: 'purple' },
    { key: TaskStatus.InProgress, title: 'In Progress', description: 'Currently being worked on', accent: 'yellow' },
    { key: TaskStatus.Completed, title: 'Completed', description: 'Finished tasks', accent: 'green' },
    { key: TaskStatus.Cancelled, title: 'Cancelled', description: 'Dropped tasks', accent: 'red' }
  ];

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tasks = response.data;
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  tasksByStatus(status: TaskStatus): TaskResponse[] {
    return this.tasks.filter(task => task.status === status);
  }

  startDrag(event: DragEvent, task: TaskResponse): void {
    this.draggedTask = task;
    event.dataTransfer?.setData('text/plain', task.id);
  }

  allowDrop(event: DragEvent, status: TaskStatus): void {
    event.preventDefault();
    this.dragOverStatus = status;
  }

  drop(event: DragEvent, newStatus: TaskStatus): void {
    event.preventDefault();
    const taskId = event.dataTransfer?.getData('text/plain') || this.draggedTask?.id;
    if (!taskId) {
      this.resetDrag();
      return;
    }
    const task = this.tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) {
      this.resetDrag();
      return;
    }
    this.applyStatusChange(taskId, newStatus, task.status);
  }

  moveTo(task: TaskResponse, newStatus: TaskStatus): void {
    if (task.status === newStatus) {
      return;
    }
    this.applyStatusChange(task.id, newStatus, task.status);
  }

  private applyStatusChange(taskId: string, newStatus: TaskStatus, previousStatus: TaskStatus): void {
    this.updateLocalStatus(taskId, newStatus);
    this.updatingStatusId = taskId;

    this.taskService.updateTask(taskId, { status: newStatus }).subscribe({
      next: (response) => {
        if (!response.success) {
          this.updateLocalStatus(taskId, previousStatus);
        }
      },
      error: () => {
        this.updateLocalStatus(taskId, previousStatus);
      },
      complete: () => {
        this.updatingStatusId = null;
        this.resetDrag();
      }
    });
  }

  private updateLocalStatus(taskId: string, newStatus: TaskStatus): void {
    this.tasks = this.tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );
  }

  resetDrag(): void {
    this.draggedTask = null;
    this.dragOverStatus = null;
  }

  getAccentClass(accent: string): string {
    const accents: Record<string, string> = {
      purple: 'bg-purple-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      red: 'bg-red-500'
    };
    return accents[accent] || 'bg-gray-400';
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    const classes: Record<TaskPriority, string> = {
      [TaskPriority.Low]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      [TaskPriority.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
      [TaskPriority.High]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
      [TaskPriority.Critical]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    };
    return classes[priority] || 'bg-gray-100 text-gray-800';
  }

  getPriorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      [TaskPriority.Low]: 'Low',
      [TaskPriority.Medium]: 'Medium',
      [TaskPriority.High]: 'High',
      [TaskPriority.Critical]: 'Critical'
    };
    return labels[priority] || String(priority);
  }

  editTask(taskId: string): void {
    this.router.navigate(['/tasks/edit', taskId]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get displayName(): string {
    const name = this.currentUser?.fullName?.trim();
    if (name) {
      return name;
    }
    const email = this.currentUser?.email;
    if (email) {
      return email.split('@')[0];
    }
    return 'User';
  }

  trackByTaskId(_: number, task: TaskResponse): string {
    return task.id;
  }
}
