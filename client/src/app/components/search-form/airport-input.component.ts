import { Component, Input, Output, EventEmitter, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AirportService } from '../../services/airport.service';
import type { Airport } from '../../types/flight';

@Component({
  selector: 'app-airport-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ label }}</label>
      }
      <input
        type="text"
        [value]="displayValue()"
        (input)="onInput($event)"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        autocomplete="off"
        class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        [class.border-red-500]="error"
        [class.border-gray-300]="!error"
      />
      @if (error) {
        <p class="mt-1 text-sm text-red-600">{{ error }}</p>
      }
      @if (showDropdown()) {
        <ul class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          @if (isLoading()) {
            <li class="px-4 py-2 text-sm text-gray-500">Searching...</li>
          }
          @for (airport of airports(); track airport.iataCode) {
            <li
              (mousedown)="selectAirport(airport)"
              class="px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between gap-2"
            >
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-gray-900 truncate">{{ airport.name }}</span>
                <span class="text-xs text-gray-500">{{ airport.city }}, {{ airport.country }}</span>
              </div>
              <span class="text-sm font-bold text-blue-600 shrink-0">{{ airport.iataCode }}</span>
            </li>
          }
        </ul>
      }
    </div>
  `,
})
export class AirportInputComponent implements OnChanges {
  @Input() value = '';
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Output() valueChange = new EventEmitter<string>();

  private airportService = inject(AirportService);

  displayValue = signal('');
  airports = signal<Airport[]>([]);
  isLoading = signal(false);
  isOpen = signal(false);

  private searchSubject = new Subject<string>();
  private searchQuery = '';

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => {
        if (q.length < 2) { this.airports.set([]); this.isLoading.set(false); return []; }
        this.isLoading.set(true);
        return this.airportService.search(q);
      })
    ).subscribe((results) => {
      this.airports.set(results);
      this.isLoading.set(false);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value']) {
      const v = changes['value'].currentValue as string;
      if (!v) {
        this.displayValue.set('');
        this.searchQuery = '';
      } else if (!this.displayValue().startsWith(v)) {
        this.displayValue.set(v);
        this.searchQuery = '';
      }
    }
  }

  onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.displayValue.set(text);
    this.searchQuery = text;
    this.isOpen.set(true);
    if (!text) this.valueChange.emit('');
    this.searchSubject.next(text);
  }

  onFocus(): void {
    if (this.searchQuery.length >= 2) this.isOpen.set(true);
  }

  onBlur(): void {
    setTimeout(() => this.isOpen.set(false), 150);
  }

  selectAirport(airport: Airport): void {
    this.displayValue.set(`${airport.iataCode} — ${airport.city}`);
    this.searchQuery = '';
    this.airports.set([]);
    this.isOpen.set(false);
    this.valueChange.emit(airport.iataCode);
  }

  showDropdown(): boolean {
    return this.isOpen() && this.searchQuery.length >= 2 && (this.airports().length > 0 || this.isLoading());
  }
}
