import { Events } from 'discord.js';
import { dmTopluCommand } from '../commands/dmToplu.js';

export const interactionCreateEvent = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.commandName;

        try {
            switch (command) {
                case 'dm_toplu':
                    await dmTopluCommand.execute(interaction);
                    break;
                default:
                    console.warn(`⚠️ Bilinmeyen komut: ${command}`);
            }
        } catch (error) {
            console.error(`❌ Komut çalıştırma hatası (${command}):`, error);
            
            const errorMessage = {
                content: '❌ Komut çalıştırılırken bir hata meydana geldi!',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
};