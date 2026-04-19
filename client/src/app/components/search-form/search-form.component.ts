import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AirportInputComponent } from './airport-input.component';
import { SearchStore } from '../../store/search.store';
import { serializeSearchParams } from '../../utils/url-serializer';
import type { SearchParams, CabinClass } from '../../types/flight';

function originDestinationValidator(control: AbstractControl): ValidationErrors | null {
  const origin = control.get('origin')?.value;
  const destination = control.get('destination')?.value;
  if (origin && destination && origin === destination) {
    return { sameAirport: true };
  }
  return null;
}

function returnDateValidator(control: AbstractControl): ValidationErrors | null {
  const dep = control.get('departureDate')?.value;
  const ret = control.get('returnDate')?.value;
  if (dep && ret && ret < dep) {
    return { returnBeforeDeparture: true };
  }
  return null;
}

function maxPassengersValidator(control: AbstractControl): ValidationErrors | null {
  const adults = control.get('adults')?.value ?? 0;
  const children = control.get('children')?.value ?? 0;
  const infants = control.get('infants')?.value ?? 0;
  if (adults + children + infants > 9) {
    return { tooManyPassengers: true };
  }
  return null;
}

@Component({
  selector: 'app-search-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AirportInputComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white rounded-xl shadow-md p-6 space-y-4">
      <!-- Trip type -->
      <div class="flex gap-2">
        @for (t of tripTypes; track t.value) {
          <button type="button" (click)="setTripType(t.value)"
            class="px-4 py-1.5 rounded-full text-sm font-medium border transition-colors"
            [class.bg-blue-600]="form.get('tripType')?.value === t.value"
            [class.text-white]="form.get('tripType')?.value === t.value"
            [class.border-blue-600]="form.get('tripType')?.value === t.value"
            [class.bg-white]="form.get('tripType')?.value !== t.value"
            [class.text-gray-600]="form.get('tripType')?.value !== t.value"
            [class.border-gray-300]="form.get('tripType')?.value !== t.value">
            {{ t.label }}
          </button>
        }
      </div>

      <!-- Origin / Destination -->
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <app-airport-input
            label="From"
            placeholder="City or airport"
            [value]="form.get('origin')?.value || ''"
            [error]="getError('origin')"
            (valueChange)="form.get('origin')?.setValue($event)"
          />
        </div>
        <button type="button" (click)="swap()" aria-label="Swap"
          class="mt-6 p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors shrink-0">
          ⇄
        </button>
        <div class="flex-1">
          <app-airport-input
            label="To"
            placeholder="City or airport"
            [value]="form.get('destination')?.value || ''"
            [error]="getError('destination')"
            (valueChange)="form.get('destination')?.setValue($event)"
          />
        </div>
      </div>
      @if (form.errors?.['sameAirport'] && form.touched) {
        <p class="text-sm text-red-600">Origin and destination must be different</p>
      }
      @if (form.errors?.['tooManyPassengers']) {
        <p class="text-sm text-red-600">Total passengers cannot exceed 9</p>
      }

      <!-- Dates -->
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Departure</label>
          <input type="date" formControlName="departureDate"
            [min]="today"
            class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="getError('departureDate')"
            [class.border-gray-300]="!getError('departureDate')" />
          @if (getError('departureDate')) {
            <p class="mt-1 text-sm text-red-600">{{ getError('departureDate') }}</p>
          }
        </div>
        @if (showReturnDate) {
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Return</label>
            <input type="date" formControlName="returnDate"
              [min]="form.get('departureDate')?.value || today"
              class="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              [class.border-red-500]="form.errors?.['returnBeforeDeparture']"
              [class.border-gray-300]="!form.errors?.['returnBeforeDeparture']" />
            @if (form.errors?.['returnBeforeDeparture']) {
              <p class="mt-1 text-sm text-red-600">Return date must be on or after departure</p>
            }
          </div>
        }
      </div>

      <!-- Passengers + Cabin -->
      <div class="flex gap-4 flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Adults</label>
          <input type="number" formControlName="adults" min="1" max="9"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Children</label>
          <input type="number" formControlName="children" min="0" max="9"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <label class="block text-sm font-medium text-gray-700 mb-1">Infants</label>
          <input type="number" formControlName="infants" min="0" max="9"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div class="w-48">
          <label class="block text-sm font-medium text-gray-700 mb-1">Cabin class</label>
          <select formControlName="cabinClass"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            @for (c of cabinClasses; track c.value) {
              <option [value]="c.value">{{ c.label }}</option>
            }
          </select>
        </div>
      </div>

      <button type="submit" [disabled]="isLoading || form.invalid"
        class="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {{ isLoading ? 'Searching…' : 'Search Flights' }}
      </button>
    </form>
  `,
})
export class SearchFormComponent implements OnInit {
  @Input() isLoading = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private store = inject(SearchStore);

  today = new Date().toISOString().split('T')[0];

  tripTypes = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'multi-city', label: 'Multi-City' },
  ];

  cabinClasses = [
    { value: 'ECONOMY', label: 'Economy' },
    { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
    { value: 'BUSINESS', label: 'Business' },
    { value: 'FIRST', label: 'First' },
  ];

  form = this.fb.group({
    origin: ['MXP', Validators.required],
    destination: ['FCO', Validators.required],
    departureDate: [new Date().toISOString().split('T')[0], Validators.required],
    returnDate: [''],
    tripType: ['one-way'],
    adults: [1, [Validators.required, Validators.min(1)]],
    children: [0, Validators.min(0)],
    infants: [0, Validators.min(0)],
    cabinClass: ['ECONOMY'],
  }, { validators: [originDestinationValidator, returnDateValidator, maxPassengersValidator] });

  ngOnInit(): void {
    const params = this.store.searchParams();
    if (params) {
      this.form.patchValue({
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate ?? '',
        tripType: params.tripType,
        adults: params.passengers.adults,
        children: params.passengers.children,
        infants: params.passengers.infants,
        cabinClass: params.cabinClass,
      });
    }
  }

  get showReturnDate(): boolean {
    const t = this.form.get('tripType')?.value;
    return t === 'round-trip' || t === 'multi-city';
  }

  setTripType(value: string): void {
    this.form.get('tripType')?.setValue(value);
  }

  swap(): void {
    const origin = this.form.get('origin')?.value ?? '';
    const destination = this.form.get('destination')?.value ?? '';
    this.form.patchValue({ origin: destination, destination: origin });
    this.store.swapOriginDestination();
  }

  getError(field: string): string {
    const control = this.form.get(field);
    if (!control?.invalid || !control.touched) return '';
    if (control.errors?.['required']) return `Please select a ${field}`;
    if (control.errors?.['min']) return `Value must be at least ${control.errors['min'].min}`;
    return '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    const params: SearchParams = {
      origin: v.origin!,
      destination: v.destination!,
      departureDate: v.departureDate!,
      returnDate: v.returnDate || undefined,
      tripType: v.tripType as SearchParams['tripType'],
      passengers: { adults: v.adults!, children: v.children!, infants: v.infants! },
      cabinClass: v.cabinClass as CabinClass,
    };

    this.store.setSearchParams(params);
    const qs = serializeSearchParams(params).toString();
    this.router.navigate(['/results'], { queryParamsHandling: 'merge' }).then(() => {
      this.router.navigateByUrl(`/results?${qs}`);
    });
  }
}
