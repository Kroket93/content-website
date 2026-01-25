import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ContentService, Content } from '../../core';
import { LoadingSpinnerComponent } from '../../shared';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  posts: Content[] = [];
  isLoading = true;

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts(): void {
    this.isLoading = true;
    this.contentService.getContentList({ status: 'published' }).subscribe({
      next: (response) => {
        this.posts = response.items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.isLoading = false;
      }
    });
  }
}
