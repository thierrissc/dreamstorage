import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(type: 'success' | 'error' | 'warning' | 'info', message: string, title?: string, duration = 4000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message };
    
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, title?: string) {
    this.show('success', message, title);
  }

  error(message: string, title?: string) {
    this.show('error', message, title || 'Erro');
  }

  warning(message: string, title?: string) {
    this.show('warning', message, title || 'Atenção');
  }

  info(message: string, title?: string) {
    this.show('info', message, title);
  }

  remove(id: string) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
