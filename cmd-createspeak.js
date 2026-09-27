const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createspeak')
    .setDescription('チャンネルを作成し、そこで指定回数発言します')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((o) =>
      o.setName('content').setDescription('発言する内容').setRequired(true)
    )
    .addStringOption((o) =>
      o.setName('name').setDescription('作成するチャンネル名').setRequired(true)
    )
    .addIntegerOption((o) =>
      o
        .setName('channels')
        .setDescription('作成するチャンネル数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(50)
    )
    .addIntegerOption((o) =>
      o
        .setName('times')
        .setDescription('各チャンネルで発言する回数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20)
    ),
  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: 'このコマンドはサーバー内でのみ使用できます。',
        ephemeral: true,
      });
    }

    const content = interaction.options.getString('content');
    const baseName = interaction.options.getString('name');
    const channelCount = interaction.options.getInteger('channels');
    const times = interaction.options.getInteger('times');

    await interaction.deferReply({ ephemeral: true });

    const created = [];
    const failed = [];

    for (let i = 1; i <= channelCount; i++) {
      const channelName = channelCount > 1 ? `${baseName}-${i}` : baseName;
      try {
        const channel = await interaction.guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          reason: `${interaction.user.tag} による作成 (/createspeak)`,
        });
        created.push(channel);

        for (let j = 0; j < times; j++) {
          await channel.send(content);
          await sleep(400); // レート制限対策
        }
      } catch (err) {
        console.error('createspeak エラー:', err);
        failed.push(channelName);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(created.length ? 0x57f287 : 0xed4245)
      .setTitle('📢 チャンネル作成 & 発言 完了')
      .addFields(
        {
          name: '作成成功',
          value: created.length
            ? created.map((c) => `<#${c.id}>（${times}回発言）`).join('\n')
            : 'なし',
        },
        { name: '作成失敗', value: failed.length ? failed.join(', ') : 'なし' }
      );

    await interaction.editReply({ embeds: [embed] });
  },
};
