import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';
import { AuthService } from '../../auth/_services/auth.service';

export interface LandingHeroOverlay {
  enabled: boolean;
  label: string;
  title: string;
  status: string;
  show_check: boolean;
}

export interface LandingTrustStripItem {
  icon: string;
  label: string;
  value: string;
  theme?: string;
}

export interface LandingSupportChannel {
  icon: string;
  title: string;
  description: string;
  link_text: string;
  route: string;
  theme?: string;
}

export interface FaqItem {
  id: number;
  name: string;
  details: string;
  category?: string;
  active?: boolean;
}

export interface KbArticle {
  id: number;
  title: string;
  slug: string;
  details: string;
  excerpt: string;
  category: string;
  views: number;
  helpful: number;
  updated_at: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  image?: string;
  details?: string;
  slug?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  read_time: string;
  image: string;
}

@Injectable({ providedIn: 'root' })
export class LandingService extends ApiBaseService {
  constructor(http: HttpClient, private auth: AuthService) {
    super(http);
  }

  getDefaultHomePageData(): any {
    return {
      title: 'Home',
      html: {
        sections: [
          // Section 0: Hero
          {
            enabled: true,
            badge_text: 'Trusted by support teams in 40+ countries',
            title: 'Resolve customer issues faster with <span class="text-primary-400">HelpDesk</span>',
            details:
              'Modernize your support operations with smart routing, collaborative agent tools, and transparent customer communication from first response to resolution.',
            image: '/landing/images/dashboard-helpdesk.png',
            buttons: [
              { link: '/auth/login', text: 'Access Agent Workspace', new_tab: '0' },
              { link: '/ticket/open', text: 'Open Support Ticket', new_tab: '0' },
            ],
            kb_button: {
              enabled: true,
              text: 'Browse Knowledge Base',
              link: '/kb',
            },
            trust_indicators: [
              'SOC-ready workflows',
              'Omnichannel ticketing',
              'Live SLA visibility',
            ],
            hero_overlays: [
              {
                enabled: true,
                label: 'Live Queue',
                title: '12 tickets active',
                status: 'Healthy',
                show_check: false,
              },
              {
                enabled: true,
                label: 'SLA Compliance',
                title: '99.2% this week',
                status: '',
                show_check: true,
              },
            ],
          },
          // Section 1: Features
          {
            enabled: true,
            tagline: 'Support Workflow',
            title: 'From Intake To Resolution, In One System',
            details:
              'A practical, high-performing support lifecycle designed for growing teams, complex queues, and strict response expectations.',
            features: [
              {
                icon: 'ticket',
                title: 'Capture Every Request Clearly',
                details:
                  'Customers submit tickets with structured forms, attachments, and context so agents can start with complete information instead of back-and-forth clarification.',
              },
              {
                icon: 'settings',
                title: 'Auto-Route To The Right Team',
                details:
                  'Route tickets by department, priority, and category to reduce triage time and keep urgent incidents moving to the right specialists instantly.',
              },
              {
                icon: 'message-square',
                title: 'Collaborate Without Losing Context',
                details:
                  'Agents coordinate updates, internal notes, and customer communication in one timeline so every stakeholder has the same real-time visibility.',
              },
              {
                icon: 'clock',
                title: 'Manage SLA And Response Targets',
                details:
                  'Track response and resolution timelines with queue visibility so teams can prevent breaches before they happen.',
              },
              {
                icon: 'bar-chart',
                title: 'Measure Performance Trends',
                details:
                  'Use operational reporting to monitor ticket volume, team workload, and resolution quality to drive consistent improvement.',
              },
              {
                icon: 'check',
                title: 'Close With Confidence',
                details:
                  'Confirm outcomes, document resolutions, and keep searchable history so repeat issues are solved faster next time.',
              },
            ],
          },
          // Section 2: Ticket Submit Section
          {
            enabled: true,
            enable_ticket_section: true,
            badge_text: 'Get Expert Assistance',
            title: 'Submit Your Support Request',
            subtitle:
              'Share your issue details and our team will route your request to the right specialist for the fastest possible resolution.',
            submit_header: 'Create New Support Ticket',
            submit_subtitle:
              'Include clear context, expected outcome, and attachments to speed up investigation',
            cta_submit_label: 'Send Ticket Request',
            form_badges: ['Secure Submission', 'Ticket Tracking', 'Email Updates'],
          },
          // Section 3: Performance metrics
          {
            enabled: true,
            tagline: 'Operational Metrics',
            title: 'Support Performance At Scale',
            details:
              'A realistic snapshot of how high-performing support teams operate with HelpDesk.',
            stats: [
              { label: 'Tickets Resolved / Month', value: '18,400+', icon: 'check' },
              { label: 'Average First Response', value: '1h 52m', icon: 'clock' },
              { label: 'SLA Compliance', value: '99.2%', icon: 'shield' },
              { label: 'Customer Satisfaction', value: '4.8/5', icon: 'star' },
            ],
          },
          // Section 4: Testimonials / Leaders say
          {
            enabled: true,
            tagline: 'Customer Stories',
            title: 'What Support Leaders Say',
            details:
              'Real outcomes from teams that improved service quality, speed, and collaboration.',
            testimonials: [
              {
                name: 'Nadia Rahman',
                company: 'Head of Support, Vertex Commerce',
                content:
                  'We reduced first-response time by over 35% in the first quarter. Queue visibility and routing rules alone made a measurable impact.',
                rating: 5,
              },
              {
                name: 'Daniel Kim',
                company: 'Customer Operations Manager, CloudSphere',
                content:
                  'Our agents now work from one timeline instead of scattered tools. Collaboration is faster and customers receive more consistent updates.',
                rating: 5,
              },
              {
                name: 'Farhana Ahmed',
                company: 'Service Delivery Lead, Nexa Health',
                content:
                  'The reporting helped us identify repeat issue categories and proactively improve our documentation. Ticket quality has improved significantly.',
                rating: 5,
              },
            ],
          },
          // Section 5: Trust Strip
          {
            enabled: true,
            items: [
              {
                icon: 'clock',
                label: 'Average First Response',
                value: '< 2 Hours',
                theme: 'primary',
              },
              {
                icon: 'shield',
                label: 'Reliability',
                value: 'Secure & Auditable',
                theme: 'emerald',
              },
              {
                icon: 'zap',
                label: 'Automation Ready',
                value: 'Smart Ticket Routing',
                theme: 'blue',
              },
              {
                icon: 'users',
                label: 'Built For Teams',
                value: 'Agent + Customer Portal',
                theme: 'purple',
              },
            ],
          },
          // Section 6: Support Channels
          {
            enabled: true,
            title: 'Choose Your Support Channel',
            subtitle:
              'Give your customers multiple ways to reach your team and resolve issues quickly.',
            channels: [
              {
                icon: 'ticket',
                title: 'Open A Ticket',
                description:
                  'Structured issue reporting with status tracking, attachments, and notifications.',
                link_text: 'Start secure submission',
                route: '/ticket/open',
                theme: 'primary',
              },
              {
                icon: 'mail',
                title: 'Contact Team',
                description:
                  'For sales, onboarding, or support questions that need guided consultation.',
                link_text: 'Connect with experts',
                route: '/contact',
                theme: 'blue',
              },
              {
                icon: 'help-circle',
                title: 'Self-Service FAQ',
                description:
                  'Enable users to solve common issues instantly with curated help content.',
                link_text: 'Resolve faster with docs',
                route: '/faq',
                theme: 'purple',
              },
            ],
          },
        ],
      },
    };
  }

  parseHomePageData(data: any): any {
    const defaults = this.getDefaultHomePageData();
    if (!data) return defaults.html;

    const item = data?.data ?? data?.item ?? data;
    let parsed: any = null;
    const raw = item?.content ?? item?.html ?? item;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed = raw.html && typeof raw.html === 'object' && raw.html.sections ? raw.html : raw;
    }

    if (!parsed || !parsed.sections) {
      return defaults.html;
    }

    const defaultSections = defaults.html.sections;
    const incomingSections = parsed.sections;
    const mergedSections = defaultSections.map((defSec: any, index: number) => {
      const incoming = incomingSections[index] || incomingSections[String(index)];
      if (!incoming) return defSec;
      return {
        ...defSec,
        ...incoming,
        features: incoming.features && Object.keys(incoming.features).length ? incoming.features : defSec.features,
        stats: incoming.stats && Object.keys(incoming.stats).length ? incoming.stats : defSec.stats,
        testimonials: incoming.testimonials && Object.keys(incoming.testimonials).length ? incoming.testimonials : defSec.testimonials,
        items: incoming.items && Object.keys(incoming.items).length ? incoming.items : defSec.items,
        channels: incoming.channels && Object.keys(incoming.channels).length ? incoming.channels : defSec.channels,
        hero_overlays: incoming.hero_overlays && Object.keys(incoming.hero_overlays).length ? incoming.hero_overlays : defSec.hero_overlays,
        trust_indicators: incoming.trust_indicators && Object.keys(incoming.trust_indicators).length ? incoming.trust_indicators : defSec.trust_indicators,
        buttons: incoming.buttons && Object.keys(incoming.buttons).length ? incoming.buttons : defSec.buttons,
        kb_button: incoming.kb_button ? { ...defSec.kb_button, ...incoming.kb_button } : defSec.kb_button,
      };
    });

    return { sections: mergedSections };
  }

  getHomePageData(): Observable<any> {
    const defaultData = this.getDefaultHomePageData();
    return this.getSingle(apiUrl.publicFrontPage, { slug: 'home' }).pipe(
      map((res: any) => this.parseHomePageData(res?.data ?? res?.item ?? res)),
      catchError(() => of(defaultData.html))
    );
  }

  getDefaultContactPageHtml(): any {
    return {
      content_text: 'Connect With Our Support Team',
      content_details:
        'Need help with onboarding, ticket workflows, or account issues? Reach out and our team will connect you with the right specialist.',
      email: 'support@yourhelpdesk.com',
      phone: '+1 (415) 555-0198',
      location: '8013 Alderwood St, South San Francisco, CA 94080',
      location_map: '',
      email_details:
        'Use email for product questions, integration requests, and account-related support.',
      phone_details:
        'Call for urgent operational issues that require immediate triage.',
      contact_recipient: 'support@yourhelpdesk.com',
      badge: 'Contact Support Team',
      primary_button_text: 'Send a Message',
      primary_button_link: '#contact-info',
      secondary_button_text: 'Browse FAQ',
      secondary_button_link: '/faq',
      trust_one: 'SLA-aware response',
      trust_two: 'Specialist routing',
      trust_three: 'Secure communication',
      trust_four: '24h first response',
      section_badge: 'Get In Touch',
      section_title: 'We Are Here To Help',
      section_subtitle:
        'Have a question about technical configuration, account management, or ticket escalations? Use the contact methods below or send us a message directly.',
      location_label: 'Our Location',
      phone_label: 'Phone Number',
      email_label: 'Email Address',
      form_title: 'Send Us A Message',
      form_subtitle: 'Share your request and we will respond with the right next step',
      form_submit_text: 'Send Message',
    };
  }

  parseContactPageHtml(data: any): any {
    const defaults = this.getDefaultContactPageHtml();
    if (!data) return this.cloneJson(defaults);

    let parsed: any = null;
    const raw = data.content ?? data.html ?? data;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed = raw.html && typeof raw.html === 'object' && raw.html.content_text !== undefined
        ? raw.html
        : raw;
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.cloneJson(defaults);
    }

    return { ...defaults, ...parsed };
  }

  getContactPageData(): Observable<any> {
    const defaultData = {
      title: 'Contact',
      html: this.getDefaultContactPageHtml(),
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'contact' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        return {
          title: item?.title || defaultData.title,
          html: this.parseContactPageHtml(item || defaultData),
        };
      }),
      catchError(() => of(defaultData))
    );
  }

  getDefaultServicesPageHtml(): any {
    return {
      hero: {
        badge: 'HelpDesk Professional Services',
        title: 'Services Built For High-Performing Support Teams',
        subtitle:
          'From implementation to optimization, we help you launch, scale, and continuously improve your support operations with measurable outcomes.',
        primary_button_text: 'Explore Service Plans',
        primary_button_link: '#services',
        secondary_button_text: 'Book Consultation',
        secondary_button_link: '/contact',
        trust_one: 'Certified specialists',
        trust_two: 'SLA-first delivery',
        trust_three: 'Outcome-driven execution',
      },
      services_section: {
        badge: 'Service Portfolio',
        title: 'What We Deliver',
        subtitle:
          'Practical services designed to reduce response time, improve customer satisfaction, and increase team productivity.',
        learn_more_text: 'View Service Scope',
      },
      cta: {
        title: 'Ready To Improve Support Quality And Speed?',
        subtitle:
          'Let us assess your current workflow and propose a service plan tailored to your support goals.',
        primary_button_text: 'Talk To A Specialist',
        primary_button_link: '/contact',
        secondary_button_text: 'Open A Ticket',
        secondary_button_link: '/ticket/open',
      },
    };
  }

  parseServicesPageHtml(data: any): any {
    const defaults = this.getDefaultServicesPageHtml();
    if (!data) return this.cloneJson(defaults);

    let parsed: any = null;
    const raw = data.content ?? data.html ?? data;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed = raw.html && typeof raw.html === 'object' && !raw.hero ? raw.html : raw;
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.cloneJson(defaults);
    }

    return {
      hero: { ...defaults.hero, ...(parsed.hero || {}) },
      services_section: {
        ...defaults.services_section,
        ...(parsed.services_section || {}),
      },
      cta: { ...defaults.cta, ...(parsed.cta || {}) },
      services: this.normalizeServicesList(parsed.services || parsed.items || []),
    };
  }

  getServicesPageData(): Observable<any> {
    const defaultData = {
      title: 'Services',
      html: this.getDefaultServicesPageHtml(),
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'services' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        return {
          title: item?.title || defaultData.title,
          html: this.parseServicesPageHtml(item || defaultData),
        };
      }),
      catchError(() => of(defaultData))
    );
  }

  getDefaultTermsPageHtml(): any {
    return {
      title: 'Terms of Services',
      content: `
          <h2 class="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            By accessing or using the HelpDesk platform, services, and associated websites, you agree to be bound by these Terms of Services and our Privacy Policy. If you do not agree with any part of these terms, you may not access or use our services.
          </p>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">2. Account Registration and Responsibilities</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            To access certain features, you must register for an account. You agree to provide accurate, current, and complete information and maintain the security of your credentials. You are responsible for all activities that occur under your account.
          </p>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">3. Use of Services and Conduct</h2>
          <p class="text-slate-600 mb-4 leading-relaxed">
            You agree to use HelpDesk only for lawful purposes in accordance with these Terms. You agree not to:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-slate-600 mb-6">
            <li>Violate any applicable national or international law or regulation.</li>
            <li>Submit tickets containing malicious software, code, or unsolicited communications.</li>
            <li>Attempt to gain unauthorized access to any part of the system or connected networks.</li>
            <li>Interfere with or disrupt the security or integrity of the service.</li>
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">4. Intellectual Property Rights</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            All rights, title, and interest in and to the HelpDesk service, documentation, brand assets, and platform infrastructure belong exclusively to HelpDesk and its licensors.
          </p>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">5. Termination</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            We may suspend or terminate your access immediately, without prior notice or liability, for any reason, including breach of these Terms.
          </p>
        `,
    };
  }

  private extractHtmlContent(raw: any, defaultHtml: { title: string; content: string }): { title: string; content: string } {
    if (!raw) return this.cloneJson(defaultHtml);

    let parsed: any = raw;
    while (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        break;
      }
    }

    if (parsed && typeof parsed === 'object') {
      if (parsed.html) {
        let nestedHtml = parsed.html;
        while (typeof nestedHtml === 'string') {
          try {
            nestedHtml = JSON.parse(nestedHtml);
          } catch {
            break;
          }
        }
        if (nestedHtml && typeof nestedHtml === 'object') {
          return {
            title: nestedHtml.title || parsed.title || defaultHtml.title,
            content: nestedHtml.content || defaultHtml.content,
          };
        }
      }

      if (parsed.content) {
        let nestedContent = parsed.content;
        while (typeof nestedContent === 'string') {
          try {
            const temp = JSON.parse(nestedContent);
            if (temp && typeof temp === 'object' && (temp.content || temp.title)) {
              nestedContent = temp.content || nestedContent;
              if (temp.title && !parsed.title) parsed.title = temp.title;
            } else {
              break;
            }
          } catch {
            break;
          }
        }
        return {
          title: parsed.title || defaultHtml.title,
          content: nestedContent || defaultHtml.content,
        };
      }

      if (parsed.title) {
        return {
          title: parsed.title,
          content: parsed.content || defaultHtml.content,
        };
      }
    }

    if (typeof parsed === 'string') {
      return {
        title: defaultHtml.title,
        content: parsed,
      };
    }

    return this.cloneJson(defaultHtml);
  }

  parseTermsPageHtml(data: any): any {
    const defaults = this.getDefaultTermsPageHtml();
    if (!data) return this.cloneJson(defaults);
    const raw = data.html ?? data.content ?? data;
    return this.extractHtmlContent(raw, defaults);
  }

  getTermsData(): Observable<any> {
    return this.getSingle(apiUrl.publicFrontPage, { slug: 'terms' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        const html = this.parseTermsPageHtml(item);
        return {
          title: html?.title || item?.title || 'Terms of Services',
          updated_at: item?.updated_at || '',
          html,
        };
      }),
      catchError(() => of({ title: 'Terms of Services', updated_at: '', html: { title: 'Terms of Services', content: '' } }))
    );
  }

  getDefaultPrivacyPageHtml(): any {
    return {
      title: 'Privacy Policy',
      content: `
          <h2 class="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
          <p class="text-slate-600 mb-4 leading-relaxed">
            We collect information you provide directly to us when submitting tickets, creating accounts, or communicating with our support team:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-slate-600 mb-6">
            <li><strong>Contact Details:</strong> First name, last name, email address, phone number, and organization name.</li>
            <li><strong>Ticket Content:</strong> Subject lines, issue descriptions, system metadata, and file attachments.</li>
            <li><strong>Usage Information:</strong> IP addresses, browser types, interaction logs, and timestamp data.</li>
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">2. How We Use Your Information</h2>
          <p class="text-slate-600 mb-4 leading-relaxed">
            We use the information collected to provide, maintain, and optimize our helpdesk services, including:
          </p>
          <ul class="list-disc pl-6 space-y-2 text-slate-600 mb-6">
            <li>Triage, assignment, and resolution of customer support tickets.</li>
            <li>Sending status notifications, SLA updates, and account security notices.</li>
            <li>Detecting, preventing, and addressing technical incidents and fraud.</li>
            <li>Analyzing support volume to improve system performance and documentation.</li>
          </ul>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">3. Data Security and Confidentiality</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            We implement administrative, technical, and physical safeguards designed to protect personal and ticket data against unauthorized access, loss, or alteration. All communication channels employ industry-standard encryption protocols.
          </p>

          <h2 class="text-2xl font-bold text-slate-900 mb-4">4. Your Rights and Data Control</h2>
          <p class="text-slate-600 mb-6 leading-relaxed">
            You may request access to, correction of, or deletion of your personal data stored within our helpdesk platform by submitting a ticket or contacting our data protection representative.
          </p>
        `,
    };
  }

  parsePrivacyPageHtml(data: any): any {
    const defaults = this.getDefaultPrivacyPageHtml();
    if (!data) return this.cloneJson(defaults);
    const raw = data.html ?? data.content ?? data;
    return this.extractHtmlContent(raw, defaults);
  }

  getPrivacyData(): Observable<any> {
    return this.getSingle(apiUrl.publicFrontPage, { slug: 'privacy' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        const html = this.parsePrivacyPageHtml(item);
        return {
          title: html?.title || item?.title || 'Privacy Policy',
          updated_at: item?.updated_at || '',
          html,
        };
      }),
      catchError(() => of({ title: 'Privacy Policy', updated_at: '', html: { title: 'Privacy Policy', content: '' } }))
    );
  }

  getDefaultFooterPageHtml(): any {
    return {
      text: 'Start working with HelpDesk and streamline customer support.',
      copyright: "@ Helpdesk Developed by <a href='https://w3bd.com/'>W3bd</a>.",
    };
  }

  parseFooterPageHtml(data: any): any {
    const defaults = this.getDefaultFooterPageHtml();
    if (!data) return this.cloneJson(defaults);

    let parsed: any = null;
    const raw = data.content ?? data.html ?? data;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed =
        raw.html && typeof raw.html === 'object' && (raw.html.text !== undefined || raw.html.copyright !== undefined)
          ? raw.html
          : raw;
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.cloneJson(defaults);
    }

    return {
      text: parsed.text ?? defaults.text,
      copyright: parsed.copyright ?? defaults.copyright,
    };
  }

  getFooterData(): Observable<any> {
    const defaults = this.getDefaultFooterPageHtml();
    return this.getSingle(apiUrl.publicFrontPage, { slug: 'footer' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        return this.parseFooterPageHtml(item || defaults);
      }),
      catchError(() => of(defaults))
    );
  }

  getDefaultFaqPageHtml(): any {
    return {
      hero: {
        badge: 'Help Center FAQ',
        title: 'Frequently Asked Questions',
        subtitle:
          'Find clear answers to common support, billing, security, and workflow questions.',
        search_placeholder: 'Search by topic, issue, or keyword...',
        trust_one: 'Operations-focused answers',
        trust_two: 'Policy-aligned guidance',
        trust_three: 'Support-team reviewed',
      },
      faq_section: {
        badge: 'FAQ Section',
        title: 'Most Asked Questions',
        subtitle:
          'Review concise answers used by support teams to resolve recurring customer issues faster.',
      },
      cta: {
        title: 'Still have questions?',
        subtitle: "Can't find the answer you are looking for? Reach out directly.",
        primary_button_text: 'Contact Team',
        primary_button_link: '/contact',
        secondary_button_text: 'Submit Ticket',
        secondary_button_link: '/ticket/open',
      },
    };
  }

  parseFaqPageHtml(data: any): any {
    const defaults = this.getDefaultFaqPageHtml();
    if (!data) return this.cloneJson(defaults);

    let parsed: any = null;
    const raw = data.content ?? data.html ?? data;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed = raw.html && typeof raw.html === 'object' && !raw.hero ? raw.html : raw;
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.cloneJson(defaults);
    }

    return {
      hero: { ...defaults.hero, ...(parsed.hero || {}) },
      faq_section: { ...defaults.faq_section, ...(parsed.faq_section || {}) },
      cta: { ...defaults.cta, ...(parsed.cta || {}) },
    };
  }

  getFaqPageData(): Observable<any> {
    const defaultData = {
      title: 'FAQ',
      html: this.getDefaultFaqPageHtml(),
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'faq' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        return {
          title: item?.title || defaultData.title,
          html: this.parseFaqPageHtml(item || defaultData),
        };
      }),
      catchError(() => of(defaultData))
    );
  }

  getFaqs(): Observable<FaqItem[]> {
    return this.getCollection(apiUrl.publicFaqs, {
      pageNumber: 1,
      pageSize: 15,
    }).pipe(
      map((res: any) => this.normalizeFaqList(res)),
      catchError(() => of([]))
    );
  }

  normalizeFaqList(list: any): FaqItem[] {
    const raw: any[] = Array.isArray(list)
      ? list
      : Array.isArray(list?.items)
        ? list.items
        : Array.isArray(list?.data)
          ? list.data
          : [];

    return raw
      .filter((item: any) => {
        if (!item) return false;
        if (item.is_active === 0 || item.is_active === false || item.is_active === '0') return false;
        if (item.status === 0 || item.status === false || item.status === '0' || item.status === 'draft') {
          return false;
        }
        return true;
      })
      .map((item: any) => this.mapFaqItem(item));
  }

  mapFaqItem(item: any): FaqItem {
    return {
      id: item?.id ?? item?._id ?? 0,
      name: item?.name || item?.question || item?.title || '',
      details: item?.details || item?.answer || item?.content || '',
      category:
        item?.category ||
        item?.type?.name ||
        item?.type_name ||
        (typeof item?.type === 'string' ? item.type : '') ||
        '',
    };
  }

  getServicesList(): Observable<ServiceItem[]> {
    return this.getCollection(apiUrl.publicServices, {
      pageNumber: 1,
      pageSize: 15,
    }).pipe(
      map((res: any) => this.normalizeServicesList(res)),
      catchError(() => of([]))
    );
  }

  normalizeServicesList(list: any): ServiceItem[] {
    const raw: any[] = Array.isArray(list)
      ? list
      : Array.isArray(list?.items)
        ? list.items
        : Array.isArray(list?.data)
          ? list.data
          : [];

    return raw
      .filter((item: any) => {
        if (!item) return false;
        if (item.is_active === 0 || item.is_active === false || item.is_active === '0') return false;
        if (item.status === 0 || item.status === false || item.status === '0' || item.status === 'draft') {
          return false;
        }
        return true;
      })
      .map((item: any) => this.mapServiceItem(item));
  }

  mapServiceItem(item: any): ServiceItem {
    const details = item?.details || item?.description || item?.content || '';
    const features = Array.isArray(item?.features)
      ? item.features
        .map((feat: any) => (typeof feat === 'string' ? feat : feat?.title || feat?.name || ''))
        .filter(Boolean)
      : typeof item?.features === 'string'
        ? item.features.split(',').map((feat: string) => feat.trim()).filter(Boolean)
        : [];

    return {
      id: item?.id ?? item?._id ?? 0,
      title: item?.title || item?.name || '',
      description: item?.description || this.stripHtml(details),
      icon: item?.icon || '',
      features,
      image: item?.image || item?.feature_image || item?.featured_image || '',
      details,
      slug: item?.slug,
    };
  }

  stripHtml(value: string): string {
    return String(value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getDefaultKbPageHtml(): any {
    return {
      hero: {
        badge: 'Help Center',
        title: 'Support Knowledge Base',
        subtitle:
          'Search practical guides, troubleshooting playbooks, and setup documentation to resolve issues faster.',
        search_placeholder: 'Search by issue, workflow, or keyword...',
        trust_one: 'Agent-tested guides',
        trust_two: 'Step-by-step fixes',
        trust_three: 'Instant answers',
      },
    };
  }

  parseKbPageHtml(data: any): any {
    const defaults = this.getDefaultKbPageHtml();
    if (!data) return this.cloneJson(defaults);

    let parsed: any = null;
    const raw = data.content ?? data.html ?? data;
    if (typeof raw === 'string') {
      try {
        let once = JSON.parse(raw);
        if (typeof once === 'string') {
          once = JSON.parse(once);
        }
        parsed = once;
      } catch {
        parsed = null;
      }
    } else if (raw && typeof raw === 'object') {
      parsed = raw.html && typeof raw.html === 'object' && !raw.hero ? raw.html : raw;
    }

    if (!parsed || typeof parsed !== 'object') {
      return this.cloneJson(defaults);
    }

    return {
      hero: { ...defaults.hero, ...(parsed.hero || {}) },
    };
  }

  getKbPageData(): Observable<any> {
    const defaultData = {
      title: 'Knowledge Base',
      html: this.getDefaultKbPageHtml(),
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'kb' }).pipe(
      map((res: any) => {
        const item = res?.data ?? res?.item ?? res;
        return {
          title: item?.title || defaultData.title,
          html: this.parseKbPageHtml(item || defaultData),
        };
      }),
      catchError(() => of(defaultData))
    );
  }

  getKnowledgeBaseList(): Observable<KbArticle[]> {
    return this.getCollection(apiUrl.publicKnowledgeBase, {
      pageNumber: 1,
      pageSize: 15,
    }).pipe(
      map((res: any) => this.normalizeKbList(res)),
      catchError(() => of([]))
    );
  }

  normalizeKbList(list: any): KbArticle[] {
    const raw: any[] = Array.isArray(list)
      ? list
      : Array.isArray(list?.items)
        ? list.items
        : Array.isArray(list?.data)
          ? list.data
          : [];

    return raw
      .filter((item: any) => {
        if (!item) return false;
        if (item.is_active === 0 || item.is_active === false || item.is_active === '0') return false;
        if (item.status === 0 || item.status === false || item.status === '0' || item.status === 'draft') {
          return false;
        }
        return true;
      })
      .map((item: any) => this.mapKbArticle(item));
  }

  mapKbArticle(item: any): KbArticle {
    const details = item?.details || item?.content || item?.description || '';
    const updated = item?.updated_at || item?.updatedAt || item?.created_at || '';
    return {
      id: item?.id ?? item?._id ?? 0,
      title: item?.title || item?.name || '',
      slug: item?.slug || '',
      details,
      excerpt: this.stripHtml(details),
      category:
        item?.category ||
        item?.type?.name ||
        item?.type_name ||
        (typeof item?.type === 'string' ? item.type : '') ||
        '',
      views: Number(item?.views ?? item?.view_count ?? 0) || 0,
      helpful: Number(item?.helpful ?? item?.helpful_percent ?? 0) || 0,
      updated_at: this.formatKbDate(updated),
    };
  }

  private formatKbDate(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString();
  }

  getBlogPosts(): Observable<BlogPost[]> {
    const posts: BlogPost[] = [
      {
        id: 1,
        title: '5 Ways Modern Support Teams Reduce First-Response Time by 40%',
        excerpt:
          'Operational best practices to optimize ticket intake, automate triage routing, and eliminate repetitive resolution bottlenecks.',
        content:
          'Speed matters, but clarity matters more. Discover how leading support organizations combine intelligent triage rules with pre-configured ticket categories to dramatically cut queue wait times without sacrificing quality.',
        author: 'Sarah Jenkins',
        date: 'February 24, 2026',
        category: 'Operations',
        read_time: '5 min read',
        image: '/landing/images/blog/bg.jpg',
      },
      {
        id: 2,
        title: 'Designing SLA Policies That Prevent Customer Churn',
        excerpt:
          'How to establish measurable, realistic SLA targets that align customer expectations with engineering and support capacity.',
        content:
          'A reliable SLA policy is more than a metric—it is a promise. Learn the framework for establishing tiered response thresholds that keep stakeholders aligned.',
        author: 'Michael Torres',
        date: 'February 18, 2026',
        category: 'Best Practices',
        read_time: '7 min read',
        image: '/landing/images/blog/bg.jpg',
      },
      {
        id: 3,
        title: 'The Shift Toward Self-Service: Building Knowledge Bases That Work',
        excerpt:
          'Why traditional FAQ pages fail and how structured troubleshooting guides empower users to resolve issues independently.',
        content:
          'When customers solve issues on their own, both customer satisfaction and agent morale increase. Explore key principles for maintaining evergreen support documentation.',
        author: 'Elena Rostova',
        date: 'February 10, 2026',
        category: 'Customer Experience',
        read_time: '6 min read',
        image: '/landing/images/blog/bg.jpg',
      },
    ];
    return of(posts);
  }

  private extractArray(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (typeof res === 'object') {
      const vals = Object.values(res);
      if (vals.length && typeof vals[0] === 'object') return vals;
    }
    return [];
  }

  getDepartments(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}${apiUrl.publicDepartments}`).pipe(
      map((res: any) => this.extractArray(res)),
      catchError(() => of([]))
    );
  }

  getPriorities(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}${apiUrl.publicPriorities}`).pipe(
      map((res: any) => this.extractArray(res)),
      catchError(() => of([]))
    );
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}${apiUrl.publicCategories}`).pipe(
      map((res: any) => this.extractArray(res)),
      catchError(() => of([]))
    );
  }

  getTypes(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}${apiUrl.publicTypes}`).pipe(
      map((res: any) => this.extractArray(res)),
      catchError(() => of([]))
    );
  }

  submitTicket(form: any): Observable<any> {
    return this.post(apiUrl.publicTicketOpen, this.toOpenTicketPayload(form));
  }

  /** Public /ticket/open form → POST /public/ticket/open only. */
  private toOpenTicketPayload(form: any): Record<string, any> | FormData {
    const firstName = String(form?.first_name ?? '').trim();
    const lastName = String(form?.last_name ?? '').trim();
    const details = String(form?.details ?? form?.body ?? '').trim();
    const files: File[] = Array.isArray(form?.files)
      ? form.files.filter((file: any) => file instanceof File)
      : [];

    const path = String(form?.path ?? (Array.isArray(form?.attachments) ? form.attachments[0]?.path || form.attachments[0] : '') ?? '').trim();
    const filename = String(form?.filename ?? form?.file_name ?? (Array.isArray(form?.attachments) ? form.attachments[0]?.filename || form.attachments[0]?.name : '') ?? '').trim();
    const size = Number(form?.size ?? form?.file_size ?? (Array.isArray(form?.attachments) ? form.attachments[0]?.size : 0) ?? 0);

    const payload: Record<string, any> = {
      first_name: firstName,
      last_name: lastName,
      name: [firstName, lastName].filter(Boolean).join(' '),
      email: String(form?.email ?? '').trim(),
      subject: String(form?.subject ?? '').trim(),
      body: details,
      details,
      message: details,
      status_id: this.toOptionalId(form?.status_id) ?? 0,
      priority_id: this.toOptionalId(form?.priority_id) ?? 0,
      department_id: this.toOptionalId(form?.department_id) ?? 0,
      category_id: this.toOptionalId(form?.category_id) ?? 0,
      sub_category_id: this.toOptionalId(form?.sub_category_id) ?? null,
      type_id: this.toOptionalId(form?.type_id) ?? 0,
      path,
      filename,
      size,
      custom_field: form?.custom_field && typeof form.custom_field === 'object' ? form.custom_field : undefined,
    };

    if (form?.attachments !== undefined) {
      payload['attachments'] = form.attachments;
    }
    if (form?.attachment !== undefined) {
      payload['attachment'] = form.attachment;
    }

    if (payload['attachments'] || payload['attachment'] || payload['path'] || !files.length) {
      return payload;
    }

    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    files.forEach((file) => formData.append('files', file, file.name));
    return formData;
  }

  private toOptionalId(value: any): number | string | null {
    if (value === undefined || value === null || value === '' || value === 0 || value === '0') {
      return null;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
  }

  submitContactMessage(formData: any): Observable<any> {
    const path = this.auth.getToken() ? apiUrl.contactCreate : apiUrl.publicContact;
    return this.post(path, formData);
  }

  subscribeNewsletter(email: string): Observable<any> {
    return this.post(apiUrl.publicSubscribeNews, { email: String(email || '').trim() });
  }

  private cloneJson<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
  }
}
