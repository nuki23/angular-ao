import { inject, Injectable } from '@angular/core';
import { Dialog } from '@core/models/dialog.interface';
import { InfoDialog } from '@shared/modals/info-dialog/info-dialog';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly closeAllModalObservable = new Subject<void>();
  private readonly nzModalService = inject(NzModalService);

  modal?: NzModalRef<{ params: Dialog } | any>;
  modalRef!: NzModalRef;

  openModal(
    template: any | string,
    nzCol: string,
    bodyStyle: any | object,
    param: Dialog,
    isCloseIcon: boolean = true,
    width?: any,
  ) {
    const modal = this.nzModalService.create({
      nzTitle: '',
      nzContent: template,
      nzClassName: 'dialog-class ' + nzCol,
      nzData: { params: param },
      nzFooter: null,
      nzMaskClosable: false,
      nzCentered: true,
      nzClosable: isCloseIcon,
      nzWidth: !width ? '' : width,
      nzKeyboard: false,
      nzCancelDisabled: false,
      nzBodyStyle: bodyStyle,
      nzAutofocus: null,
      nzNoAnimation: false,
    });

    this.modal = modal;
    return modal;
  }

  closeAllModals() {
    if (this.modal) {
      this.modal.close();
    }
  }

  showInfo(params: any, padding: string, size: string, callback = (_res: any) => {}) {
    const modal = this.openModal(InfoDialog, size, { padding: padding }, params);
    modal.afterClose.subscribe((res: any) => {
      callback(res);
    });
  }
}
