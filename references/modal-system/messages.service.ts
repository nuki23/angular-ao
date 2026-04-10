import { Injectable } from "@angular/core";
import { Dialog } from "@core/models/dialog.interface";
import { ModalService } from "@core/services/modals/modal.service";
import { InfoDialog } from "@shared/modals/info-dialog/info-dialog";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class MessagesService {

    private activeModalsCount = 0;

    constructor(private modalService: ModalService) { }

    showMessage(params: Dialog): Observable<any> {
        this.activeModalsCount++;

        const modal = this.modalService.openModal(
            InfoDialog,
            params.withClass ? params.withClass : 'nzXs',
            { padding: params.padding || '1rem' },
            params,
            true
        );

        return modal.afterClose.pipe(
            tap(() => {
                this.activeModalsCount--;
                if (this.activeModalsCount < 0) this.activeModalsCount = 0;
            })
        );
    }

    success(text: string) {
        this.showMessage({
            icon: { name: 'success', container: 'text-green-500' },
            titleBold: text,
            confirmButton: { text: 'Entendido' },
            withClass: 'nz300',
            data: {},
        }).subscribe();
    }

    error(text: string) {
        this.showMessage({
            icon: { name: 'error', container: 'text-rose-500' },
            titleBold: text,
            confirmButton: { text: 'Entendido' },
            withClass: 'nz300',
            data: {},
        }).subscribe();
    }

    warning(text: string) {
        this.showMessage({
            icon: { name: '', container: 'text-amber-500' },
            titleBold: text,
            confirmButton: { text: 'Entendido' },
            withClass: 'nz300',
            data: {},
        }).subscribe();
    }

    show(text: string, type: 'success' | 'error' | 'warning' | 'info') {
        this.showMessage({
            icon: {
                name: type,
                container:
                    type === 'success' ? 'text-green-500' :
                    type === 'error'   ? 'text-rose-500'  :
                    type === 'warning' ? 'text-amber-500' :
                                        'text-blue-400',
            },
            titleBold: text,
            confirmButton: { text: 'Entendido' },
            withClass: 'nz300',
            data: {},
        }).subscribe();
    }
}
