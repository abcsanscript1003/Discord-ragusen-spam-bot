const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// 四則演算・括弧・小数のみを許可する安全な電卓（evalは使わない）
function safeCalculate(expr) {
  const sanitized = expr.replace(/\s+/g, '');
  if (!/^[0-9+\-*/().]+$/.test(sanitized)) {
    throw new Error('使用できるのは数字と + - * / ( ) のみです。');
  }

  let pos = 0;
  const peek = () => sanitized[pos];
  const consume = () => sanitized[pos++];

  function parseExpression() {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = consume();
      const rhs = parseTerm();
      value = op === '+' ? value + rhs : value - rhs;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (peek() === '*' || peek() === '/') {
      const op = consume();
      const rhs = parseFactor();
      if (op === '/' && rhs === 0) throw new Error('0で割ることはできません。');
      value = op === '*' ? value * rhs : value / rhs;
    }
    return value;
  }

  function parseFactor() {
    if (peek() === '(') {
      consume();
      const value = parseExpression();
      if (peek() !== ')') throw new Error('括弧が閉じられていません。');
      consume();
      return value;
    }
    if (peek() === '-') {
      consume();
      return -parseFactor();
    }
    let start = pos;
    while (peek() !== undefined && /[0-9.]/.test(peek())) pos++;
    if (start === pos) throw new Error('式が正しくありません。');
    return parseFloat(sanitized.slice(start, pos));
  }

  const result = parseExpression();
  if (pos !== sanitized.length) throw new Error('式が正しくありません。');
  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('calc')
    .setDescription('簡単な計算をします（+ - * / 括弧に対応）')
    .addStringOption((o) =>
      o.setName('expression').setDescription('例: (3+5)*2').setRequired(true)
    ),
  async execute(interaction) {
    const expr = interaction.options.getString('expression');
    try {
      const result = safeCalculate(expr);
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('🧮 計算結果')
        .addFields(
          { name: '式', value: `\`${expr}\`` },
          { name: '結果', value: `${result}` }
        );
      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await interaction.reply({
        content: `⚠️ ${err.message}`,
        ephemeral: true,
      });
    }
  },
};
