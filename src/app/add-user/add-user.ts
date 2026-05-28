import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { UserServiceService } from '../services/user-service.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-user.html',
  styleUrls: ['./add-user.css']
})
export class AddUser {
  successMsg = '';
  errorMsg = '';
  loading = false;
  showPassword = false;

  // משתנים לתמונה
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  user = {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    hostDetails: { businessName: '' }
  };

  constructor(
    private userService: UserServiceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  // הפונקציה שמתקנת את השגיאה האדומה בתמונה ששלחת
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  addUser() {
    this.successMsg = '';
    this.errorMsg = '';

    if (!this.user.fullName || !this.user.email || !this.user.password || !this.user.phone) {
      this.errorMsg = 'Please fill in all required fields.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();

    // יצירת המעטפה (FormData) שכוללת גם את הקובץ וגם את הטקסט
    const formData = new FormData();
    formData.append('fullName', this.user.fullName);
    formData.append('email', this.user.email);
    formData.append('password', this.user.password);
    formData.append('phone', this.user.phone);
    formData.append('role', this.user.role);
    
    if (this.user.role === 'host') {
      formData.append('businessName', this.user.hostDetails.businessName);
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile); 
    }

    // שליחת ה-formData לשרת
    this.userService.addUser(formData).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Account created successfully! 🎉';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        // כאן תופיע שגיאת ה-404 אם השרת לא מכיר את הכתובת
        this.errorMsg = err.error?.message || 'Server error: Check if the route exists.';
        this.cdr.detectChanges();
      }
    });
  }
}