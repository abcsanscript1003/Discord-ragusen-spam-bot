const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('利用できるコマンド一覧を表示します'),
  async execute(interaction) {
    const commands = interaction.client.commands;
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('📖 コマンド一覧')
      .setDescription(
        commands
          .map((cmd) => `**/${cmd.data.name}** — ${cmd.data.description}`)
          .join('\n')
      )
      .setFooter({ text: `合計 ${commands.size} コマンド` });

    await interaction.reply({ embeds: [embed] });
  },
};
