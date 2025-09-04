import { Client, GatewayIntentBits, Partials } from 'discord.js';

export function createClient() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages
        ],
        partials: [
            Partials.Channel,
            Partials.Message,
            Partials.User,
            Partials.GuildMember
        ]
    });

    return client;
}