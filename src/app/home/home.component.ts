import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

export interface SearchParams {
  city: string;
  category: string;
  propertyType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

interface CityGroup {
  region: string;
  cities: { name: string; icon: string }[];
}

interface PropertyCategory {
  label: string;
  categoryId: string;
  subtypes: { label: string }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  constructor(public router: Router) {}
  @Output() searchEvent = new EventEmitter<SearchParams>();

  activeNavMenu: string | null = null;
  activeSearchPanel: string | null = null;
  isUserMenuOpen = false;

  selectedCity = '';
  selectedPropertyType = '';
  selectedCategory = '';
  checkIn = '';
  checkOut = '';
  adults = 0;
  children = 0;
  rooms = 1;

  cityGroups: CityGroup[] = [
    {
      region: 'Jerusalem Area',
      cities: [
        { name: 'Jerusalem', icon: '' },
        { name: 'Har Shmuel', icon: '' },
        { name: 'Beit Shemesh', icon: '' },
      ]
    },
    {
      region: 'North',
      cities: [
        { name: 'Safed', icon: '' },
        { name: 'Meron', icon: '' },
        { name: 'Tiberias', icon: '' },
      ]
    },
    {
      region: 'South',
      cities: [
        { name: 'Eilat', icon: '' },
        { name: 'Dead Sea', icon: '' },
        { name: 'Arad', icon: '' },
      ]
    }
  ];

  propertyMenus: { [key: string]: PropertyCategory } = {
    villas: {
      label: 'Villas',
      categoryId: '69f777cbbe6455c5ddde2c8d',
      subtypes: [
        { label: 'Villa with Pool' },
        { label: 'Large Family Villa' },
        { label: 'Villa with Garden' },
        { label: 'Quiet & Secluded' },
        { label: 'All Villas' },
      ]
    },
    zimmers: {
      label: 'Zimmers',
      categoryId: '69f777cbbe6455c5ddde2c8e',
      subtypes: [
        { label: 'Family Zimmer' },
        { label: 'Zimmer in Nature' },
        { label: 'Zimmer with Jacuzzi' },
        { label: 'Zimmer with Pool' },
        { label: 'All Zimmers' },
      ]
    },
    apartments: {
      label: 'Apartments',
      categoryId: '69f777cbbe6455c5ddde2c8f',
      subtypes: [
        { label: 'Large Family Apartment' },
        { label: 'Near the Western Wall' },
        { label: 'Near Synagogues' },
        { label: 'High Floor Apartment' },
        { label: 'All Apartments' },
      ]
    }
  };

  get navMenuKeys() {
    return Object.keys(this.propertyMenus);
  }

  get guestsLabel(): string {
    const total = this.adults + this.children;
    if (total === 0 && this.rooms === 1) return '';
    const parts: string[] = [];
    if (this.adults > 0) parts.push(`${this.adults} adult${this.adults > 1 ? 's' : ''}`);
    if (this.children > 0) parts.push(`${this.children} child${this.children > 1 ? 'ren' : ''}`);
    parts.push(`${this.rooms} room${this.rooms > 1 ? 's' : ''}`);
    return parts.join(' · ');
  }

  get datesLabel(): string {
    if (!this.checkIn && !this.checkOut) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (this.checkIn && this.checkOut)
      return `${fmt(this.checkIn)} — ${fmt(this.checkOut)}`;
    if (this.checkIn) return `From ${fmt(this.checkIn)}`;
    return '';
  }

  getSubtypeColor(key: string): string {
    const colors: { [k: string]: string } = {
      villas:     '#1e6fa8',
      zimmers:    '#2d8a5e',
      apartments: '#7c5cbf',
    };
    return colors[key] || '#888';
  }

  toggleNavMenu(key: string, event: Event) {
    event.stopPropagation();
    this.activeNavMenu = this.activeNavMenu === key ? null : key;
    this.activeSearchPanel = null;
  }

  toggleUserMenu(event: Event) {
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.activeNavMenu = null;
    this.activeSearchPanel = null;
  }

  onLogin() {
    this.isUserMenuOpen = false;
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onCreateAccount() {
    this.isUserMenuOpen = false;
    this.router.navigate(['/add-user']);
  }

  toggleSearchPanel(key: string, event: Event) {
    event.stopPropagation();
    this.activeSearchPanel = this.activeSearchPanel === key ? null : key;
    this.activeNavMenu = null;
  }

  selectCity(city: string, event: Event) {
    event.stopPropagation();
    this.selectedCity = city;
    this.activeSearchPanel = null;
  }

  selectQuickFilter(subCategory: string, event: Event) {
    event.stopPropagation();
    this.closeAll();
    this.router.navigate(['/room-list'], { 
      queryParams: { subCategory: subCategory } 
    });
  }

  changeCount(type: 'adults' | 'children' | 'rooms', delta: number) {
    if (type === 'adults')   this.adults   = Math.max(0, this.adults + delta);
    if (type === 'children') this.children = Math.max(0, this.children + delta);
    if (type === 'rooms')    this.rooms    = Math.max(1, this.rooms + delta);
  }

  applyGuests(event: Event) {
    event.stopPropagation();
    this.activeSearchPanel = null;
  }

  doSearch() {
    this.router.navigate(['/room-list'], {
      queryParams: {
        city: this.selectedCity,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
      }
    });
  }

  scrollToSearch(event: Event) {
    event.stopPropagation();
    const el = document.getElementById('main-search-bar');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        this.activeSearchPanel = 'city';
      }, 500);
    }
  }

  getUser() {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined') {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  }

  closeAll() {
    this.activeNavMenu = null;
    this.activeSearchPanel = null;
    this.isUserMenuOpen = false;
  }
}