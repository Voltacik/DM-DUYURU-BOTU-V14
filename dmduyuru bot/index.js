import dotenv from 'dotenv';
import { createClient } from './src/client.js';
import { deployCommands } from './src/deploy-commands.js';
import { readyEvent } from './src/events/ready.js';
import { interactionCreateEvent } from './src/events/interactionCreate.js';
import DatabaseManager from './src/database/database.js';


dotenv.config();


if (!process.env.DISCORD_TOKEN) {
    console.error(' DISCORD_TOKEN ortam değişkeni bulunamadı!');
    console.error(' .env dosyasını oluşturun ve bot token\'ınızı ekleyin.');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error(' CLIENT_ID ortam değişkeni bulunamadı!');
    console.error(' .env dosyasına bot\'un client ID\'sini ekleyin.');
    process.exit(1);
}

console.log('🚀 Discord Toplu DM Bot başlatılıyor...');


const client = createClient();


client.once(readyEvent.name, (...args) => readyEvent.execute(...args));
client.on(interactionCreateEvent.name, (...args) => interactionCreateEvent.execute(...args));


client.on('error', error => {
    console.error('❌ Discord Client hatası:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ Yakalanmamış Promise hatası:', error);
});

process.on('uncaughtException', error => {
    console.error('❌ Yakalanmamış istisna:', error);
    process.exit(1);
});


process.on('SIGINT', () => {
    console.log('\n🛑 Bot kapatılıyor...');
    
    if (DatabaseManager) {
        DatabaseManager.close();
    }
    
    if (client) {
        client.destroy();
    }
    
    console.log('👋 Bot güvenli bir şekilde kapatıldı');
    process.exit(0);
});

async function startBot() {
    try {

        console.log(' Slash komutlar kaydediliyor...');
        const commandsDeployed = await deployCommands();
        
        if (!commandsDeployed) {
            console.error(' Komutlar kaydedilemedi, bot başlatılmıyor.');
            return;
        }

 
        console.log(' Discord\'a bağlanılıyor...');
        await client.login(process.env.DISCORD_TOKEN);
        
    } catch (error) {
        console.error('❌ Bot başlatma hatası:', error);
        
        if (DatabaseManager) {
            DatabaseManager.close();
        }
        
        process.exit(1);
    }
}


startBot();