import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskResponse, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from '../models/task.model';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = 'http://localhost:5132/api/tasks';

  constructor(private http: HttpClient) {}

  getTasks(page: number = 1, pageSize: number = 20): Observable<ApiResponse<TaskResponse[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<ApiResponse<TaskResponse[]>>(this.apiUrl, { params });
  }

  getTaskById(id: string): Observable<ApiResponse<TaskResponse>> {
    return this.http.get<ApiResponse<TaskResponse>>(`${this.apiUrl}/${id}`);
  }

  getMyTasks(): Observable<ApiResponse<TaskResponse[]>> {
    return this.http.get<ApiResponse<TaskResponse[]>>(`${this.apiUrl}/my-tasks`);
  }

  getTasksByStatus(status: TaskStatus): Observable<ApiResponse<TaskResponse[]>> {
    return this.http.get<ApiResponse<TaskResponse[]>>(`${this.apiUrl}/status/${status}`);
  }

  createTask(task: CreateTaskRequest): Observable<ApiResponse<TaskResponse>> {
    return this.http.post<ApiResponse<TaskResponse>>(this.apiUrl, task);
  }

  updateTask(id: string, task: UpdateTaskRequest): Observable<ApiResponse<TaskResponse>> {
    return this.http.put<ApiResponse<TaskResponse>>(`${this.apiUrl}/${id}`, task);
  }

  deleteTask(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}
