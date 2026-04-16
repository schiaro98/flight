import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { SearchParams, PriceCalendarEntry } from '../../types/flight';

@Component({
  selector: 'app-price-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex items-center justify-between mb-4">
        <button (click)="prevMonth()" [disabled]="!canGoPrev()"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ‹
        </button>
        <h3 class="text-sm font-semibold text-gray-700">{{ monthLabel() }}</h3>
        <button (click)="nextMonth()" [disabled]="!canGoNext()"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          ›
        </button>
      </div>

      <!-- Day headers -->
      <div class="grid grid-cols-7 mb-1">
        @for (d of dayNames; track d) {
          <div class="text-center text-xs text-gray-400 font-medium py-1">{{ d }}</div>
        }
      </div>

      @if (isLoading()) {
        <div class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blue-200 border-t-blue-600"></div>
        </div>
      } @else {
        <!-- Calendar grid -->
        <div class="grid grid-cols-7 gap-px">
          <!-- Empty cells for first day offset -->
          @for (e of emptyStart(); track $index) {
            <div></div>
          }
          @for (entry of entries(); track entry.date) {
            @let isPast = entry.date < today;
            @let isSelected = entry.date === selectedDate;
            <button
              (click)="!isPast && entry.minPrice !== null && selectDate(entry.date)"
              [disabled]="isPast || entry.minPrice === null"
              class="flex flex-col items-center py-1 px-0.5 rounded text-center transition-colors text-xs"
              [class.bg-blue-600]="isSelected"
              [class.text-white]="isSelected"
              [class.bg-green-50]="!isSelected && entry.isLowest && !isPast"
              [class.text-green-700]="!isSelected && entry.isLowest && !isPast"
              [class.hover:bg-blue-50]="!isSelected && !isPast && entry.minPrice !== null"
              [class.opacity-30]="isPast"
              [class.cursor-not-allowed]="isPast || entry.minPrice === null"
            >
              <span class="font-medium">{{ dayNumber(entry.date) }}</span>
              @if (entry.minPrice !== null && !isPast) {
                <span class="text-[10px] leading-tight">
                  {{ formatPrice(entry.minPrice, entry.currency) }}
                </span>
              } @else if (!isPast) {
                <span class="text-[10px] text-gray-300">—</span>
              }
            </button>
          }
        </div>
      }

      <p class="mt-3 text-xs text-gray-400 text-center">
        🟢 Prezzo più basso del mese
      </p>
    </div>
  `,
})
export class PriceCalendarComponent implements OnChanges {
  @Input() searchParams: SearchParams | null = null;
  @Input() selectedDate = '';
  @Output() dateSelected = new EventEmitter<string>();

  private http = inject(HttpClient);

  dayNames = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];
  today = new Date().toISOString().split('T')[0];

  currentYear = signal(new Date().getFullYear());
  currentMonth = signal(new Date().getMonth() + 1); // 1-based
  entries = signal<PriceCalendarEntry[]>([]);
  isLoading = signal(false);

  monthLabel = () => {
    const d = new Date(this.currentYear(), this.currentMonth() - 1, 1);
    return d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  };

  canGoPrev = () => {
    const now = new Date();
    return this.currentYear() > now.getFullYear() ||
      (this.currentYear() === now.getFullYear() && this.currentMonth() > now.getMonth() + 1);
  };

  canGoNext = () => {
    const now = new Date();
    const maxYear = now.getFullYear();
    const maxMonth = now.getMonth() + 3; // max 3 months ahead
    const cur = this.currentYear() * 12 + this.currentMonth();
    const max = maxYear * 12 + maxMonth;
    return cur < max;
  };

  emptyStart = () => {
    const firstDay = new Date(this.currentYear(), this.currentMonth() - 1, 1).getDay();
    // Convert Sunday=0 to Monday=0 offset
    return Array(firstDay === 0 ? 6 : firstDay - 1).fill(0);
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchParams'] && this.searchParams) {
      // Set initial month from departure date
      const dep = this.searchParams.departureDate;
      if (dep) {
        const d = new Date(dep);
        this.currentYear.set(d.getFullYear());
        this.currentMonth.set(d.getMonth() + 1);
      }
      this.loadCalendar();
    }
  }

  prevMonth(): void {
    if (!this.canGoPrev()) return;
    if (this.currentMonth() === 1) {
      this.currentMonth.set(12);
      this.currentYear.update((y) => y - 1);
    } else {
      this.currentMonth.update((m) => m - 1);
    }
    this.loadCalendar();
  }

  nextMonth(): void {
    if (!this.canGoNext()) return;
    if (this.currentMonth() === 12) {
      this.currentMonth.set(1);
      this.currentYear.update((y) => y + 1);
    } else {
      this.currentMonth.update((m) => m + 1);
    }
    this.loadCalendar();
  }

  loadCalendar(): void {
    if (!this.searchParams) return;
    this.isLoading.set(true);
    this.entries.set([]);

    const params = new HttpParams()
      .set('origin', this.searchParams.origin)
      .set('destination', this.searchParams.destination)
      .set('year', String(this.currentYear()))
      .set('month', String(this.currentMonth()))
      .set('cabin', this.searchParams.cabinClass)
      .set('adults', String(this.searchParams.passengers.adults));

    this.http.get<PriceCalendarEntry[]>(`${environment.apiBaseUrl}/api/price-calendar`, { params })
      .subscribe({
        next: (data) => { this.entries.set(data); this.isLoading.set(false); },
        error: () => { this.isLoading.set(false); },
      });
  }

  selectDate(date: string): void {
    this.dateSelected.emit(date);
  }

  dayNumber(date: string): number {
    return parseInt(date.split('-')[2], 10);
  }

  formatPrice(price: number, currency: string): string {
    return price.toLocaleString('it-IT', {
      style: 'currency', currency, maximumFractionDigits: 0,
    });
  }
}
