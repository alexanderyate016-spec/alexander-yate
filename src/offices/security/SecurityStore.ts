import { storeInstance } from '../../store/CasaBlancaStore';
import { hashString } from '../../store/cryptoUtils';
import { SecurityData, CrisisCenterData } from '../../types/store';

export const SecurityStore = {
  getSecurityData(): SecurityData {
    return storeInstance.getState().security;
  },

  async setupSecurity(fullName: string, pin: string, question: string, answer: string, passphrase?: string) {
    const pinHash = await hashString(pin);
    const answerHash = await hashString(answer.trim().toLowerCase());
    const passHash = passphrase ? await hashString(passphrase) : undefined;
    const now = new Date().toISOString();

    storeInstance.updateState(draft => {
      draft.security.isSetupComplete = true;
      draft.security.isLocked = false;
      draft.security.failedAttempts = 0;
      draft.security.failedAttemptsCount = 0;
      draft.security.lockoutUntil = null;
      draft.security.userProfile = {
        fullName,
        title: 'Presidente',
        avatarUrl: ''
      };
      draft.security.profile = {
        name: fullName
      };
      draft.security.credentials = {
        pinHash,
        securityQuestion: question,
        securityAnswerHash: answerHash,
        passphraseHash: passHash
      };
      draft.security.authentication = {
        passwordHash: pinHash,
        recoveryQuestion: question,
        recoveryAnswerHash: answerHash,
        createdAt: now,
        updatedAt: now
      };
      if (!draft.security.accessLogs) draft.security.accessLogs = [];
      draft.security.accessLogs.unshift({
        id: 'log_' + Date.now(),
        date: now,
        type: 'login_success',
        description: 'Configuración inicial e inicio de sesión presidencial activado.'
      });
    });
  },

  isCurrentlyLockedOut(): { locked: boolean; remainingMinutes: number; unlockTime: string | null } {
    const sec = this.getSecurityData();
    if (sec.lockoutUntil) {
      const lockoutTime = new Date(sec.lockoutUntil).getTime();
      const diffMs = lockoutTime - Date.now();
      if (diffMs > 0) {
        const remainingMinutes = Math.ceil(diffMs / (60 * 1000));
        const unlockTimeStr = new Date(lockoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return { locked: true, remainingMinutes, unlockTime: unlockTimeStr };
      }
    }
    return { locked: false, remainingMinutes: 0, unlockTime: null };
  },

  async verifyPin(pin: string): Promise<{ success: boolean; message?: string }> {
    const sec = this.getSecurityData();
    if (!sec.credentials) return { success: false, message: 'Credenciales no configuradas.' };

    const lockoutStatus = this.isCurrentlyLockedOut();
    if (lockoutStatus.locked) {
      return {
        success: false,
        message: `Sistema bloqueado temporalmente por 3 intentos fallidos. Intente de nuevo en ${lockoutStatus.remainingMinutes} min (a las ${lockoutStatus.unlockTime}) o use la Pregunta de Seguridad.`
      };
    }

    const inputHash = await hashString(pin);
    if (inputHash === sec.credentials.pinHash) {
      storeInstance.updateState(draft => {
        draft.security.isLocked = false;
        draft.security.failedAttempts = 0;
        draft.security.failedAttemptsCount = 0;
        draft.security.lockoutUntil = null;
        if (!draft.security.accessLogs) draft.security.accessLogs = [];
        draft.security.accessLogs.unshift({
          id: 'log_' + Date.now(),
          date: new Date().toISOString(),
          type: 'login_success',
          description: 'Acceso concedido mediante PIN presidencial.'
        });
      });
      return { success: true };
    } else {
      let isNowLockedOut = false;
      let remainingMins = 30;
      storeInstance.updateState(draft => {
        const attempts = (draft.security.failedAttempts || 0) + 1;
        draft.security.failedAttempts = attempts;
        draft.security.failedAttemptsCount = attempts;
        if (!draft.security.accessLogs) draft.security.accessLogs = [];

        if (attempts >= 3) {
          isNowLockedOut = true;
          const lockoutTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          draft.security.lockoutUntil = lockoutTime;
          draft.security.accessLogs.unshift({
            id: 'log_' + Date.now(),
            date: new Date().toISOString(),
            type: 'locked',
            description: `Sistema bloqueado durante 30 minutos tras ${attempts} intentos fallidos.`
          });
        } else {
          draft.security.accessLogs.unshift({
            id: 'log_' + Date.now(),
            date: new Date().toISOString(),
            type: 'failed_attempt',
            description: `Intento fallido de PIN (${attempts}/3).`
          });
        }
      });

      if (isNowLockedOut) {
        return {
          success: false,
          message: `3 intentos fallidos consecutivos. El sistema ha sido bloqueado por 30 minutos. Puede desbloquear mediante la Pregunta de Seguridad.`
        };
      }

      const currentAttempts = (sec.failedAttempts || 0) + 1;
      return {
        success: false,
        message: `PIN presidencial incorrecto. Intento ${currentAttempts} de 3.`
      };
    }
  },

  async verifySecurityAnswer(answer: string): Promise<{ success: boolean; message?: string }> {
    const sec = this.getSecurityData();
    if (!sec.credentials) return { success: false, message: 'Credenciales no configuradas.' };

    const inputHash = await hashString(answer.trim().toLowerCase());
    if (inputHash === sec.credentials.securityAnswerHash) {
      storeInstance.updateState(draft => {
        draft.security.isLocked = false;
        draft.security.failedAttempts = 0;
        draft.security.failedAttemptsCount = 0;
        draft.security.lockoutUntil = null;
        if (!draft.security.accessLogs) draft.security.accessLogs = [];
        draft.security.accessLogs.unshift({
          id: 'log_' + Date.now(),
          date: new Date().toISOString(),
          type: 'login_success',
          description: 'Acceso concedido y desbloqueado mediante Pregunta de Seguridad.'
        });
      });
      return { success: true };
    } else {
      storeInstance.updateState(draft => {
        if (!draft.security.accessLogs) draft.security.accessLogs = [];
        draft.security.accessLogs.unshift({
          id: 'log_' + Date.now(),
          date: new Date().toISOString(),
          type: 'failed_attempt',
          description: 'Respuesta de seguridad incorrecta.'
        });
      });
      return { success: false, message: 'Respuesta a la pregunta de seguridad incorrecta.' };
    }
  },

  lockApp(reason: 'manual' | 'auto_inactivity' | 'logout' = 'manual') {
    storeInstance.updateState(draft => {
      draft.security.isLocked = true;
      if (!draft.security.accessLogs) draft.security.accessLogs = [];
      
      let desc = 'Bloqueo del sistema activado manualmente.';
      let logType: 'locked' | 'auto_locked' | 'logout_locked' = 'locked';
      
      if (reason === 'auto_inactivity') {
        desc = 'Sistema bloqueado automáticamente por inactividad del usuario.';
        logType = 'auto_locked';
      } else if (reason === 'logout') {
        desc = 'Cierre de sesión y bloqueo presidencial activado. Todos los cambios han sido guardados.';
        logType = 'logout_locked';
      }

      draft.security.accessLogs.unshift({
        id: 'log_' + Date.now(),
        date: new Date().toISOString(),
        type: logType,
        description: desc
      });
    });
  },

  logoutAndLock() {
    this.lockApp('logout');
  }
};

export const CrisisStore = {
  getCrisisData(): CrisisCenterData {
    return storeInstance.getState().crisis;
  },

  toggleCrisis(active: boolean, level: 'low' | 'medium' | 'high' | 'critical' = 'high') {
    storeInstance.updateState(draft => {
      draft.crisis.isCrisisActive = active;
      draft.crisis.crisisLevel = level;
    });
  }
};
