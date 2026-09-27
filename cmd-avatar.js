const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('ユーザーのアイコンを表示します')
    .addUserOption((option) =>
      option.setName('user').setDescription('対象のユーザー（省略時は自分）')
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const embed = new EmbedBuilder()
      .setColor(0xeb459e)
      .setTitle(`${target.username} のアイコン`)
      .setImage(target.displayAvatarURL({ size: 1024 }));

    await interaction.reply({ embeds: [embed] });
  },
};
