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

  // משתנים חדשים לתמונה
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

  // פונקציה לטיפול בבחירת הקובץ מהמחשב
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

    // יצירת FormData כדי לתמוך בשליחת הקובץ
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
      formData.append('image', this.selectedFile); // 'image' הוא השם שהשרת יחפש
    }

    // שימי לב: ה-UserService צריך לדעת לקבל FormData (הסבר בהמשך)
    this.userService.addUser(formData as any).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Account created successfully! 🎉';
        this.cdr.detectChanges();
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Something went wrong.';
        this.cdr.detectChanges();
      }
    });
  }
}
