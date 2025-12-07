import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TaskResponse, TaskStatus, TaskPriority } from '../../models/task.model';
import { ConfirmationModalComponent } from '../shared/confirmation-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ConfirmationModalComponent],
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
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors duration-200">
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
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors duration-200">
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
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors duration-200">
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
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-6 transition-colors duration-200">
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
          </div>
        </div>

        <!-- Overdue Tasks Alert -->
        <div *ngIf="!loading && overdueTasks.length > 0" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 mb-6 rounded transition-colors duration-200">
          <div class="flex items-center">
            <svg class="w-6 h-6 text-red-500 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="text-red-800 dark:text-red-300 font-semibold">{{ overdueTasks.length }} Overdue Task{{ overdueTasks.length > 1 ? 's' : '' }}</h3>
              <p class="text-red-700 dark:text-red-400 text-sm">You have tasks that are past their due date</p>
            </div>
          </div>
        </div>

        <!-- Today's Focus Section -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 mb-6 transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Today's Focus</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">High priority tasks that need your attention</p>
            </div>
            <a routerLink="/tasks/create" class="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              + New Task
            </a>
          </div>

          <div *ngIf="loading" class="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading tasks...
          </div>

          <div *ngIf="!loading && todaysFocus.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="font-medium dark:text-gray-300">All caught up!</p>
            <p class="text-sm">No high priority tasks at the moment</p>
          </div>

          <div *ngIf="!loading && todaysFocus.length > 0" class="divide-y divide-gray-200 dark:divide-gray-700">
            <div *ngFor="let task of todaysFocus" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <h3 class="text-base font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
                    <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getPriorityBadgeClass(task.priority)">
                      {{ getPriorityLabel(task.priority) }}
                    </span>
                  </div>
                  <p *ngIf="task.description" class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ task.description }}</p>
                  <div class="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span *ngIf="task.dueDate" [class.text-red-600]="isOverdue(task.dueDate)" [class.dark:text-red-400]="isOverdue(task.dueDate)">
                      {{ isOverdue(task.dueDate) ? 'Overdue' : 'Due' }}: {{ task.dueDate | date:'short' }}
                    </span>
                  </div>
                </div>
                <button
                  (click)="editTask(task.id)"
                  class="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Due Soon Section -->
        <div *ngIf="!loading && dueSoonTasks.length > 0" class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 mb-6 transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Due Soon (Next 3 Days)</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ dueSoonTasks.length }} task{{ dueSoonTasks.length > 1 ? 's' : '' }} coming up</p>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div *ngFor="let task of dueSoonTasks" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="text-sm font-medium text-gray-900 dark:text-white">{{ task.title }}</h3>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ task.dueDate | date:'medium' }}</span>
                    <span class="px-2 py-1 text-xs font-medium rounded-full" [ngClass]="getStatusBadgeClass(task.status)">
                      {{ getStatusLabel(task.status) }}
                    </span>
                  </div>
                </div>
                <button
                  (click)="editTask(task.id)"
                  class="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 transition-colors duration-200">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          </div>
          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a routerLink="/tasks" [queryParams]="{status: TaskStatus.Pending}" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer">
              <div class="flex items-center">
                <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mr-3 transition-colors">
                  <svg class="w-6 h-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">View Pending</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ getTaskCountByStatus(TaskStatus.Pending) }} tasks</p>
                </div>
              </div>
            </a>
            <a routerLink="/tasks" [queryParams]="{status: TaskStatus.InProgress}" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-yellow-500 dark:hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer">
              <div class="flex items-center">
                <div class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mr-3 transition-colors">
                  <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">In Progress</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ getTaskCountByStatus(TaskStatus.InProgress) }} tasks</p>
                </div>
              </div>
            </a>
            <a routerLink="/tasks" class="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
              <div class="flex items-center">
                <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3 transition-colors">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">View All</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ tasks.length }} total tasks</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- View Task Modal -->
    <div *ngIf="showViewModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" (click)="closeViewModal()"></div>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 dark:text-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex justify-between items-start mb-4">
              <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedTask?.title }}</h3>
              <button (click)="closeViewModal()" class="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-4">
              <div class="flex space-x-2">
                <span class="px-3 py-1 text-sm font-medium rounded-full" [ngClass]="getStatusBadgeClass(selectedTask!.status)">
                  {{ getStatusLabel(selectedTask!.status) }}
                </span>
                <span class="px-3 py-1 text-sm font-medium rounded-full" [ngClass]="getPriorityBadgeClass(selectedTask!.priority)">
                  {{ getPriorityLabel(selectedTask!.priority) }}
                </span>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">Description</h4>
                <p class="text-gray-900 dark:text-gray-200">{{ selectedTask?.description || 'No description provided' }}</p>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">Created</h4>
                  <p class="text-gray-900 dark:text-gray-200">{{ selectedTask?.createdAt | date:'medium' }}</p>
                </div>
                <div *ngIf="selectedTask?.dueDate">
                  <h4 class="text-sm font-medium text-gray-500 dark:text-gray-300 mb-1">Due Date</h4>
                  <p class="text-gray-900 dark:text-gray-200">{{ selectedTask?.dueDate | date:'medium' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              (click)="editTask(selectedTask!.id)"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-500 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Edit Task
            </button>
            <button
              (click)="closeViewModal()"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-700 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <app-confirmation-modal
      [isOpen]="showDeleteModal"
      [title]="'Delete Task'"
      [message]="'Are you sure you want to delete this task? This action cannot be undone.'"
      [confirmText]="'Delete'"
      [cancelText]="'Cancel'"
      [type]="'danger'"
      (confirm)="confirmDelete()"
      (cancel)="cancelDelete()"
    ></app-confirmation-modal>
  `
})
export class DashboardComponent implements OnInit {
  tasks: TaskResponse[] = [];
  loading = true;
  currentUser: any;
  TaskStatus = TaskStatus;
  TaskPriority = TaskPriority;
  showDeleteModal = false;
  taskToDelete: string | null = null;
  showViewModal = false;
  selectedTask: TaskResponse | null = null;

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

  // Get tasks that are not completed or cancelled
  get activeTasks(): TaskResponse[] {
    return this.tasks.filter(t =>
      t.status !== TaskStatus.Completed && t.status !== TaskStatus.Cancelled
    );
  }

  // Get today's focus - high/critical priority tasks that are pending or in progress
  get todaysFocus(): TaskResponse[] {
    return this.tasks
      .filter(t =>
        (t.status === TaskStatus.Pending || t.status === TaskStatus.InProgress) &&
        (t.priority === TaskPriority.Critical || t.priority === TaskPriority.High)
      )
      .slice(0, 5);
  }

  // Get overdue tasks
  get overdueTasks(): TaskResponse[] {
    const today = this.todayDateOnly();
    return this.tasks.filter(t =>
      t.dueDate &&
      this.toDateOnly(t.dueDate) < today &&
      t.status !== TaskStatus.Completed &&
      t.status !== TaskStatus.Cancelled
    );
  }

  // Get tasks due soon (within 3 days)
  get dueSoonTasks(): TaskResponse[] {
    const today = this.todayDateOnly();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    return this.tasks.filter(t =>
      t.dueDate &&
      this.toDateOnly(t.dueDate) >= today &&
      this.toDateOnly(t.dueDate) <= threeDaysFromNow &&
      t.status !== TaskStatus.Completed &&
      t.status !== TaskStatus.Cancelled
    );
  }

  isOverdue(dueDate: string): boolean {
    return this.toDateOnly(dueDate) < this.todayDateOnly();
  }

  getTaskCountByStatus(status: TaskStatus): number {
    return this.tasks.filter(t => t.status === status).length;
  }

  getStatusLabel(status: TaskStatus): string {
    return TaskStatus[status];
  }

  getPriorityLabel(priority: TaskPriority): string {
    return TaskPriority[priority];
  }

  getStatusBadgeClass(status: TaskStatus): string {
    const classes: { [key: number]: string } = {
      [TaskStatus.Pending]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
      [TaskStatus.InProgress]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
      [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
      [TaskStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    };
    return classes[status] || '';
  }

  getPriorityBadgeClass(priority: TaskPriority): string {
    const classes: { [key: number]: string } = {
      [TaskPriority.Low]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      [TaskPriority.Medium]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
      [TaskPriority.High]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
      [TaskPriority.Critical]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200'
    };
    return classes[priority] || '';
  }

  viewTask(task: TaskResponse): void {
    this.selectedTask = task;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTask = null;
  }

  editTask(taskId: string): void {
    this.closeViewModal();
    this.router.navigate(['/tasks/edit', taskId]);
  }

  deleteTask(id: string): void {
    this.taskToDelete = id;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.taskToDelete) {
      this.taskService.deleteTask(this.taskToDelete).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
          this.showDeleteModal = false;
          this.taskToDelete = null;
        },
        error: () => {
          this.showDeleteModal = false;
          this.taskToDelete = null;
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.taskToDelete = null;
  }

  logout(): void {
    this.authService.logout();
  }

  private todayDateOnly(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // Date-only comparison avoids timezone offsets marking future dates as overdue
  }

  private toDateOnly(dateString: string): Date {
    const d = new Date(dateString);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  get displayName(): string {
    const raw = this.currentUser?.fullName?.trim() || this.currentUser?.email?.split('@')[0] || 'User';
    const first = raw.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
}
