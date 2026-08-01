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

    storeInstance.updateState(draft => {
      draft.security.isSetupComplete = true;
      draft.security.isLocked = false;
      draft.security.userProfile = {
        fullName,
        title: 'Presidente',
        avatarUrl: ''
      };
      draft.security.credentials = {
        pinHash,
        securityQuestion: question,
        securityAnswerHash: answerHash,
        passphraseHash: passHash
      };
    });
  },

  async verifyPin(pin: string): Promise<boolean> {
    const sec = this.getSecurityData();
    if (!sec.credentials) return false;

    const inputHash = await hashString(pin);
    if (inputHash === sec.credentials.pinHash) {
      storeInstance.updateState(draft => {
        draft.security.isLocked = false;
        draft.security.failedAttempts = 0;
      });
      return true;
    } else {
      storeInstance.updateState(draft => {
        draft.security.failedAttempts = (draft.security.failedAttempts || 0) + 1;
      });
      return false;
    }
  },

  async verifySecurityAnswer(answer: string): Promise<boolean> {
    const sec = this.getSecurityData();
    if (!sec.credentials) return false;

    const inputHash = await hashString(answer.trim().toLowerCase());
    if (inputHash === sec.credentials.securityAnswerHash) {
      storeInstance.updateState(draft => {
        draft.security.isLocked = false;
        draft.security.failedAttempts = 0;
      });
      return true;
    }
    return false;
  },

  lockApp() {
    storeInstance.updateState(draft => {
      draft.security.isLocked = true;
    });
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
