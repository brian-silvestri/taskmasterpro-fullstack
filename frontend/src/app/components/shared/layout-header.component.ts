import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-layout-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bg-gray-900 text-white shadow-sm transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 py-3 md:py-0 w-full">
          <div class="flex flex-wrap items-center gap-3 md:gap-6 w-full md:w-auto">
            <h1 class="text-2xl font-bold text-white">TaskMaster Pro</h1>
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <a
                routerLink="/dashboard"
                routerLinkActive="bg-blue-700 text-white"
                [routerLinkActiveOptions]="{ exact: false }"
                class="px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Dashboard
              </a>
              <a
                routerLink="/tasks"
                routerLinkActive="bg-blue-700 text-white"
                [routerLinkActiveOptions]="{ exact: false }"
                class="px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                All Tasks
              </a>
              <a
                routerLink="/kanban"
                routerLinkActive="bg-blue-700 text-white"
                [routerLinkActiveOptions]="{ exact: false }"
                class="px-4 py-2 text-sm font-medium text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Kanban
              </a>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-3 md:justify-end w-full md:w-auto" *ngIf="showAuthActions">
            <button
              (click)="themeService.toggleDarkMode()"
              class="p-2 text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              title="Toggle dark mode"
            >
              <svg *ngIf="!themeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <svg *ngIf="themeService.isDarkMode()" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </button>
            <span class="text-gray-100 text-sm md:text-base">Hello, {{ displayName || 'User' }}!</span>
            <button
              (click)="logout.emit()"
              class="px-4 py-2 text-sm text-red-300 hover:bg-red-900/30 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class LayoutHeaderComponent {
  @Input() displayName: string | null = null;
  @Input() showAuthActions = true;
  @Output() logout = new EventEmitter<void>();

  constructor(public themeService: ThemeService) {}
}
