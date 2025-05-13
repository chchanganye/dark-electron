import { defineStore } from 'pinia';

export const useLivechatStore = defineStore('livechat', {
    state: () => ({
        isConnected: false,
        filterUsername: '',
        replySettings: {}
    }),
    actions: {
        async enableAutoReply() {
            await window.electronAPI.startAutoReply({
                filterUsername: this.filterUsername,
                replyItems: this.replyItems,
                settings: this.replySettings
            });
        }
    }
});