import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RoomService } from '../services/room.service';

@Component({
  selector: 'app-add-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-room.component.html',
  styleUrl: './add-room.component.css'
})
export class AddRoomComponent implements OnInit {

  saving = false;
  uploading = false;
  successMsg = '';
  errorMsg = '';
  currentUser: any = null;

  // Ordered city structure mapping your specified filters
  cityGroups = [
    { region: 'JERUSALEM AREA', cities: ['Jerusalem', 'Har Shmuel', 'Beit Shemesh'] },
    { region: 'NORTH', cities: ['Safed', 'Meron', 'Tiberias'] },
    { region: 'SOUTH', cities: ['Eilat', 'Dead Sea', 'Arad'] }
  ];

  // Dynamic subcategories mapped by property type
  subCategoryMap: Record<string, string[]> = {
    'Villa':     ['Villa with Pool', 'Large Family Villa', 'Villa with Garden', 'Quiet & Secluded'],
    'Zimmer':    ['Family Zimmer', 'Zimmer in Nature', 'Zimmer with Jacuzzi', 'Zimmer with Pool'],
    'Apartment': ['Large Family Apartment', 'Near the Western Wall', 'Near Synagogues', 'High Floor Apartment'],
    'Cottage':   [],
    'Penthouse': [],
    'Cabin':     []
  };

  subCategories: string[] = [];

  form = {
    name: '',
    price: 0,
    city: '',
    address: '',
    description: '',
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    type: '',
    subCategory: '',
    amenities: [] as string[],
    images: [] as string[]
  };

  allAmenities = [
    'Pool', 'WiFi', 'Sea View', 'Trampoline', 'BBQ',
    'Parking', 'AC', 'Kitchen', 'Garden', 'TV',
    'Jacuzzi', 'Washing Machine', 'Lake View', 'Kids Area'
  ];

  constructor(
    private roomService: RoomService, 
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { this.currentUser = JSON.parse(stored); } catch {}
    }
  }

  // Triggered when changing property type selection
  onTypeChange() {
    this.subCategories = this.subCategoryMap[this.form.type] || [];
    this.form.subCategory = ''; // Reset selection
  }

  // Handle local image file upload integration
  uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploading = true;
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ url: string }>('http://localhost:3001/api/upload', formData)
      .subscribe({
        next: (res) => {
          this.form.images.push(res.url);
          this.uploading = false;
        },
        error: () => {
          this.errorMsg = 'Failed to upload image.';
          this.uploading = false;
        }
      });
  }

  removeImage(i: number) {
    this.form.images.splice(i, 1);
  }

  toggleAmenity(am: string) {
    const idx = this.form.amenities.indexOf(am);
    if (idx > -1) this.form.amenities.splice(idx, 1);
    else this.form.amenities.push(am);
  }

  saveRoom() {
    this.successMsg = '';
    this.errorMsg = '';

    if (!this.form.name || !this.form.price || !this.form.city) {
      this.errorMsg = 'Please fill in Name, Price and City.';
      return;
    }
    if (!this.form.type) {
      this.errorMsg = 'Please select a property type.';
      return;
    }
    if (this.subCategories.length > 0 && !this.form.subCategory) {
      this.errorMsg = 'Please select a sub category.';
      return;
    }
    if (!this.currentUser?._id) {
      this.errorMsg = 'You must be logged in to add a property.';
      return;
    }

    this.saving = true;

    const payload = {
      name: this.form.name,
      price: this.form.price,
      location: { city: this.form.city, address: this.form.address },
      description: this.form.description,
      maxGuests: this.form.maxGuests,
      bedrooms: this.form.bedrooms,
      bathrooms: this.form.bathrooms,
      type: this.form.type,
      subCategory: this.form.subCategory,
      amenities: this.form.amenities,
      images: this.form.images.filter(img => img.trim() !== ''),
      owner: this.currentUser._id
    };

    this.roomService.addRoom(payload).subscribe({
      next: (res: any) => {
        this.saving = false;
        this.successMsg = 'Success'; // Activates the overlay graphic
        
        this.resetForm();

        // 3-second display buffer before dynamic router transition to the new details target
        setTimeout(() => {
          this.successMsg = '';
          const newRoomId = res?._id || res?.id;
          if (newRoomId) {
            this.router.navigate(['/room-details', newRoomId]);
          } else {
            this.router.navigate(['/']); // Fallback route
          }
        }, 3000);
      },
      error: (err) => {
        this.saving = false;
        this.errorMsg = err?.error?.message || 'Something went wrong.';
      }
    });
  }

  resetForm() {
    this.form = {
      name: '', price: 0, city: '', address: '',
      description: '', maxGuests: 1, bedrooms: 1,
      bathrooms: 1, type: '', subCategory: '', amenities: [], images: []
    };
    this.subCategories = [];
  }

  amenityIcon(amenity: string): string {
    const map: Record<string, string> = {
      'Pool': 'ti-swimming-pool', 'WiFi': 'ti-wifi',
      'Sea View': 'ti-beach', 'Trampoline': 'ti-bounce-ball',
      'BBQ': 'ti-grill', 'Parking': 'ti-parking',
      'AC': 'ti-air-conditioning', 'Kitchen': 'ti-tools-kitchen-2',
      'Garden': 'ti-trees', 'TV': 'ti-device-tv',
      'Jacuzzi': 'ti-wave-sine', 'Washing Machine': 'ti-wash',
      'Lake View': 'ti-ripple', 'Kids Area': 'ti-baby-carriage',
    };
    return map[amenity] ?? 'ti-circle-check';
  }

  addImageUrl() {
    this.form.images.push('');
  }
}