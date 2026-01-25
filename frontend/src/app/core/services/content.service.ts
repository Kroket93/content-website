import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';

export interface Content {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt?: string;
  author?: string;
  publishedAt?: Date;
  updatedAt?: Date;
  tenantId: string;
  status: 'draft' | 'published' | 'archived';
  metadata?: ContentMetadata;
}

export interface ContentMetadata {
  featuredImage?: string;
  tags?: string[];
  categories?: string[];
  seoTitle?: string;
  seoDescription?: string;
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
  category?: string;
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

  /**
   * Get a list of content items for the current tenant
   */
  getContentList(params?: ContentQueryParams): Observable<ContentListResponse> {
    // TODO: Implement API call
    // return this.http.get<ContentListResponse>(this.apiUrl, { params: params as any });
    console.log('Getting content list with params:', params);
    return of({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10
    });
  }

  /**
   * Get a single content item by its slug
   */
  getContentBySlug(slug: string): Observable<Content | null> {
    // TODO: Implement API call
    // return this.http.get<Content>(`${this.apiUrl}/slug/${slug}`);
    console.log('Getting content by slug:', slug);
    return of(null);
  }

  /**
   * Get a single content item by its ID
   */
  getContentById(id: string): Observable<Content | null> {
    // TODO: Implement API call
    // return this.http.get<Content>(`${this.apiUrl}/${id}`);
    console.log('Getting content by id:', id);
    return of(null);
  }

  /**
   * Create a new content item
   */
  createContent(content: Partial<Content>): Observable<Content> {
    // TODO: Implement API call
    // return this.http.post<Content>(this.apiUrl, content);
    console.log('Creating content:', content);
    return of(content as Content);
  }

  /**
   * Update an existing content item
   */
  updateContent(id: string, content: Partial<Content>): Observable<Content> {
    // TODO: Implement API call
    // return this.http.put<Content>(`${this.apiUrl}/${id}`, content);
    console.log('Updating content:', id, content);
    return of(content as Content);
  }

  /**
   * Delete a content item
   */
  deleteContent(id: string): Observable<void> {
    // TODO: Implement API call
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
    console.log('Deleting content:', id);
    return of(undefined);
  }
}
