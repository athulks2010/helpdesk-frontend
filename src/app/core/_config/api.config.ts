export const apiUrl = {
  /* Authentication */
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  logout: '/auth/logout',
  forgotPassword: '/auth/password/reset',
  resetPassword: '/auth/password/reset',

  /* Tickets */
  tickets: '/ticket',
  ticketsAll: '/ticket/all',
  ticketSingle: '/ticket/single',
  ticketCreate: '/ticket/create',
  ticketUpdate: '/ticket/update',
  ticketDelete: '/ticket/delete',
  ticketComments: '/ticket/comments',
  ticketConversations: '/ticket/conversations',

  /* Filters (Node.js backend endpoints) */
  filterClients: '/organization/all',
  filterAssignees: '/user/all',
  filterCustomers: '/contact/all',

  /* Conversations / Chat */
  conversations: '/conversation',
  conversationsAll: '/conversation/all',
  conversationSingle: '/conversation/single',
  conversationCreate: '/conversation/create',
  conversationMessages: '/conversation/messages',
  conversationMarkRead: '/conversation/mark-read',
  conversationDelete: '/conversation/delete',
  conversationUpload: '/conversation/upload-attachments',

  /* Users */
  users: '/user',
  usersAll: '/user/all',
  userSingle: '/user/single',
  userCreate: '/user/create',
  userUpdate: '/user/update',
  userDelete: '/user/delete',

  /* Contacts */
  contacts: '/contact',
  contactsAll: '/contact/all',
  contactSingle: '/contact/single',
  contactCreate: '/contact/create',
  contactUpdate: '/contact/update',
  contactDelete: '/contact/delete',

  /* Organizations */
  organizations: '/organization',
  organizationsAll: '/organization/all',
  organizationSingle: '/organization/single',
  organizationCreate: '/organization/create',
  organizationUpdate: '/organization/update',
  organizationDelete: '/organization/delete',

  /* Notes */
  notes: '/note',
  notesAll: '/note/all',
  noteSingle: '/note/single',
  noteCreate: '/note/create',
  noteUpdate: '/note/update',
  noteDelete: '/note/delete',

  /* Categories */
  categories: '/category',
  categoriesAll: '/category/all',
  categorySingle: '/category/single',
  categoryCreate: '/category/create',
  categoryUpdate: '/category/update',
  categoryDelete: '/category/delete',

  /* Priorities */
  priorities: '/priority',
  prioritiesAll: '/priority/all',
  prioritySingle: '/priority/single',
  priorityCreate: '/priority/create',
  priorityUpdate: '/priority/update',
  priorityDelete: '/priority/delete',

  /* Statuses */
  statuses: '/status',
  statusesAll: '/status/all',
  statusSingle: '/status/single',
  statusCreate: '/status/create',
  statusUpdate: '/status/update',
  statusDelete: '/status/delete',

  /* Departments */
  departments: '/department',
  departmentsAll: '/department/all',
  departmentSingle: '/department/single',
  departmentCreate: '/department/create',
  departmentUpdate: '/department/update',
  departmentDelete: '/department/delete',

  /* Types */
  types: '/type',
  typesAll: '/type/all',
  typeSingle: '/type/single',
  typeCreate: '/type/create',
  typeUpdate: '/type/update',
  typeDelete: '/type/delete',

  /* Roles */
  roles: '/role',
  rolesAll: '/role/all',
  roleSingle: '/role/single',
  roleCreate: '/role/create',
  roleUpdate: '/role/update',
  roleDelete: '/role/delete',

  /* FAQs */
  faqs: '/faq',
  faqsAll: '/faq/all',
  faqSingle: '/faq/single',
  faqCreate: '/faq/create',
  faqUpdate: '/faq/update',
  faqDelete: '/faq/delete',

  /* Blogs / Posts */
  blogs: '/post',
  blogsAll: '/post/all',
  blogSingle: '/post/single',
  blogCreate: '/post/create',
  blogUpdate: '/post/update',
  blogDelete: '/post/delete',

  /* Knowledge Base */
  knowledgeBase: '/knowledge-base',
  knowledgeBaseAll: '/knowledge-base/all',
  knowledgeBaseSingle: '/knowledge-base/single',
  knowledgeBaseCreate: '/knowledge-base/create',
  knowledgeBaseUpdate: '/knowledge-base/update',
  knowledgeBaseDelete: '/knowledge-base/delete',

  /* Services */
  services: '/service',
  servicesAll: '/service/all',
  serviceSingle: '/service/single',
  serviceCreate: '/service/create',
  serviceUpdate: '/service/update',
  serviceDelete: '/service/delete',

  /* Settings */
  settings: '/setting',
  settingsAll: '/setting/all',
  settingSingle: '/setting/single',
  settingBySlug: '/setting/by-slug',
  settingUpdate: '/setting/update',

  /* Dashboard */
  dashboardMetrics: '/dashboard/metrics',
  dashboardAnalytics: '/dashboard/analytics',
  dashboardPerformance: '/dashboard/performance',
  dashboardCharts: '/dashboard/charts',

  /* Reports */
  reportGenerate: '/report/generate',
  reportShow: '/report/show',

  /* Notifications */
  notifications: '/notification',
  notificationsAll: '/notification/all',
  notificationMarkRead: '/notification/mark-read',
  notificationMarkAllRead: '/notification/mark-all-read',

  /* AI */
  aiClassify: '/ai/classify',
  aiSuggestions: '/ai/suggestions',
  aiSentiment: '/ai/sentiment',
  aiStatus: '/ai/status',
  aiAnalytics: '/ai/analytics',
  aiSettings: '/ai/settings',

  /* Languages */
  languages: '/language',
  languagesAll: '/language/all',
  languageCreate: '/language/create',
  languageUpdate: '/language/update',
  languageDelete: '/language/delete',
  languageTranslations: '/language/translations',
  languagePhrase: '/language/phrase',

  /* Navigation Menus */
  menus: '/navigation-menu',
  menusAll: '/navigation-menu/all',
  menuCreate: '/navigation-menu/create',
  menuUpdate: '/navigation-menu/update',
  menuDelete: '/navigation-menu/delete',
  menuReorder: '/navigation-menu/reorder',

  /* Email Templates */
  emailTemplates: '/email-template',
  emailTemplatesAll: '/email-template/all',
  emailTemplateSingle: '/email-template/single',
  emailTemplateUpdate: '/email-template/update',

  /* SMTP / Pusher / Piping */
  smtpSettings: '/setting/smtp',
  smtpUpdate: '/setting/smtp/update',
  smtpTest: '/setting/smtp/test',
  pusherSettings: '/setting/pusher',
  pusherUpdate: '/setting/pusher/update',
  pusherTest: '/setting/pusher/test',
  pipingSettings: '/setting/email-piping',
  pipingUpdate: '/setting/email-piping/update',
  pipingTest: '/setting/email-piping/test',

  /* Ticket extras */
  ticketRestore: '/ticket/restore',
  ticketFavorite: '/ticket/favorites',
  ticketFavorites: '/ticket/favorites',
  ticketActivities: '/ticket/activities',
  ticketImport: '/ticket/import',
  ticketExport: '/ticket/export',
  ticketFields: '/ticket-field',
  ticketFieldsAll: '/ticket-field/all',
  ticketFieldCreate: '/ticket-field/create',
  ticketFieldDelete: '/ticket-field/delete',
  ticketFieldUpdate: '/ticket-field/update',
  ticketFieldSingle: '/ticket-field/single',

  /* Pending users */
  pendingUsersAll: '/user/pending',
  pendingUserApprove: '/user/pending/approve',
  pendingUserDecline: '/user/pending/decline',

  /* Front pages CMS */
  frontPages: '/front-page',
  frontPagesAll: '/front-page/all',
  frontPageSingle: '/front-page/single',
  frontPageUpdate: '/front-page/update',
  frontPageCreate: '/front-page/create',

  /* Public */
  publicFaqs: '/public/faqs',
  publicPosts: '/public/posts',
  publicKnowledgeBase: '/public/knowledge-base',
  publicServices: '/public/services',
  publicFrontPage: '/public/front-page',
};
