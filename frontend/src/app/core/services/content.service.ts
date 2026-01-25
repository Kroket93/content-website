import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';

export interface Content {
  id: string;
  title: string;
  body: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  author?: string;
  tags?: string[] | null;
  publishedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  tenantId: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ContentListResponse {
  items: Content[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ContentQueryParams {
  page?: number;
  pageSize?: number;
  status?: 'draft' | 'published' | 'archived';
  tag?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private readonly apiUrl = `${environment.apiUrl}/content`;

  constructor(
    private http: HttpClient,
    private tenantService: TenantService
  ) {}

  private getHeaders(): HttpHeaders {
    const tenant = this.tenantService.getCurrentTenant();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (tenant) {
      headers = headers.set('X-Tenant-ID', tenant.id);
    }

    return headers;
  }

  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Server returned code ${error.status}`;
    }

    console.error('ContentService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get a list of content items for the current tenant with pagination
   */
  getContent(params?: ContentQueryParams): Observable<Content[]> {
    let httpParams = new HttpParams();

    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params?.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params?.tag) {
      httpParams = httpParams.set('tag', params.tag);
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<Content[]>(this.apiUrl, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(items => items.map(item => ({
        ...item,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
      }))),
      catchError(this.handleError)
    );
  }

  /**
   * Get a paginated list of content items for the current tenant
   */
  getContentList(params?: ContentQueryParams): Observable<ContentListResponse> {
    return this.getContent(params).pipe(
      map(items => {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const filteredItems = params?.status
          ? items.filter(item => item.status === params.status)
          : items;

        const startIndex = (page - 1) * pageSize;
        const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

        return {
          items: paginatedItems,
          total: filteredItems.length,
          page,
          pageSize
        };
      })
    );
  }

  /**
   * Get a single content item by its ID
   */
  getContentById(id: string): Observable<Content> {
    return this.http.get<Content>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      map(item => ({
        ...item,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Create a new content item
   */
  createContent(content: Partial<Content>): Observable<Content> {
    return this.http.post<Content>(this.apiUrl, content, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update an existing content item
   */
  updateContent(id: string, content: Partial<Content>): Observable<Content> {
    return this.http.put<Content>(`${this.apiUrl}/${id}`, content, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete a content item
   */
  deleteContent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}
