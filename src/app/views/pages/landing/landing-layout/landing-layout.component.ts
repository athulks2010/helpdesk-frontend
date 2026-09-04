import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-landing-layout',
  templateUrl: './landing-layout.component.html',
  styleUrls: ['./landing-layout.component.scss'],
})
export class LandingLayoutComponent {
  showBackToTop = false;

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.showBackToTop = window.scrollY > 300;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
