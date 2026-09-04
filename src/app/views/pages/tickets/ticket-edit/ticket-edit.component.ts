import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../../../core/ticket/_services/ticket.service';

@Component({
  selector: 'app-ticket-edit',
  templateUrl: './ticket-edit.component.html',
  styleUrls: ['./ticket-edit.component.scss'],
})
export class TicketEditComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  id!: string;

  // Dropdowns
  priorities: any[] = [];
  statuses: any[] = [];
  types: any[] = [];
  departments: any[] = [];

  // Customer autocomplete
  customers: any[] = [];
  customerSearch = '';
  showCustomerDropdown = false;
  selectedCustomer: any = null;

  // Assignee autocomplete
  assignees: any[] = [];
  assigneeSearch = '';
  showAssigneeDropdown = false;
  selectedAssignee: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.form = this.fb.group({
      id: [this.id],
      user_id: [null, Validators.required],
      priority_id: [null, Validators.required],
      status_id: [null],
      type_id: [null],
      department_id: [null],
      assigned_to: [null],
      subject: ['', Validators.required],
      details: [''],
    });

    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.ticketService.getFormDropdowns().subscribe((dropdowns) => {
      this.priorities = dropdowns.priorities;
      this.statuses = dropdowns.statuses;
      this.types = dropdowns.types;
      this.departments = dropdowns.departments;
      this.customers = dropdowns.customers;
      this.assignees = dropdowns.assignees;

      this.ticketService.getById(this.id).subscribe({
        next: (res) => {
          const t = res?.ticket || res;
          if (t) {
            this.form.patchValue({
              id: t.id || this.id,
              user_id: t.user_id || t.user?.id || null,
              priority_id: t.priority_id || t.priority?.id || null,
              status_id: t.status_id || t.status?.id || null,
              type_id: t.type_id || t.type?.id || null,
              department_id: t.department_id || t.department?.id || null,
              assigned_to: t.assigned_to || t.assignee?.id || null,
              subject: t.subject || t.title || '',
              details: t.details || t.body || t.description || '',
            });

            if (t.user) {
              this.selectedCustomer = t.user;
              this.customerSearch = this.displayName(t.user);
            }
            if (t.assignee || t.assignedTo) {
              const ass = t.assignee || t.assignedTo;
              this.selectedAssignee = ass;
              this.assigneeSearch = this.displayName(ass);
            }
          }
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load ticket';
          this.loading = false;
        },
      });
    });
  }

  onCustomerSearch(): void {
    this.showCustomerDropdown = true;
    if (this.customerSearch.length >= 2) {
      this.ticketService.searchCustomers(this.customerSearch).subscribe((res) => {
        this.customers = res;
      });
    }
  }

  selectCustomer(c: any): void {
    this.selectedCustomer = c;
    this.customerSearch = this.displayName(c);
    this.showCustomerDropdown = false;
    this.form.patchValue({ user_id: c.id });
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.customerSearch = '';
    this.form.patchValue({ user_id: null });
  }

  onAssigneeSearch(): void {
    this.showAssigneeDropdown = true;
    if (this.assigneeSearch.length >= 2) {
      this.ticketService.searchAssignees(this.assigneeSearch).subscribe((res) => {
        this.assignees = res;
      });
    }
  }

  selectAssignee(a: any): void {
    this.selectedAssignee = a;
    this.assigneeSearch = this.displayName(a);
    this.showAssigneeDropdown = false;
    this.form.patchValue({ assigned_to: a.id });
  }

  clearAssignee(): void {
    this.selectedAssignee = null;
    this.assigneeSearch = '';
    this.form.patchValue({ assigned_to: null });
  }

  filteredCustomers(): any[] {
    if (!this.customerSearch) return this.customers.slice(0, 10);
    const q = this.customerSearch.toLowerCase();
    return this.customers
      .filter((c) => this.displayName(c).toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q))
      .slice(0, 10);
  }

  filteredAssignees(): any[] {
    if (!this.assigneeSearch) return this.assignees.slice(0, 10);
    const q = this.assigneeSearch.toLowerCase();
    return this.assignees
      .filter((a) => this.displayName(a).toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q))
      .slice(0, 10);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.error = '';

    this.ticketService.updateTicket(this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/tickets', this.id]);
      },
      error: (err) => {
        this.saving = false;
        this.error =
          err?.error?.response?.message ||
          err?.error?.message ||
          'Failed to update ticket';
      },
    });
  }

  displayName(user: any): string {
    if (!user) return '';
    return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || '';
  }

  get f() {
    return this.form.controls;
  }
}
