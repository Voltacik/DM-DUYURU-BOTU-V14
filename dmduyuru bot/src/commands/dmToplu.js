import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { EmbedCreator } from '../utils/embedCreator.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import DatabaseManager from '../database/database.js';

const rateLimiter = new RateLimiter();

export const dmTopluCommand = {
    data: new SlashCommandBuilder()
        .setName('dm_toplu')
        .setDescription('Belirlenen sunuculardaki tüm üyelere özelleştirilebilir bir embed mesajı ile toplu DM gönderir.')
        .addStringOption(option =>
            option.setName('sunucu_idler')
                .setDescription('DM gönderilecek sunucuların ID\'leri (virgülle ayrılmış)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mesaj_baslik')
                .setDescription('Gönderilecek embed mesajın başlığı')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('mesaj_icerik')
                .setDescription('Gönderilecek embed mesajın ana içeriği')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('embed_renk')
                .setDescription('Embed mesajın rengi (HEX formatında, örn: #FF0000)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        console.log(` ${interaction.user.tag} tarafından dm_toplu komutu başlatıldı`);

        try {
        
            const sunucuIdlerStr = interaction.options.getString('sunucu_idler');
            const mesajBaslik = interaction.options.getString('mesaj_baslik');
            const mesajIcerik = interaction.options.getString('mesaj_icerik');
            const embedRenk = interaction.options.getString('embed_renk') || '#0099ff';

       
            const sunucuIdleri = sunucuIdlerStr.split(',').map(id => id.trim());

         
            await interaction.reply({
                embeds: [EmbedCreator.createSystemEmbed(
                    '🚀 İşlem Başlatıldı',
                    `Toplu DM gönderimi başlatılıyor...\n📋 Hedef Sunucu Sayısı: ${sunucuIdleri.length}\n⏱️ Tahmini süre: ${Math.ceil(sunucuIdleri.length * 2)} dakika`,
                    'info'
                )],
                ephemeral: true
            });

  
            let toplamBasarili = 0;
            let toplamBasarisiz = 0;
            let toplamHedef = 0;
            const islenenSunucular = [];

       
            for (const sunucuId of sunucuIdleri) {
                try {
                    console.log(`🔍 Sunucu işleniyor: ${sunucuId}`);
                    
                    const guild = await interaction.client.guilds.fetch(sunucuId).catch(() => null);
                    
                    if (!guild) {
                        console.warn(`⚠️ Sunucu bulunamadı veya erişim reddedildi: ${sunucuId}`);
                        islenenSunucular.push({
                            id: sunucuId,
                            name: 'Bilinmeyen Sunucu',
                            basarili: 0,
                            basarisiz: 0,
                            hata: 'Sunucu bulunamadı'
                        });
                        continue;
                    }

                 
                    if (!guild.members.me.permissions.has(PermissionFlagsBits.ReadMessageHistory)) {
                        console.warn(`⚠️ Sunucuda yeterli yetki yok: ${guild.name} (${sunucuId})`);
                        islenenSunucular.push({
                            id: sunucuId,
                            name: guild.name,
                            basarili: 0,
                            basarisiz: 0,
                            hata: 'Yeterli yetki yok'
                        });
                        continue;
                    }

                    let sunucuBasarili = 0;
                    let sunucuBasarisiz = 0;

                    try {
                  
                        const members = await guild.members.fetch();
                        const humanMembers = members.filter(member => !member.user.bot);
                        
                        console.log(`👥 ${guild.name} sunucusunda ${humanMembers.size} üye bulundu`);
                        toplamHedef += humanMembers.size;

                     
                        const dmEmbed = EmbedCreator.createBulkDMEmbed(mesajBaslik, mesajIcerik, embedRenk);

                      
                        for (const [memberId, member] of humanMembers) {
                            try {
                                await rateLimiter.waitForRateLimit();
                                
                                await member.send({ embeds: [dmEmbed] });
                                sunucuBasarili++;
                                toplamBasarili++;
                                
                                console.log(`✅ DM gönderildi: ${member.user.tag}`);
                            } catch (dmError) {
                                sunucuBasarisiz++;
                                toplamBasarisiz++;
                                
                                console.warn(`⚠️ DM gönderilemedi: ${member.user.tag} - ${dmError.message}`);
                            }
                        }

                    } catch (memberFetchError) {
                        console.error(`❌ Üye listesi alınamadı: ${guild.name} - ${memberFetchError.message}`);
                        islenenSunucular.push({
                            id: sunucuId,
                            name: guild.name,
                            basarili: 0,
                            basarisiz: 0,
                            hata: 'Üye listesi alınamadı'
                        });
                        continue;
                    }

                    islenenSunucular.push({
                        id: sunucuId,
                        name: guild.name,
                        basarili: sunucuBasarili,
                        basarisiz: sunucuBasarisiz,
                        hata: null
                    });

                    console.log(` ${guild.name} tamamlandı - Başarılı: ${sunucuBasarili}, Başarısız: ${sunucuBasarisiz}`);

                } catch (guildError) {
                    console.error(`❌ Sunucu işleme hatası: ${sunucuId} - ${guildError.message}`);
                    islenenSunucular.push({
                        id: sunucuId,
                        name: 'Hata',
                        basarili: 0,
                        basarisiz: 0,
                        hata: guildError.message
                    });
                }
            }

        
            try {
                await DatabaseManager.logBulkDM({
                    gonderen_kullanici_id: interaction.user.id,
                    gonderen_kullanici_tag: interaction.user.tag,
                    mesaj_baslik: mesajBaslik,
                    mesaj_icerik: mesajIcerik,
                    embed_renk: embedRenk,
                    hedef_sunucular: sunucuIdlerStr,
                    basarili_gonderim: toplamBasarili,
                    basarisiz_gonderim: toplamBasarisiz,
                    toplam_hedef: toplamHedef
                });
            } catch (dbError) {
                console.error('❌ Veritabanı kayıt hatası:', dbError);
            }

     
            const basariOrani = toplamHedef > 0 ? ((toplamBasarili / toplamHedef) * 100).toFixed(1) : 0;
            
            let raporIcerik = `📊 **İşlem Özeti**\n\n`;
            raporIcerik += `✅ **Başarılı Gönderim:** ${toplamBasarili}\n`;
            raporIcerik += `❌ **Başarısız Gönderim:** ${toplamBasarisiz}\n`;
            raporIcerik += `🎯 **Toplam Hedef:** ${toplamHedef}\n`;
            raporIcerik += `📈 **Başarı Oranı:** %${basariOrani}\n\n`;
            
            if (islenenSunucular.length > 0) {
                raporIcerik += `📋 **Sunucu Detayları:**\n`;
                islenenSunucular.forEach((sunucu, index) => {
                    const durum = sunucu.hata ? `❌ ${sunucu.hata}` : `✅ ${sunucu.basarili}/${sunucu.basarili + sunucu.basarisiz}`;
                    raporIcerik += `${index + 1}. **${sunucu.name}** - ${durum}\n`;
                });
            }

        
            await interaction.followUp({
                embeds: [EmbedCreator.createSystemEmbed(
                    '🎉 Toplu DM İşlemi Tamamlandı!',
                    raporIcerik,
                    toplamBasarili > toplamBasarisiz ? 'success' : 'warning'
                )],
                ephemeral: true
            });

            console.log(`✅ Toplu DM işlemi tamamlandı - Başarılı: ${toplamBasarili}, Başarısız: ${toplamBasarisiz}`);

        } catch (error) {
            console.error('❌ Komut çalıştırma hatası:', error);
            
         
            const errorEmbed = EmbedCreator.createSystemEmbed(
                '❌ Beklenmeyen Hata',
                'Toplu DM gönderimi sırasında beklenmeyen bir hata meydana geldi. Lütfen bot geliştiricisine başvurun.',
                'error'
            );

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};