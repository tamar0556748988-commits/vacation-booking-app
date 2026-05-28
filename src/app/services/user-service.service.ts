import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserServiceService {
  private api = 'http://localhost:3001/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<any[]> { 
    return this.http.get<any[]>(this.api); 
  }
  addUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/register`, formData);
    //                          ^^^^ api ולא apiUrl
  }
  
  deleteUser(id: string): Observable<any> { 
    return this.http.delete<any>(`${this.api}/${id}`); 
  }
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password });
  }
}
