import { Component, OnInit } from '@angular/core';
import { LandingService, BlogPost } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-blog',
  templateUrl: './landing-blog.component.html',
  styleUrls: ['./landing-blog.component.scss'],
})
export class LandingBlogComponent implements OnInit {
  posts: BlogPost[] = [];
  selectedPost: BlogPost | null = null;

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getBlogPosts().subscribe((list: any) => {
      this.posts = Array.isArray(list) ? list : (list?.data || []);
    });
  }

  viewPost(post: BlogPost): void {
    this.selectedPost = post;
  }

  closeModal(): void {
    this.selectedPost = null;
  }
}
