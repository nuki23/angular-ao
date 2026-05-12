import { inject, Injectable } from '@angular/core';
import { Dialog } from '@core/models/dialog.interface';
import { ModalService } from '@core/services/modals/modal.service';
import { InfoDialog } from '@shared/modals/info-dialog/info-dialog';
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from '@fortawesome/pro-solid-svg-icons';
import { finalize, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private readonly modalService = inject(ModalService);
  private activeModalsCount = 0;
  private isErrorOpen = false;

  showMessage(params: Dialog): Observable<any> {
    this.activeModalsCount++;

    const modal = this.modalService.openModal(
      InfoDialog,
      params.withClass ? params.withClass : 'nzXs',
      { padding: params.padding || '3rem 1.5rem 1.5rem 1.5rem' },
      params,
      true,
    );

    return modal.afterClose.pipe(
      tap(() => {
        this.activeModalsCount--;
        if (this.activeModalsCount < 0) this.activeModalsCount = 0;
      }),
    );
  }

  success(text: string) {
    this.showMessage({
      img: { src: '/message-icon/success.png', alt: 'Success' },
      textBold: text,
      confirmButton: { text: 'Entendido' },
      withClass: 'nzXs',
      data: {},
    }).subscribe();
  }

  error(text: string) {
    if (this.isErrorOpen) return;
    this.isErrorOpen = true;
    this.showMessage({
      icon: { name: faCircleXmark, container: 'text-rose-500' },
      textBold: text,
      confirmButton: { text: 'Entendido' },
      withClass: 'nzXs',
      data: {},
    })
      .pipe(finalize(() => (this.isErrorOpen = false)))
      .subscribe();
  }

  warning(text: string) {
    this.showMessage({
      img: { src: '/message-icon/alerta.png', alt: 'Alerta' },
      textBold: text,
      confirmButton: { text: 'Entendido' },
      withClass: 'nzXs',
      data: {},
    }).subscribe();
  }

  show(text: string, type: 'success' | 'error' | 'warning' | 'info') {
    const imgMap = {
      success: { src: '/message-icon/success.png', alt: 'Success' },
      error: { src: '/message-icon/error.png', alt: 'Error' },
      warning: { src: '/message-icon/warning.png', alt: 'Warning' },
      info: { src: '/message-icon/info.png', alt: 'Info' },
    };

    this.showMessage({
      img: imgMap[type],
      textBold: text,
      confirmButton: { text: 'Entendido' },
      withClass: 'nzXs',
      data: {},
    }).subscribe();
  }
}
