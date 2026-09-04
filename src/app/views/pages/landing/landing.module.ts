import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingRoutingModule } from './landing-routing.module';

import { LandingLayoutComponent } from './landing-layout/landing-layout.component';
import { LandingTopNavComponent } from './components/landing-topnav/landing-topnav.component';
import { LandingFooterComponent } from './components/landing-footer/landing-footer.component';

import { LandingHomeComponent } from './home/landing-home.component';
import { LandingOpenTicketComponent } from './open-ticket/landing-open-ticket.component';
import { LandingServicesComponent } from './services/landing-services.component';
import { LandingKbComponent } from './knowledge-base/landing-kb.component';
import { LandingFaqComponent } from './faq/landing-faq.component';
import { LandingContactComponent } from './contact/landing-contact.component';
import { LandingTermsComponent } from './terms/landing-terms.component';
import { LandingPrivacyComponent } from './privacy/landing-privacy.component';
import { LandingBlogComponent } from './blog/landing-blog.component';

@NgModule({
  declarations: [
    LandingLayoutComponent,
    LandingTopNavComponent,
    LandingFooterComponent,
    LandingHomeComponent,
    LandingOpenTicketComponent,
    LandingServicesComponent,
    LandingKbComponent,
    LandingFaqComponent,
    LandingContactComponent,
    LandingTermsComponent,
    LandingPrivacyComponent,
    LandingBlogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    LandingRoutingModule,
  ],
  exports: [
    LandingLayoutComponent,
  ],
})
export class LandingModule {}
