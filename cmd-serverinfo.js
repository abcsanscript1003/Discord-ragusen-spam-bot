const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('このサーバーの情報を表示します'),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'メンバー数', value: `${guild.memberCount}`, inline: true },
        { name: 'サーバーID', value: guild.id, inline: true },
        {
          name: '作成日',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: 'オーナー',
          value: `<@${guild.ownerId}>`,
          inline: true,
        }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
