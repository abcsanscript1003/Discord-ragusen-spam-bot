require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('DISCORD_TOKEN と CLIENT_ID を .env に設定してください。');
  process.exit(1);
}

const commands = [];
const commandFiles = fs
  .readdirSync(__dirname)
  .filter((file) => file.startsWith('cmd-') && file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(__dirname, file));
  commands.push(command.data.toJSON());
}

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`${commands.length} 件のスラッシュコマンドを登録します...`);

    // GUILD_ID があれば特定サーバーに即時反映（開発向け）
    // 無ければグローバル登録（反映まで最大1時間程度）
    const route = GUILD_ID
      ? Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

    const data = await rest.put(route, { body: commands });

    console.log(`✅ ${data.length} 件のコマンド登録が完了しました。`);
  } catch (error) {
    console.error(error);
  }
})();
