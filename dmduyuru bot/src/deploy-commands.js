import { REST, Routes } from 'discord.js';
import { dmTopluCommand } from './commands/dmToplu.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
    dmTopluCommand.data.toJSON()
];

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

export async function deployCommands() {
    try {
        console.log(`🔄 ${commands.length} komutlar kaydedildi`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ ${data.length} kaydedilme işlemi tamamlandı.`);
        return true;
    } catch (error) {
        console.error('❌ Komutlar kaydedilirken hata:', error);
        return false;
    }
}