import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, RouterLinkActive, Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TaskResponse, TaskStatus, TaskPriority } from '../../models/task.model';
import { ConfirmationModalComponent } from '../shared/confirmation-modal.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RouterLinkActive, ConfirmationModalComponent],
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
                  [routerLinkActiveOptions]="{exact: false}"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/tasks"
                  routerLinkActive="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  All Tasks
                </a>
                <a
                  routerLink="/kanban"
                  routerLinkActive="bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                  [routerLinkActiveOptions]="{exact: false}"
                  class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Kanban
                </a>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <!-- Dark Mode Toggle -->
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
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <button
            (click)="selectedStatus = null; filterTasks()"
            [class.ring-2]="selectedStatus === null"
            [class.ring-blue-500]="selectedStatus === null"
            class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 text-left hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ tasks.length }}</p>
              </div>
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full transition-colors">
                <svg class="w-8 h-8 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </button>

          <button
            (click)="selectedStatus = TaskStatus.Pending; filterTasks()"
            [class.ring-2]="selectedStatus === TaskStatus.Pending"
            [class.ring-purple-500]="selectedStatus === TaskStatus.Pending"
            class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 text-left hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ getTaskCountByStatus(TaskStatus.Pending) }}</p>
              </div>
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full transition-colors">
                <svg class="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>

          <button
            (click)="selectedStatus = TaskStatus.InProgress; filterTasks()"
            [class.ring-2]="selectedStatus === TaskStatus.InProgress"
            [class.ring-yellow-500]="selectedStatus === TaskStatus.InProgress"
            class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 text-left hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{{ getTaskCountByStatus(TaskStatus.InProgress) }}</p>
              </div>
              <div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full transition-colors">
                <svg class="w-8 h-8 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>

          <button
            (click)="selectedStatus = TaskStatus.Completed; filterTasks()"
            [class.ring-2]="selectedStatus === TaskStatus.Completed"
            [class.ring-green-500]="selectedStatus === TaskStatus.Completed"
            class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 text-left hover:shadow-lg transition-all"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ getTaskCountByStatus(TaskStatus.Completed) }}</p>
              </div>
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors">
                <svg class="w-8 h-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 mb-6 transition-colors duration-200">
          <!-- Search Bar -->
          <div class="mb-4">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterTasks()"
                placeholder="Search tasks by title or description..."
                class="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
              <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Filters -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Status</label>
              <select
                [(ngModel)]="selectedStatus"
                (change)="filterTasks()"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option [ngValue]="null">All Statuses</option>
                <option [ngValue]="TaskStatus.Pending">Pending</option>
                <option [ngValue]="TaskStatus.InProgress">In Progress</option>
                <option [ngValue]="TaskStatus.Completed">Completed</option>
                <option [ngValue]="TaskStatus.Cancelled">Cancelled</option>
              </select>
            </div>

            <!-- Priority Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by Priority</label>
              <select
                [(ngModel)]="selectedPriority"
                (change)="filterTasks()"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option [ngValue]="null">All Priorities</option>
                <option [ngValue]="TaskPriority.Low">Low</option>
                <option [ngValue]="TaskPriority.Medium">Medium</option>
                <option [ngValue]="TaskPriority.High">High</option>
                <option [ngValue]="TaskPriority.Critical">Critical</option>
              </select>
            </div>

            <!-- Sort By -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
              <select
                [(ngModel)]="sortBy"
                (ngModelChange)="filterTasks()"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <!-- Filter Actions -->
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              Showing {{ filteredTasks.length }} of {{ tasks.length }} tasks
            </div>
            <div class="flex space-x-2">
              <button
                *ngIf="searchTerm || selectedStatus !== null || selectedPriority !== null"
                (click)="clearFilters()"
                class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Clear Filters
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
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-300">Loading tasks...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredTasks.length === 0" class="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
          <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tasks found</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ selectedStatus === null ? 'Get started by creating a new task.' : 'No tasks with this status.' }}
          </p>
          <div class="mt-6">
            <a
              routerLink="/tasks/create"
              class="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Create New Task
            </a>
          </div>
        </div>

        <!-- Tasks List -->
        <div *ngIf="!loading && filteredTasks.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50">
          <div *ngFor="let task of filteredTasks" class="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
                  <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getStatusBadgeClass(task.status)">
                    {{ getStatusLabel(task.status) }}
                  </span>
                  <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getPriorityBadgeClass(task.priority)">
                    {{ getPriorityLabel(task.priority) }}
                  </span>
                </div>
                <p *ngIf="task.description" class="text-gray-600 dark:text-gray-400 mb-2">{{ task.description }}</p>
                <div class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Created: {{ task.createdAt | date:'short' }}</span>
                  <span *ngIf="task.dueDate">Due: {{ task.dueDate | date:'short' }}</span>
                </div>
              </div>
              <div class="flex space-x-2 ml-4">
                <button
                  (click)="editTask(task.id)"
                  class="px-3 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  Edit
                </button>
                <button
                  (click)="confirmDelete(task)"
                  class="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-confirmation-modal
      *ngIf="showDeleteConfirmation"
      [title]="'Delete Task'"
      [message]="'Are you sure you want to delete &quot;' + taskToDelete?.title + '&quot;? This action cannot be undone.'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      (confirm)="deleteTask()"
      (cancel)="cancelDelete()"
    ></app-confirmation-modal>
  `
})
export class TaskListComponent implements OnInit {
  tasks: TaskResponse[] = [];
  filteredTasks: TaskResponse[] = [];
  loading = true;
  currentUser: any;
  selectedStatus: TaskStatus | null = null;
  selectedPriority: TaskPriority | null = null;
  searchTerm: string = '';
  sortBy: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  showDeleteConfirmation = false;
  taskToDelete: TaskResponse | null = null;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.route.queryParams.subscribe(params => {
      this.setStatusFromQuery(params['status']);
      if (!this.loading) {
        this.filterTasks();
      }
    });
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getMyTasks().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.tasks = response.data;
          this.filterTasks();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterTasks(): void {
    let result = [...this.tasks];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by status
    if (this.selectedStatus !== null) {
      result = result.filter(task => task.status === this.selectedStatus);
    }

    // Filter by priority
    if (this.selectedPriority !== null) {
      result = result.filter(task => task.priority === this.selectedPriority);
    }

    // Sort tasks
    result = this.sortTasks(result);

    this.filteredTasks = result;
  }

  sortTasks(tasks: TaskResponse[]): TaskResponse[] {
    return tasks.sort((a, b) => {
      let comparison = 0;

      switch (this.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'dueDate':
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
        case 'priority':
          comparison = b.priority - a.priority; // Higher priority first
          break;
        case 'status':
          comparison = a.status - b.status;
          break;
        case 'createdAt':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  clearFilters(): void {
    this.selectedStatus = null;
    this.selectedPriority = null;
    this.searchTerm = '';
    this.filterTasks();
  }

  private setStatusFromQuery(statusParam: string | null | undefined): void {
    if (statusParam === null || statusParam === undefined || statusParam === '') {
      this.selectedStatus = null;
      return;
    }
    const parsed = Number(statusParam);
    const validStatuses = new Set([
      TaskStatus.Pending,
      TaskStatus.InProgress,
      TaskStatus.Completed,
      TaskStatus.Cancelled
    ]);
    this.selectedStatus = validStatuses.has(parsed as TaskStatus) ? (parsed as TaskStatus) : null;
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(task => task.status === status).length;
  }

  get displayName(): string {
    const raw = this.currentUser?.fullName?.trim() || this.currentUser?.email?.split('@')[0] || 'User';
    const first = raw.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const classes: Record<TaskStatus, string> = {
      [TaskStatus.Pending]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
      [TaskStatus.InProgress]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
      [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
      [TaskStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
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

  getStatusLabel(status: TaskStatus): string {
    const labels: Record<TaskStatus, string> = {
      [TaskStatus.Pending]: 'Pending',
      [TaskStatus.InProgress]: 'In Progress',
      [TaskStatus.Completed]: 'Completed',
      [TaskStatus.Cancelled]: 'Cancelled'
    };
    return labels[status] || String(status);
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

  confirmDelete(task: TaskResponse): void {
    this.taskToDelete = task;
    this.showDeleteConfirmation = true;
  }

  deleteTask(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.showDeleteConfirmation = false;
            this.taskToDelete = null;
            this.loadTasks();
          }
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.taskToDelete = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
