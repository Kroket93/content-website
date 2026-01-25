import { Routes } from '@angular/router';
import { BlogListComponent } from './blog.component';
import { BlogPostComponent } from './blog-post/blog-post.component';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    component: BlogListComponent
  },
  {
    path: ':id',
    component: BlogPostComponent
  }
];
