require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events, REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('DISCORD_TOKEN と CLIENT_ID を .env（またはRailwayの環境変数）に設定してください。');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// コマンドを動的に読み込み（ルート直下の cmd-*.js を対象）
client.commands = new Collection();
const commandFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.startsWith('cmd-') && file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, file));
  client.commands.set(command.data.name, command);
}

// 起動のたびにスラッシュコマンドを自動登録（手動でdeploy-commandsを実行しなくてOK）
async function registerCommands() {
  const body = [...client.commands.values()].map((c) => c.data.toJSON());
  const rest = new REST().setToken(DISCORD_TOKEN);
  const route = GUILD_ID
    ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    : Routes.applicationCommands(CLIENT_ID);

  try {
    const data = await rest.put(route, { body });
    console.log(`✅ スラッシュコマンドを自動登録しました（${data.length}件）`);
  } catch (err) {
    console.error('⚠️ スラッシュコマンドの自動登録に失敗しました:', err);
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ ログイン完了: ${client.user.tag}`);
  await registerCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`コマンド実行エラー (${interaction.commandName}):`, error);
    const errorMessage = {
      content: '⚠️ コマンドの実行中にエラーが発生しました。',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(DISCORD_TOKEN);
