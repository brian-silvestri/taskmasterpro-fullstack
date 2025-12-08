import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout-footer',
  standalone: true,
  imports: [CommonModule],
  host: { class: 'mt-auto w-full block' },
  template: `
    <footer class="bg-gray-900 text-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p class="text-sm">Built by Brian Silvestri</p>
        <p class="text-xs text-gray-400">TaskMaster Pro</p>
      </div>
    </footer>
  `
})
export class LayoutFooterComponent {}
