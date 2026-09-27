const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('ユーザーの情報を表示します')
    .addUserOption((option) =>
      option.setName('user').setDescription('対象のユーザー（省略時は自分）')
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(target.id).catch(() => null)
      : null;

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle(`${target.username} の情報`)
      .setThumbnail(target.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ユーザーID', value: target.id, inline: true },
        {
          name: 'アカウント作成日',
          value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`,
          inline: true,
        }
      );

    if (member) {
      embed.addFields({
        name: 'サーバー参加日',
        value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
