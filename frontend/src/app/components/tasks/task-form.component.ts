import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule, RouterLinkActive } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskPriority, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { LayoutHeaderComponent } from '../shared/layout-header.component';
import { LayoutFooterComponent } from '../shared/layout-footer.component';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterLinkActive, LayoutHeaderComponent, LayoutFooterComponent],
  templateUrl: './task-form.component.html'
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  taskId: string | null = null;
  TaskPriority = TaskPriority;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    public themeService: ThemeService,
    private authService: AuthService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: [0, Validators.required],
      priority: [1, Validators.required],
      dueDate: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.authService.loadCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.taskId = this.route.snapshot.paramMap.get('id');
    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask(this.taskId);
    }
  }

  loadTask(id: string): void {
    this.isLoading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const task = response.data;
          this.taskForm.patchValue({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to load task';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      if (this.isEditMode && this.taskId) {
        const formValue = this.taskForm.value;
        const taskData: UpdateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          status: Number(formValue.status),
          priority: Number(formValue.priority),
          dueDate: formValue.dueDate || undefined
        };
        this.taskService.updateTask(this.taskId, taskData).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Task updated successfully!';
              setTimeout(() => {
                this.router.navigate(['/tasks']);
              }, 1500);
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to update task';
            this.isLoading = false;
          }
        });
      } else {
        const formValue = this.taskForm.value;
        const taskData: CreateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          priority: Number(formValue.priority),
          dueDate: formValue.dueDate || undefined
        };
        this.taskService.createTask(taskData).subscribe({
          next: (response) => {
            if (response.success) {
              this.successMessage = 'Task created successfully!';
              setTimeout(() => {
                this.router.navigate(['/tasks']);
              }, 1500);
            }
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage = error.error?.message || 'Failed to create task';
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/tasks']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get displayName(): string {
    const raw = this.currentUser?.fullName?.trim() || this.currentUser?.email?.split('@')[0] || 'User';
    const first = raw.split(' ')[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
}
