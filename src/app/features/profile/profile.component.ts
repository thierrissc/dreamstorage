import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { InventoryService } from '../../core/services/inventory.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <!-- Minimalist Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Perfil & Controle de Acesso</h1>
          <p class="page-desc">Gerenciamento de credenciais, nivel de permissao e politicas de seguranca.</p>
        </div>
      </div>

      <div class="profile-grid">
        <!-- User Info Card -->
        <div class="liquid-glass-card profile-card">
          <div class="profile-header">
            <div class="profile-avatar">
              {{ user().username.charAt(0).toUpperCase() }}
            </div>
            <div class="profile-title-box">
              <h2 class="profile-name">{{ user().first_name }} {{ user().last_name }}</h2>
              <span class="profile-role-tag">{{ currentRole }}</span>
            </div>
          </div>

          <form (ngSubmit)="saveProfile()" class="profile-form">
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Nome de Usuario</label>
                <input 
                  type="text" 
                  [value]="user().username" 
                  disabled 
                  class="glass-input font-mono input-disabled"
                />
              </div>

              <div class="form-group">
                <label class="form-label">E-mail Corporativo</label>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email" 
                  class="glass-input" 
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label">Primeiro Nome</label>
                <input 
                  type="text" 
                  [(ngModel)]="firstName" 
                  name="firstName" 
                  class="glass-input" 
                />
              </div>

              <div class="form-group">
                <label class="form-label">Sobrenome</label>
                <input 
                  type="text" 
                  [(ngModel)]="lastName" 
                  name="lastName" 
                  class="glass-input" 
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Nivel de Acesso & Role (RLS)</label>
              <select [(ngModel)]="currentRole" name="role" class="glass-input">
                <option value="Administrador do Sistema">Administrador do Sistema (Total)</option>
                <option value="Gestor de Armazem">Gestor de Armazem (Entradas / Saidas / Balanco)</option>
                <option value="Operador Logistico">Operador Logistico (Apenas Registro de Entradas)</option>
                <option value="Auditor Fiscal">Auditor Fiscal (Somente Leitura e Relatorios)</option>
              </select>
            </div>

            <div class="card-footer-actions">
              <button type="submit" class="btn btn-cream">Salvar Alteracoes</button>
            </div>
          </form>
        </div>

        <!-- Security & Access Control Panel -->
        <div class="liquid-glass-card security-card">
          <div class="security-card-header">
            <h2 class="card-title">Politicas de Seguranca & Sessao</h2>
            <span class="badge badge-normal">Sessao Criptografada</span>
          </div>

          <div class="security-items-list">
            <div class="sec-item">
              <div class="sec-info">
                <div class="sec-title">Autenticacao Server-Side</div>
                <div class="sec-desc">Tokens protegidos com isolamento de cookies e validacao no Django REST Framework.</div>
              </div>
              <span class="status-pill status-active">Ativo</span>
            </div>

            <div class="sec-item">
              <div class="sec-info">
                <div class="sec-title">Protecao contra Field Tampering</div>
                <div class="sec-desc">Calculos de saldo e valores calculados estritamente no backend.</div>
              </div>
              <span class="status-pill status-active">Ativo</span>
            </div>

            <div class="sec-item">
              <div class="sec-info">
                <div class="sec-title">Auditoria Imutavel de Movimentacao</div>
                <div class="sec-desc">Registros vinculados ao operador com bloqueio de edicao retroativa.</div>
              </div>
              <span class="status-pill status-active">Auditavel</span>
            </div>

            <div class="sec-item">
              <div class="sec-info">
                <div class="sec-title">Token de Integracao API</div>
                <div class="sec-token-box">
                  <span class="font-mono text-xs token-masked">{{ maskedToken }}</span>
                  <button type="button" class="btn-copy" (click)="copyToken()">Copiar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="danger-zone">
            <button class="btn btn-sm btn-danger" (click)="resetSession()">Encerrar Sessao Atual</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 32px 36px;
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .page-header {
      margin-bottom: 4px;
    }
    .page-title {
      font-size: 2rem;
      color: var(--cream-50);
    }
    .page-desc {
      font-size: 0.9rem;
      color: var(--cream-300);
      margin-top: 4px;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 24px;
    }

    /* Profile Card */
    .profile-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .profile-header {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .profile-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--cream-200) 0%, var(--cream-400) 100%);
      color: var(--royal-950);
      font-size: 1.8rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .profile-name {
      font-size: 1.3rem;
      color: var(--cream-50);
    }
    .profile-role-tag {
      font-size: 0.8rem;
      color: var(--cream-400);
      font-weight: 600;
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .input-disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .card-footer-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Security Card */
    .security-card {
      padding: 28px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .security-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .card-title {
      font-size: 1.15rem;
      color: var(--cream-50);
    }
    .security-items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .sec-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px;
      background: rgba(8, 17, 44, 0.5);
      border: 1px solid rgba(235, 224, 198, 0.1);
      border-radius: 12px;
    }
    .sec-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--cream-100);
    }
    .sec-desc {
      font-size: 0.78rem;
      color: var(--cream-400);
      margin-top: 2px;
      line-height: 1.35;
    }
    .status-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }
    .status-active {
      background: rgba(16, 185, 129, 0.18);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .sec-token-box {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    .token-masked {
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: 6px;
      color: var(--cream-300);
    }
    .btn-copy {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--cream-200);
      font-size: 0.74rem;
      padding: 4px 8px;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-copy:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
    }
    .danger-zone {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 16px;
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 900px) {
      .profile-grid {
        grid-template-columns: 1fr;
      }
      .form-grid-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  toast = inject(ToastService);

  user = this.authService.currentUser;
  firstName = this.user().first_name || 'Gestor';
  lastName = this.user().last_name || 'DreamStorage';
  email = this.user().email || 'admin@dreamstorage.io';
  currentRole = 'Administrador do Sistema';
  maskedToken = 'ds_live_98319f012bcf***7a9';

  saveProfile() {
    this.authService.currentUser.update(curr => ({
      ...curr,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email
    }));
    this.toast.success('Perfil e permissoes atualizados com sucesso!');
  }

  copyToken() {
    navigator.clipboard?.writeText('ds_live_98319f012bcf3e284917a9');
    this.toast.info('Token de integracao copiado para a area de transferencia.');
  }

  resetSession() {
    this.authService.logout().subscribe(() => {
      this.toast.warning('Sessao de usuario encerrada.');
    });
  }
}
