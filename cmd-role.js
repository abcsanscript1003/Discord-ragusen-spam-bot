const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('ユーザーにロールを付与・剥奪します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption((o) =>
      o.setName('user').setDescription('対象のユーザー').setRequired(true)
    )
    .addRoleOption((o) =>
      o.setName('role').setDescription('対象のロール').setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName('action')
        .setDescription('付与するか剥奪するか')
        .setRequired(true)
        .addChoices(
          { name: '付与', value: 'add' },
          { name: '剥奪', value: 'remove' }
        )
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const target = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getString('action');

    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: '⚠️ そのユーザーはこのサーバーにいません。',
        ephemeral: true,
      });
    }

    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: '⚠️ このロールはBotのロールより上位、または同じ位置にあるため操作できません。Botのロールをそのロールより上に移動してください。',
        ephemeral: true,
      });
    }

    try {
      if (action === 'add') {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (err) {
      console.error('role エラー:', err);
      return interaction.reply({
        content: '⚠️ ロールの変更に失敗しました。',
        ephemeral: true,
      });
    }

    const embed = new EmbedBuilder()
      .setColor(action === 'add' ? 0x57f287 : 0xed4245)
      .setTitle(action === 'add' ? '✅ ロールを付与しました' : '❌ ロールを剥奪しました')
      .addFields(
        { name: '対象', value: `<@${target.id}>`, inline: true },
        { name: 'ロール', value: `<@&${role.id}>`, inline: true },
        { name: '実行者', value: `<@${interaction.user.id}>`, inline: true }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
