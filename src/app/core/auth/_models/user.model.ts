export class UserModel {
  id?: string | number;
  _id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  photo?: string;
  photo_path?: string;
  title?: string;
  locale?: string;
  role?: any;
  roles?: Array<string | { name?: string; slug?: string }>;
  access?: Record<string, { read?: boolean; create?: boolean; update?: boolean; delete?: boolean }>;
  organization_id?: string | number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;

  get displayName(): string {
    if (this.name) {
      return this.name;
    }
    const parts = [this.first_name, this.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : this.email || 'User';
  }
}
