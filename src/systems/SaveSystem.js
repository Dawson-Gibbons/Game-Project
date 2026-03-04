import { SAVE_KEY } from '../utils/constants.js';

const SAVE_VERSION = 1;

export class SaveSystem {
    static save(playerData) {
        const saveObj = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            data: playerData
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(saveObj));
    }

    static load() {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        try {
            const saveObj = JSON.parse(raw);
            return saveObj.data;
        } catch (e) {
            return null;
        }
    }

    static hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    static deleteSave() {
        localStorage.removeItem(SAVE_KEY);
    }
}
