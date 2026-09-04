import { Component, OnInit } from '@angular/core';
import { LandingService } from '../../../../core/landing/_services/landing.service';

@Component({
  selector: 'app-landing-privacy',
  templateUrl: './landing-privacy.component.html',
  styleUrls: ['./landing-privacy.component.scss'],
})
export class LandingPrivacyComponent implements OnInit {
  privacyData: any = null;

  constructor(private landingService: LandingService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.landingService.getPrivacyData().subscribe((data: any) => {
      this.privacyData = data;
    });
  }

  print(areaId: string): void {
    const area = document.getElementById(areaId);
    if (!area) return;

    const prtHtml = area.innerHTML;
    let stylesHtml = '';
    for (const node of Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))) {
      stylesHtml += node.outerHTML;
    }

    const winPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (winPrint) {
      winPrint.document.write(`<!DOCTYPE html><html><head>${stylesHtml}</head><body style="padding:2rem;">${prtHtml}</body></html>`);
      winPrint.document.close();
      winPrint.focus();
      setTimeout(() => {
        winPrint.print();
      }, 250);
    }
  }
}
