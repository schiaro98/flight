import { Component } from '@angular/core';
import { SearchFormComponent } from '../components/search-form/search-form.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SearchFormComponent],
  template: `
    <main class="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center px-4 py-12">
      <div class="w-full max-w-2xl">
        <h1 class="text-3xl font-bold text-white text-center mb-8">Find Your Flight</h1>
        <app-search-form />
      </div>
    </main>
  `,
})
export class HomeComponent {}
