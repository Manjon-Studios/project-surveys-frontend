import { Routes } from '@angular/router';
import { SurveyEditComponent } from './pages/auth/survey-edit/survey-edit.component';
import { SurveyComponent } from './pages/auth/survey/survey.component';
import { ViewSurveyComponent } from './pages/survey/survey.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ManagementPermissionsRolesComponent } from './pages/auth/management-permissions-roles/management-permissions-roles.component';
import { ManagementComponent } from './pages/auth/management/management.component';
import {HomeComponent} from "./pages/home/home.component";

// @ts-ignore
export const routes: Routes = [
  { path: '/', component: HomeComponent },
  { path: 'survey/view/:id', component: ViewSurveyComponent },
  { path: 'survey/all', component: SurveyComponent },
  { path: 'survey/edit/:id', component: SurveyEditComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/management', component: ManagementComponent },
  { path: 'auth/management-permissions-roles', component: ManagementPermissionsRolesComponent },
];
