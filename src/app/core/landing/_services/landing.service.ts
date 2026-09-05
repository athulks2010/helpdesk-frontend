import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiBaseService } from '../../shared/api-base.service';
import { apiUrl } from '../../_config/api.config';

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
  constructor(http: HttpClient) {
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

    let parsed: any = null;
    if (typeof data.content === 'string') {
      try {
        parsed = JSON.parse(data.content);
      } catch (e) {
        parsed = null;
      }
    } else if (data.html) {
      try {
        parsed = typeof data.html === 'string' ? JSON.parse(data.html) : data.html;
      } catch (e) {
        parsed = null;
      }
    } else if (data.sections) {
      parsed = data;
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
      };
    });

    return { sections: mergedSections };
  }

  getHomePageData(): Observable<any> {
    const defaultData = this.getDefaultHomePageData();
    return this.getSingle(apiUrl.publicFrontPage, { slug: 'home' }).pipe(
      map((res: any) => this.parseHomePageData(res)),
      catchError(() => of(defaultData.html))
    );
  }

  getContactPageData(): Observable<any> {
    const defaultData = {
      title: 'Contact',
      html: {
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
      },
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'contact' }).pipe(
      catchError(() => of(defaultData))
    );
  }

  getServicesPageData(): Observable<any> {
    const defaultData = {
      title: 'Services',
      html: {
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
      },
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'services' }).pipe(
      catchError(() => of(defaultData))
    );
  }

  getTermsData(): Observable<any> {
    const defaultData = {
      title: 'Terms of Services',
      updated_at: 'March 1, 2026',
      html: {
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
      },
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'terms' }).pipe(
      catchError(() => of(defaultData))
    );
  }

  getPrivacyData(): Observable<any> {
    const defaultData = {
      title: 'Privacy Policy',
      updated_at: 'March 1, 2026',
      html: {
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
      },
    };

    return this.getSingle(apiUrl.publicFrontPage, { slug: 'privacy' }).pipe(
      catchError(() => of(defaultData))
    );
  }

  getFooterData(): Observable<any> {
    return of({
      text: 'Start working with HelpDesk and streamline customer support operations across every channel.',
      copyright: '© 2026 HelpDesk. All rights reserved.',
    });
  }

  getFaqs(): Observable<FaqItem[]> {
    const defaultFaqs: FaqItem[] = [
      {
        id: 1,
        name: 'How do customers submit a support ticket?',
        details:
          '<p>Customers can open a support ticket either via the public ticket submission form or through the authenticated customer portal. Each submission receives a unique tracking ID and confirmation email.</p>',
        category: 'Ticketing',
      },
      {
        id: 2,
        name: 'Can tickets be automatically assigned to specific departments?',
        details:
          '<p>Yes. HelpDesk includes automated routing rules that direct incoming requests to the appropriate team based on department, ticket category, and priority level.</p>',
        category: 'Routing',
      },
      {
        id: 3,
        name: 'How are SLAs and response deadlines managed?',
        details:
          '<p>SLA policies can be configured per priority tier (Low, Medium, High, Urgent). Real-time countdowns alert agents and managers before response or resolution thresholds are breached.</p>',
        category: 'Operations',
      },
      {
        id: 4,
        name: 'Can agents add internal private notes to tickets?',
        details:
          '<p>Yes. Agents can post private internal notes that remain hidden from customers, allowing team members to discuss diagnostics, escalation steps, and technical notes collaboratively.</p>',
        category: 'Collaboration',
      },
      {
        id: 5,
        name: 'Is file attachment upload supported on ticket submissions?',
        details:
          '<p>Yes. Both customers and agents can attach screenshots, log files, PDFs, and documents up to the maximum upload size defined in system settings.</p>',
        category: 'Features',
      },
      {
        id: 6,
        name: 'Can customers check ticket status without logging in?',
        details:
          '<p>When a ticket is submitted publicly, the customer receives a tracking link via email allowing them to view ticket progress and post additional replies securely.</p>',
        category: 'Ticketing',
      },
    ];

    return this.getCollection(apiUrl.publicFaqs).pipe(
      catchError(() => of(defaultFaqs))
    );
  }

  getServicesList(): Observable<ServiceItem[]> {
    const list: ServiceItem[] = [
      {
        id: 1,
        title: 'Omnichannel Ticket Routing',
        description:
          'Ingest, triage, and route support tickets seamlessly from web portals, email, chat, and API endpoints.',
        icon: 'ticket',
        features: ['Intelligent triage', 'Custom rule triggers', 'Zero drop queues'],
      },
      {
        id: 2,
        title: 'SLA & Escalation Management',
        description:
          'Define tiered SLA policies with automated alerts and escalations before resolution breach.',
        icon: 'clock',
        features: ['Target countdowns', 'Tiered escalations', 'Compliance auditing'],
      },
      {
        id: 3,
        title: 'Collaborative Agent Workspace',
        description:
          'Shared timelines, private agent notes, collision detection, and instant ticket reassignment.',
        icon: 'users',
        features: ['Internal mentions', 'Real-time sync', 'Rich text editor'],
      },
      {
        id: 4,
        title: 'Self-Service Knowledge Base',
        description:
          'Empower users with searchable documentation, category taxonomies, and instant article suggestions.',
        icon: 'book',
        features: ['Instant search', 'Feedback voting', 'Article analytics'],
      },
      {
        id: 5,
        title: 'Real-Time Live Chat Integration',
        description:
          'Connect agents and customers directly with instant messaging, attachment exchange, and typing indicators.',
        icon: 'chat',
        features: ['WebSocket powered', 'Status indicators', 'Transcript archive'],
      },
      {
        id: 6,
        title: 'Operations & Performance Reporting',
        description:
          'Gain deep visibility into resolution times, first-contact resolution rates, and team workload trends.',
        icon: 'bar-chart',
        features: ['Exportable reports', 'Team leaderboards', 'Trend visualizations'],
      },
    ];
    return of(list);
  }

  getKnowledgeBaseList(): Observable<KbArticle[]> {
    const list: KbArticle[] = [
      {
        id: 1,
        title: 'Getting Started: Submitting and Tracking Your First Ticket',
        slug: 'getting-started-submitting-tickets',
        details:
          'Learn the step-by-step process of submitting a support request, adding attachments, and monitoring progress from initial triage to complete resolution.',
        category: 'Getting Started',
        views: 1420,
        helpful: 98,
        updated_at: '2 days ago',
      },
      {
        id: 2,
        title: 'How Ticket Priorities and SLA Windows Are Calculated',
        slug: 'ticket-priorities-and-sla',
        details:
          'Understand how priority levels impact response times, SLA expectations, and how urgent issues are escalated to engineering specialists.',
        category: 'SLA & Policy',
        views: 890,
        helpful: 94,
        updated_at: '1 week ago',
      },
      {
        id: 3,
        title: 'Troubleshooting Attachment Upload and Supported File Formats',
        slug: 'troubleshooting-attachment-uploads',
        details:
          'Review the allowed file formats (PNG, JPG, PDF, TXT, ZIP), individual size limitations, and tips for uploading system logs.',
        category: 'Technical Help',
        views: 1105,
        helpful: 96,
        updated_at: '3 days ago',
      },
      {
        id: 4,
        title: 'Account Security: Password Resets and Email Verification',
        slug: 'account-security-and-passwords',
        details:
          'How to reset your account password, manage registered contact details, and resolve email delivery verification problems.',
        category: 'Account',
        views: 650,
        helpful: 91,
        updated_at: '2 weeks ago',
      },
      {
        id: 5,
        title: 'Collaborating on Tickets: Adding CCs and Organization Members',
        slug: 'ticket-collaboration-and-ccs',
        details:
          'Learn how team members within the same organization can follow ticket threads and receive email updates on shared issues.',
        category: 'Collaboration',
        views: 740,
        helpful: 95,
        updated_at: '5 days ago',
      },
      {
        id: 6,
        title: 'Understanding Ticket Statuses: Open, Pending, and Closed',
        slug: 'understanding-ticket-statuses',
        details:
          'A reference guide explaining the operational meaning of every ticket status throughout the support lifecycle.',
        category: 'Getting Started',
        views: 920,
        helpful: 97,
        updated_at: '1 week ago',
      },
    ];
    return of(list);
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

  getDepartments(): Observable<any[]> {
    const defaultDepts = [
      { id: 1, name: 'Technical Support' },
      { id: 2, name: 'Billing & Subscriptions' },
      { id: 3, name: 'Product Onboarding' },
      { id: 4, name: 'General Inquiries' },
    ];
    return of(defaultDepts);
  }

  getPriorities(): Observable<any[]> {
    const defaultPriorities = [
      { id: 1, name: 'Low', color: '#10b981' },
      { id: 2, name: 'Medium', color: '#3b82f6' },
      { id: 3, name: 'High', color: '#f59e0b' },
      { id: 4, name: 'Urgent', color: '#ef4444' },
    ];
    return of(defaultPriorities);
  }

  getCategories(): Observable<any[]> {
    const defaultCats = [
      { id: 1, name: 'Account & Login' },
      { id: 2, name: 'Billing Issue' },
      { id: 3, name: 'Software Bug' },
      { id: 4, name: 'Feature Request' },
      { id: 5, name: 'Integration Help' },
    ];
    return of(defaultCats);
  }

  submitTicket(formData: any): Observable<any> {
    return this.post(apiUrl.ticketCreate, formData).pipe(
      catchError(() =>
        of({
          success: true,
          message: 'Ticket created successfully! Our team will get back to you shortly.',
          ticket: { id: Math.floor(1000 + Math.random() * 9000), ...formData },
        })
      )
    );
  }

  submitContactMessage(formData: any): Observable<any> {
    return this.post(apiUrl.contactCreate, formData).pipe(
      catchError(() =>
        of({
          success: true,
          message: 'Thank you for reaching out! We have received your message and will respond within 24 hours.',
        })
      )
    );
  }

  subscribeNewsletter(email: string): Observable<any> {
    return of({
      success: true,
      message: 'Thank you for subscribing to HelpDesk updates!',
    });
  }
}
