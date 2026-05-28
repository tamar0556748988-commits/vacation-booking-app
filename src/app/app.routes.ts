import { Routes } from '@angular/router';
import { AddUser } from './add-user/add-user';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RoomListComponent } from './room-list/room-list.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { RoomCategoryComponent } from './room-category/room-category.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { About } from './about/about';
import { HelpCenter } from './help-center/help-center';
import { Safety } from './safety/safety';
import { AddRoomComponent } from './add-room/add-room.component';
import { BookingFormComponent } from './booking-form/booking-form.component';
export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'add-user', component: AddUser },
    { path: 'login', component: LoginComponent },
    { path: 'room-list', component: RoomListComponent },
    { path: 'room-category', component: RoomCategoryComponent },  // ← ללא :id
    { path: 'room-details/:id', component: RoomDetailsComponent },
    { path: 'profile', component: UserProfileComponent },
    { path: 'about', component: About },
    { path: 'help', component: HelpCenter },
    { path: 'safety', component: Safety },
    { path: 'add-room', component: AddRoomComponent },
    { path: 'register', component: AddUser },  
    { path: 'booking/:id', component: BookingFormComponent },
    { path: '**', redirectTo: 'home' },
   
];
