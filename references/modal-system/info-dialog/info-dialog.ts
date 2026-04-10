import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Dialog } from '@core/models/dialog.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import {
  lucideClock,
  lucideCode2,
  lucideMessageCircleWarning,
  lucideTrash,
  lucideCheck,
  lucideInfo,
  lucideX,
  lucideMoreHorizontal,
  lucideMessageCircle
} from '@ng-icons/lucide';

@Component({
  selector: 'app-info-dialog',
  imports: [
    CommonModule,
    NgIcon,
    NzButtonModule
  ],
  templateUrl: './info-dialog.html',
  styleUrl: './info-dialog.css',
  viewProviders: [
    provideIcons({
      lucideCode2,
      lucideTrash,
      lucideCheck,
      lucideInfo,
      lucideX,
      lucideClock,
      lucideMoreHorizontal,
      lucideMessageCircle,
      lucideMessageCircleWarning
    })
  ],
})
export class InfoDialog {
  @Input() params: Dialog;
  @Input() type: any;
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  constructor(private modal: NzModalRef<any>) {
    this.params = this.nzModalData.params
  }

  confirm(): void { this.modal.close(true); }
  Exit(): void    { this.modal.close({ exit: true }); }
  cancel(): void  { this.modal.close(false); }
  closeDialog(data: any) { this.modal.close(data); }
}
