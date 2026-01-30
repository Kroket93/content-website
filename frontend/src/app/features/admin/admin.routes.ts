import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'content',
        loadComponent: () => import('./content-list/content-list.component').then(m => m.ContentListComponent)
      },
      {
        path: 'content/new',
        loadComponent: () => import('./content-editor/content-editor.component').then(m => m.ContentEditorComponent)
      },
      {
        path: 'content/:id/edit',
        loadComponent: () => import('./content-editor/content-editor.component').then(m => m.ContentEditorComponent)
      }
    ]
  }
];
