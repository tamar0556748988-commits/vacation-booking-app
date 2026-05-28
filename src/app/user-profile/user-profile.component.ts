import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit {
  user: any = null;
  editMode = false;
  showDeleteConfirm = false;
  successMsg = '';
  errorMsg = '';
  loading = false;

  editData = {
    fullName: '',
    phone: '',
    password: ''
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit() {
    const stored = localStorage.getItem('user');
    if (!stored || stored === 'undefined') {
      this.router.navigate(['/login']);
      return;
    }
    try {
      this.user = JSON.parse(stored);
    } catch (e) {
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
      return;
    }
    this.editData.fullName = this.user.fullName;
    this.editData.phone = this.user.phone || '';
  }

  startEdit() {
    this.editMode = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.editMode = false;
    this.editData.fullName = this.user.fullName;
    this.editData.phone = this.user.phone || '';
    this.editData.password = '';
    this.cdr.detectChanges();
  }

  saveEdit() {
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.cdr.detectChanges();

    const updateData: any = {
      fullName: this.editData.fullName,
      phone: this.editData.phone
    };
    if (this.editData.password) {
      updateData.password = this.editData.password;
    }

    this.http.put<any>(`http://localhost:3001/api/users/${this.user._id}`, updateData)
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.editMode = false;
          this.user = { ...this.user, ...updateData };
          localStorage.setItem('user', JSON.stringify(this.user));
          this.successMsg = 'Profile updated successfully!';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Update failed.';
          this.cdr.detectChanges();
        }
      });
  }

  deleteAccount() {
    this.loading = true;
    this.cdr.detectChanges();

    this.http.delete(`http://localhost:3001/api/users/${this.user._id}`)
      .subscribe({
        next: () => {
          localStorage.removeItem('user');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMsg = err.error?.message || 'Delete failed.';
          this.cdr.detectChanges();
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/home']);
  }
}
