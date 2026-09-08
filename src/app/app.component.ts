import { Component, OnInit } from '@angular/core';
import { SettingService } from './core/setting/_services/setting.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'helpdesk-admin';

  constructor(private settingService: SettingService) {}

  ngOnInit(): void {
    this.settingService.loadBrandSettings();
  }
}
