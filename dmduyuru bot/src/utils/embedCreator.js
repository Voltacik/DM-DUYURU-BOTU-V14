import { EmbedBuilder } from 'discord.js';

export class EmbedCreator {
    /**
     * Toplu DM için embed oluştur
     * @param {string} baslik - Embed başlığı
     * @param {string} icerik - Embed içeriği
     * @param {string} renk - Embed rengi (HEX formatında)
     * @returns {EmbedBuilder}
     */
    static createBulkDMEmbed(baslik, icerik, renk = '#0099ff') {
        try {
           
            let embedRenk = renk;
            if (!renk.startsWith('#')) {
                embedRenk = '#' + renk;
            }
            
           
            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            if (!hexPattern.test(embedRenk)) {
                console.warn(`⚠️ renk geçersiz: ${renk}, varsayılan renk kullanılıyor.`);
                embedRenk = '#0099ff';
            }

            const embed = new EmbedBuilder()
                .setTitle(baslik)
                .setDescription(icerik)
                .setColor(embedRenk)
                .setTimestamp()
                .setFooter({
                    text: 'Toplu DM Sistemi',
                    iconURL: 'https://cdn.discordapp.com/emojis/742738230224527391.png'
                });

            return embed;
        } catch (error) {
            console.error('❌ Embed oluşturma hatası:', error);
            
           
            return new EmbedBuilder()
                .setTitle('Hata')
                .setDescription('Embed oluşturulurken bir hata meydana geldi.')
                .setColor('#ff0000')
                .setTimestamp();
        }
    }

    /**
     * Sistem bildirimi için embed oluştur
     * @param {string} baslik - Bildirim başlığı
     * @param {string} icerik - Bildirim içeriği
     * @param {string} tip - Bildirim tipi (success, error, info, warning)
     * @returns {EmbedBuilder}
     */
    static createSystemEmbed(baslik, icerik, tip = 'info') {
        const renkMap = {
            success: '#00ff00',
            error: '#ff0000',
            warning: '#ffff00',
            info: '#0099ff'
        };

        const embed = new EmbedBuilder()
            .setTitle(baslik)
            .setDescription(icerik)
            .setColor(renkMap[tip] || renkMap.info)
            .setTimestamp();

        return embed;
    }
}