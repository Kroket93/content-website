import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TenantService, Tenant } from '../../core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  tenant: Tenant | null = null;
  sidebarCollapsed = false;

  private destroy$ = new Subject<void>();

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    this.tenantService.currentTenant$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(tenant => {
      this.tenant = tenant;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
