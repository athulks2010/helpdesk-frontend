import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingLayoutComponent } from './landing-layout/landing-layout.component';
import { LandingHomeComponent } from './home/landing-home.component';
import { LandingOpenTicketComponent } from './open-ticket/landing-open-ticket.component';
import { LandingServicesComponent } from './services/landing-services.component';
import { LandingKbComponent } from './knowledge-base/landing-kb.component';
import { LandingFaqComponent } from './faq/landing-faq.component';
import { LandingContactComponent } from './contact/landing-contact.component';
import { LandingTermsComponent } from './terms/landing-terms.component';
import { LandingPrivacyComponent } from './privacy/landing-privacy.component';
import { LandingBlogComponent } from './blog/landing-blog.component';

const routes: Routes = [
  {
    path: '',
    component: LandingLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', component: LandingHomeComponent },
      { path: 'ticket/open', component: LandingOpenTicketComponent },
      { path: 'services', component: LandingServicesComponent },
      { path: 'kb', component: LandingKbComponent },
      { path: 'faq', component: LandingFaqComponent },
      { path: 'contact', component: LandingContactComponent },
      { path: 'terms-of-services', component: LandingTermsComponent },
      { path: 'privacy', component: LandingPrivacyComponent },
      { path: 'blog', component: LandingBlogComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LandingRoutingModule {}
