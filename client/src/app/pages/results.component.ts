import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../services/flight.service';
import { SearchStore } from '../store/search.store';
import { SearchFormComponent } from '../components/search-form/search-form.component';
import { FilterPanelComponent } from '../components/filter-panel/filter-panel.component';
import { FlightResultListComponent } from '../components/flight-results/flight-result-list.component';
import { PriceCalendarComponent } from '../components/price-calendar/price-calendar.component';
import { deserializeSearchParams, serializeSearchParams } from '../utils/url-serializer';
import {
  filterByPrice, filterByStops, filterByAirline,
  filterByDepartureTime, filterByDuration, filterPastFlights, sortResults
} from '../utils/filter-utils';
import type { FlightResult } from '../types/flight';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, SearchFormComponent, FilterPanelComponent, FlightResultListComponent, PriceCalendarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="bg-blue-700 px-4 py-4">
        <div class="mx-auto max-w-5xl">
          <app-search-form [isLoading]="isLoading()" />
        </div>
      </header>

      <main class="mx-auto max-w-5xl px-4 py-6">
        <!-- Mobile filter toggle -->
        <div class="mb-4 md:hidden">
          <button type="button" (click)="filterOpen.set(!filterOpen())"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
        {{ filterOpen() ? 'Hide Filters' : 'Show Filters' }}
          </button>
        </div>

        <div class="flex flex-col gap-6 md:flex-row md:items-start">
          <!-- Sidebar -->
          <aside class="w-full md:w-72 md:shrink-0" [class.hidden]="!filterOpen()" [class.md:block]="true">
            <app-filter-panel [results]="activeResults()" />
          </aside>

          <!-- Results -->
          <section class="min-w-0 flex-1">
            <app-flight-result-list
              [results]="filteredResults()"
              [isLoading]="isLoading()"
              [error]="errorMessage()"
            />
          </section>
        </div>
      </main>
    </div>
  `,
})
export class ResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private flightService = inject(FlightService);
  protected store = inject(SearchStore);

  results = signal<FlightResult[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  filterOpen = signal(false);

  activeResults = computed(() => filterPastFlights(this.results()));

  filteredResults = computed(() => {
    const fs = this.store.filterState();
    let r = this.activeResults();
    r = filterByPrice(r, fs.priceRange);
    r = filterByStops(r, fs.stops);
    r = filterByAirline(r, fs.airlines);
    r = filterByDepartureTime(r, fs.departureTimeSlots);
    r = filterByDuration(r, fs.maxDurationHours);
    return sortResults(r, fs.sortBy, fs.sortOrder);
  });

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const urlParams = new URLSearchParams();
      params.keys.forEach((k) => urlParams.set(k, params.get(k)!));
      const searchParams = deserializeSearchParams(urlParams);
      if (!searchParams) return;

      // Build a cache key from the search params
      const searchKey = urlParams.toString();

      this.store.setSearchParams(searchParams);

      // Use cached results if the search key matches — avoids re-fetching when
      // navigating back from the flight detail page
      if (this.store.cachedSearchKey() === searchKey && this.store.cachedResults().length > 0) {
        this.results.set(this.store.cachedResults());
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set('');
      this.store.resetFilters();

      this.flightService.search(searchParams).subscribe({
        next: (data) => {
          this.results.set(data);
          this.store.setResults(data, searchKey);
          this.isLoading.set(false);
        },
        error: (err: Error) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message);
          this.store.clearResults(); // Invalida la cache così la prossima ricerca riparte
        },
      });
    });
  }

  onCalendarDateSelected(date: string): void {
    const params = this.store.searchParams();
    if (!params) return;
    const updated = { ...params, departureDate: date };
    const qs = serializeSearchParams(updated).toString();
    this.router.navigateByUrl(`/results?${qs}`);
  }
}
