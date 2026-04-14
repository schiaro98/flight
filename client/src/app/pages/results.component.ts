import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from '../services/flight.service';
import { SearchStore } from '../store/search.store';
import { SearchFormComponent } from '../components/search-form/search-form.component';
import { FilterPanelComponent } from '../components/filter-panel/filter-panel.component';
import { FlightResultListComponent } from '../components/flight-results/flight-result-list.component';
import { LoadingSpinnerComponent } from '../components/common/loading-spinner.component';
import { deserializeSearchParams, serializeSearchParams } from '../utils/url-serializer';
import {
  filterByPrice, filterByStops, filterByAirline,
  filterByDepartureTime, filterByDuration, sortResults
} from '../utils/filter-utils';
import type { FlightResult } from '../types/flight';

const NEARBY_AIRPORTS: Record<string, { code: string; name: string }[]> = {
  AOI: [
    { code: 'BLQ', name: 'Bologna (BLQ)' },
    { code: 'FCO', name: 'Rome Fiumicino (FCO)' },
    { code: 'MXP', name: 'Milan Malpensa (MXP)' },
  ],
};

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, SearchFormComponent, FilterPanelComponent, FlightResultListComponent, LoadingSpinnerComponent],
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
            <app-filter-panel [results]="results()" />
          </aside>

          <!-- Results -->
          <section class="min-w-0 flex-1">
            @if (unsupportedAirport() && nearbyOptions().length > 0) {
              <div class="rounded-lg border border-amber-200 bg-amber-50 p-6">
                <h3 class="text-lg font-semibold text-amber-900">{{ unsupportedAirport() }} is not available</h3>
                <p class="mt-2 text-sm text-amber-800">No commercial flights available. Try a nearby airport:</p>
                <div class="mt-4 space-y-2">
                  @for (airport of nearbyOptions(); track airport.code) {
                    <button (click)="switchAirport(airport.code)"
                      class="block w-full rounded-lg border border-amber-300 bg-white px-4 py-2 text-left text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors">
                      {{ airport.name }}
                    </button>
                  }
                </div>
              </div>
            } @else {
              <app-flight-result-list
                [results]="filteredResults()"
                [isLoading]="isLoading()"
                [error]="errorMessage()"
              />
            }
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
  private store = inject(SearchStore);

  results = signal<FlightResult[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');
  unsupportedAirport = signal<string | null>(null);
  filterOpen = signal(false);

  nearbyOptions = computed(() => {
    const code = this.unsupportedAirport();
    return code ? (NEARBY_AIRPORTS[code] ?? []) : [];
  });

  filteredResults = computed(() => {
    const fs = this.store.filterState();
    let r = filterByPrice(this.results(), fs.priceRange);
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

      this.store.setSearchParams(searchParams);
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.unsupportedAirport.set(null);

      this.flightService.search(searchParams).subscribe({
        next: (data) => { this.results.set(data); this.isLoading.set(false); },
        error: (err: Error & { code?: string; airport?: string }) => {
          this.isLoading.set(false);
          if (err.code === 'UNSUPPORTED_AIRPORT') {
            this.unsupportedAirport.set(err.airport ?? null);
          } else {
            this.errorMessage.set(err.message);
          }
        },
      });
    });
  }

  switchAirport(newCode: string): void {
    const params = this.store.searchParams();
    if (!params) return;
    const unsupported = this.unsupportedAirport();
    const updated = { ...params };
    if (unsupported === params.origin) updated.origin = newCode;
    else if (unsupported === params.destination) updated.destination = newCode;
    const qs = serializeSearchParams(updated).toString();
    this.router.navigateByUrl(`/results?${qs}`);
  }
}
