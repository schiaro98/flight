import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import type { SearchParams, FlightResult } from '../types/flight';
import { environment } from '../../environments/environment';

const TIMEOUT_MS = 10000;

export interface FlightServiceError {
  error: string;
  message?: string;
  airport?: string;
}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  search(params: SearchParams): Observable<FlightResult[]> {
    let httpParams = new HttpParams()
      .set('origin', params.origin)
      .set('destination', params.destination)
      .set('dep', params.departureDate)
      .set('type', params.tripType)
      .set('adults', String(params.passengers.adults))
      .set('children', String(params.passengers.children))
      .set('infants', String(params.passengers.infants))
      .set('cabin', params.cabinClass);

    if (params.returnDate) {
      httpParams = httpParams.set('ret', params.returnDate);
    }

    return this.http.get<FlightResult[]>(`${this.baseUrl}/api/flights`, { params: httpParams }).pipe(
      timeout(TIMEOUT_MS),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 400 && err.error?.error === 'UNSUPPORTED_AIRPORT') {
          const e = new Error(err.error.message ?? 'Airport not supported') as Error & {
            code: string; airport: string;
          };
          e.code = 'UNSUPPORTED_AIRPORT';
          e.airport = err.error.airport;
          return throwError(() => e);
        }
        return throwError(() => new Error(err.error?.message ?? `HTTP ${err.status}`));
      })
    );
  }
}
