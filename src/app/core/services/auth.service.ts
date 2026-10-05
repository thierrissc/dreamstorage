import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { User } from '../../models/inventory.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/auth';

  currentUser = signal<User>({
    id: 1,
    username: 'admin',
    email: 'admin@dreamstorage.io',
    first_name: 'Gestor',
    last_name: 'DreamStorage',
    is_staff: true,
    is_superuser: true
  });

  isAuthenticated = signal<boolean>(true);

  constructor(private http: HttpClient) {
    this.checkSession();
  }

  checkSession() {
    this.http.get<User>(`${this.apiUrl}/profile/`).pipe(
      catchError(() => of(this.currentUser()))
    ).subscribe(user => {
      if (user) {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      }
    });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login/`, credentials).pipe(
      tap(res => {
        if (res.user) {
          this.currentUser.set(res.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/logout/`, {}).pipe(
      tap(() => {
        this.isAuthenticated.set(false);
      }),
      catchError(() => {
        this.isAuthenticated.set(false);
        return of({ message: 'Desconectado localmente' });
      })
    );
  }
}
