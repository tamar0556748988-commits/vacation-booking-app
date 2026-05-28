import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

interface PropertyCategory {
  label: string;
  type: string;
  subtypes: { label: string; subCategory: string }[];
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule],
  standalone: true
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: any = null;
  menuOpen = false;
  activeNavMenu: string | null = null;
  activeMobileMenu: string | null = null;

  private routerSub!: Subscription;

  constructor(private router: Router) {}

  propertyMenus: { [key: string]: PropertyCategory } = {
    villas: {
      label: 'Villas',
      type: 'Villa',
      subtypes: [
        { label: 'Villa with Pool',    subCategory: 'Villa with Pool'    },
        { label: 'Large Family Villa', subCategory: 'Large Family Villa' },
        { label: 'Villa with Garden',  subCategory: 'Villa with Garden'  },
        { label: 'Quiet & Secluded',   subCategory: 'Quiet & Secluded'   },
        { label: 'All Villas',         subCategory: ''                   },
      ]
    },
    zimmers: {
      label: 'Zimmers',
      type: 'Zimmer',
      subtypes: [
        { label: 'Family Zimmer',       subCategory: 'Family Zimmer'       },
        { label: 'Zimmer in Nature',    subCategory: 'Zimmer in Nature'    },
        { label: 'Zimmer with Jacuzzi', subCategory: 'Zimmer with Jacuzzi' },
        { label: 'Zimmer with Pool',    subCategory: 'Zimmer with Pool'    },
        { label: 'All Zimmers',         subCategory: ''                    },
      ]
    },
    apartments: {
      label: 'Apartments',
      type: 'Apartment',
      subtypes: [
        { label: 'Large Family Apartment', subCategory: 'Large Family Apartment' },
        { label: 'Near the Western Wall',  subCategory: 'Near the Western Wall'  },
        { label: 'Near Synagogues',        subCategory: 'Near Synagogues'        },
        { label: 'High Floor Apartment',   subCategory: 'High Floor Apartment'   },
        { label: 'All Apartments',         subCategory: ''                       },
      ]
    }
  };

  get navMenuKeys(): string[] {
    return Object.keys(this.propertyMenus);
  }

  ngOnInit(): void {
    this.loadUser();
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.loadUser());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private loadUser(): void {
    const stored = localStorage.getItem('user');
    if (stored && stored !== 'undefined') {
      try { this.user = JSON.parse(stored); } catch { this.user = null; }
    } else {
      this.user = null;
    }
  }

  toggleNavMenu(key: string, event: Event): void {
    event.stopPropagation();
    this.activeNavMenu = this.activeNavMenu === key ? null : key;
  }

  toggleMobileMenu(key: string): void {
    this.activeMobileMenu = this.activeMobileMenu === key ? null : key;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }

  closeAll(): void {
    this.activeNavMenu = null;
    this.menuOpen = false;
    this.activeMobileMenu = null;
  }

  getSubtypeColor(key: string): string {
    const colors: { [k: string]: string } = {
      villas:     '#1e6fa8',
      zimmers:    '#2d8a5e',
      apartments: '#7c5cbf',
    };
    return colors[key] || '#888';
  }

  selectSubtype(type: string, subCategory: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.closeAll();
    setTimeout(() => {
      this.router.navigate(['/room-category'], { 
        queryParams: { type, subCategory }
      });
    }, 50);
  }
}