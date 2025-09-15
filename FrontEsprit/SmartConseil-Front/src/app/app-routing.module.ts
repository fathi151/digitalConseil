import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { MotpasseComponent } from './motpasse/motpasse.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RectificationComponent } from './rectification/rectification.component';
import { DashboardEnseignantComponent } from './dashboard-enseignant/dashboard-enseignant.component';
import { DashboardChefComponent } from './dashboard-chef/dashboard-chef.component';
import { AdminSetupComponent } from './admin-setup/admin-setup.component';
import { GradeCorrectionComponent } from './grade-correction/grade-correction.component';
import { RectificationManagementComponent } from './rectification-management/rectification-management.component';
import { ReportManagementComponent } from './report-management/report-management.component';
import { DashboardRapporteurComponent } from './dashboard-rapporteur/dashboard-rapporteur.component';
import { TestBackendComponent } from './test-backend/test-backend.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { ConseilComponent } from './PlanificationConseil/conseil/conseil.component';
import { SalleComponent } from './PlanificationConseil/salle/salle.component';
import { AjoutConsComponent } from './PlanificationConseil/ajout-cons/ajout-cons.component';
import { ModifierConsComponent } from './PlanificationConseil/modifier-cons/modifier-cons.component';
import { ListSalleComponent } from './PlanificationConseil/list-salle/list-salle.component';
import { CouncilManagementComponent } from './CouncilManagement/council-management.component';
import { EnseignantConseilComponent } from './PlanificationConseil/enseignant-conseil/enseignant-conseil.component';
import { PresidentCoseilComponent } from './PlanificationConseil/president-coseil/president-coseil.component';
import { SessionConseilComponent } from './PlanificationConseil/session-conseil/session-conseil.component';
import { GestionOptionsComponent } from './PlanificationConseil/gestion-options/gestion-options.component';
import { RappoteurConseilsComponent } from './rappoteur-conseils/rappoteur-conseils.component';

const routes: Routes = [
  // Public routes
  { path: 'utilisateur', component: UtilisateurComponent },
  { path: 'motpasseoublie', component: MotpasseComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'admin-setup', component: AdminSetupComponent },
  { path: 'test-backend', component: TestBackendComponent },
    { path: 'rapporteurConseil', component: RappoteurConseilsComponent },

  // Protected routes with role-based access
  {
    path: 'dashboard-enseignant',
    component: DashboardEnseignantComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['enseignant'] }
  },
  {
    path: 'dashboard-chef',
    component: DashboardChefComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['chef departement'] }
  },
  {
    path: 'dashboard-rapporteur',
    component: DashboardRapporteurComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['rapporteur'] }
  },
  {
    path: 'dashboard-admin',
    component: DashboardAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['admin'] }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rectification',
    component: RectificationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['enseignant'] }
  },
  {
    path: 'grade-correction',
    component: GradeCorrectionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['enseignant'] }
  },
  {
    path: 'rectification-management',
    component: RectificationManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['chef departement'] }
  },
  {
    path: 'report-management',
    component: ReportManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['rapporteur'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { expectedRoles: ['rapporteur', 'chef departement', 'enseignant', 'admin'] }
  },

  // Default route
  { path: '', redirectTo: 'utilisateur', pathMatch: 'full' },
{path:'dashboard',component:DashboardComponent},

{path:'conseil',component:ConseilComponent},

{path:'salle',component:SalleComponent},
{path:'ajoutConseil',component:AjoutConsComponent},
{path:'modifierConseil/:id',component:ModifierConsComponent},
{path:'ajoutSalle',component:SalleComponent},
{path:'listSalle',component:ListSalleComponent},
{path:'council-management',component:CouncilManagementComponent},
{path:'utilisateur',component:UtilisateurComponent},
{path:'motpasseoublie',component:MotpasseComponent},
{path:'',redirectTo:'utilisateur',pathMatch:'full'} ,
{ path: 'reset-password', component:ResetPasswordComponent },
{
  path: 'president',
  component: PresidentCoseilComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['president'] }
},
{path:'enseignant-conseil',component:EnseignantConseilComponent},
{path:'session-conseil/:id',component:SessionConseilComponent},
{path:'gestion-options',component:GestionOptionsComponent},

  // Wildcard route - redirect to login
  { path: '**', redirectTo: 'utilisateur' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
