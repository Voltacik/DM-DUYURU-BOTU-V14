import { Events } from 'discord.js';

export const readyEvent = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log('🤖 Bot hazır! Giriş yapılan hesap:', client.user.tag);
        console.log(`📊 Bot ${client.guilds.cache.size} sunucuda aktif`);
        console.log(`👥 Toplam ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} üyeye erişim var`);
        
        // Bot durumunu güncelle
        client.user.setActivity('Volta DM Duyuru| /dm_toplu', { 
            type: 'WATCHING' 
        });

        console.log('✅ Bot başarıyla başlatıldı ve komutlar aktif!');
    }
};