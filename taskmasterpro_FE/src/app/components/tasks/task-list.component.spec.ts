import { TaskListComponent } from './task-list.component';
import { of } from 'rxjs';
import { TaskPriority, TaskResponse, TaskStatus } from '../../models/task.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

class TaskServiceStub {
  mockTasks: TaskResponse[] = [
    {
      id: '1',
      title: 'Pending Task',
      status: TaskStatus.Pending,
      priority: TaskPriority.Medium,
      createdAt: new Date().toISOString(),
      createdByUser: { id: 'u1', email: 'a@test.com', fullName: 'User A' },
      description: 'Needs action'
    },
    {
      id: '2',
      title: 'Completed Task',
      status: TaskStatus.Completed,
      priority: TaskPriority.Low,
      createdAt: new Date().toISOString(),
      createdByUser: { id: 'u1', email: 'a@test.com', fullName: 'User A' }
    }
  ];

  getMyTasks() {
    return of({ success: true, data: this.mockTasks });
  }
}

class AuthServiceStub {
  getCurrentUser() {
    return { fullName: 'Tester', email: 'tester@example.com' };
  }
  logout() {}
}

class RouterStub {
  navigate = jasmine.createSpy('navigate');
}

class ThemeServiceStub {
  toggleDarkMode() {}
  isDarkMode() {
    return false;
  }
}

class ActivatedRouteStub {
  queryParams = of({});
}

describe('TaskListComponent (logic)', () => {
  let component: TaskListComponent;
  let taskService: TaskServiceStub;

  beforeEach(() => {
    taskService = new TaskServiceStub();
    component = new TaskListComponent(
      taskService as unknown as TaskService,
      new AuthServiceStub() as unknown as AuthService,
      new RouterStub() as unknown as Router,
      new ActivatedRouteStub() as unknown as ActivatedRoute,
      new ThemeServiceStub() as unknown as ThemeService
    );
    // Bypass HTTP load and set tasks directly for unit testing
    component.tasks = [...taskService.mockTasks];
  });

  it('filters by status', () => {
    component.selectedStatus = TaskStatus.Pending;
    component.filterTasks();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].status).toBe(TaskStatus.Pending);
  });

  it('filters by search term', () => {
    component.searchTerm = 'Completed';
    component.filterTasks();
    expect(component.filteredTasks.length).toBe(1);
    expect(component.filteredTasks[0].title).toContain('Completed');
  });

  it('sorts by title ascending', () => {
    component.sortBy = 'title';
    component.sortDirection = 'asc';
    component.filterTasks();
    const titles = component.filteredTasks.map(t => t.title);
    expect(titles).toEqual([...titles].sort());
  });
});
