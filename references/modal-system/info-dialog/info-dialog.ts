import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Dialog } from '@core/models/dialog.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleInfo } from '@fortawesome/pro-solid-svg-icons';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-info-dialog',
  imports: [
    CommonModule,
    FaIconComponent,
    NzButtonModule
  ],
  templateUrl: './info-dialog.html',
  styleUrl: './info-dialog.css',
})
export class InfoDialog implements OnInit {
  // fallback icon — el icono real viene en params.icon.name como IconDefinition
  readonly faCircleInfo = faCircleInfo;

  @Input() params: Dialog;
  @Input() type: any;
  readonly nzModalData: any = inject(NZ_MODAL_DATA);

  constructor(private modal: NzModalRef<any>) {
    this.params = this.nzModalData.params
  }

  ngOnInit(): void {}

  confirm(): void {
    this.modal.close(true);
  }

  Exit(): void {
    this.modal.close({ exit: true });
  }

  cancel(): void {
    this.modal.close(false);
  }

  closeDialog(data: any) {
    this.modal.close(data);
  }
}
