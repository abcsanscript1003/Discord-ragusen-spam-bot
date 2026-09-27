const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Botに埋め込みメッセージを発言させます')
    .addStringOption((o) =>
      o.setName('message').setDescription('発言内容').setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString('message');
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setDescription(message)
      .setFooter({ text: `${interaction.user.username} より` });

    await interaction.reply({ embeds: [embed] });
  },
};
