# Discord Bot (discord.js v14)

`/ping` `/help` `/userinfo` `/serverinfo` `/avatar` `/poll` を備えたスラッシュコマンドBotです。

## 構成

```
discord-bot/
├── cmd-*.js          # 各スラッシュコマンド（ルート直下）
├── index.js          # Bot本体
├── deploy-commands.js # コマンド登録用スクリプト（通常は不要、自動登録される）
├── package.json
├── Procfile           # Railway用の起動設定
└── .env.example
```

## 1. Discord側の準備

1. https://discord.com/developers/applications で新規アプリケーションを作成
2. 左メニュー **Bot** → `Reset Token` でトークンを取得（`DISCORD_TOKEN`）
3. 同ページで以下のIntentは今回のコマンド構成では不要（オンにしなくてOK）
4. 左メニュー **OAuth2 → General** の `Application ID` が `CLIENT_ID`
5. **OAuth2 → URL Generator** で `bot` と `applications.commands` にチェックし、
   Bot Permissions は `Send Messages` `Embed Links` `Add Reactions` `Read Message History` `Manage Channels` を選択
6. 生成されたURLをブラウザで開き、Botを自分のサーバーに招待

## 2. GitHubへアップロード（ブラウザだけでOK）

1. スマホの「ファイル」アプリ（Files by Googleなど）でダウンロードした`discord-bot.zip`を開き、**展開/解凍**する（zipを長押し→「展開」）
2. github.comを開き、右上の「+」→「New repository」→ 名前を入力して「Create repository」（READMEなどは追加しない）
3. 作成されたリポジトリ画面で **Add file → Upload files**
4. 「choose your files」をタップし、さっき展開したフォルダの中身を**まとめて全選択**（`.env`以外の全ファイル）
5. 一番下までスクロールして **Commit changes**

これで1回のアップロードで全ファイルが上がります。フォルダ構造を気にする必要はありません（コマンドファイルは全部ルート直下に`cmd-`という名前で置いてあります）。

`.env.example`はアップロードしてOKですが、もし`.env`という名前のファイルを自分で作ってトークンを書いた場合は**絶対にアップロードしないでください**（今回はRailway側で直接環境変数を入力するので、`.env`ファイル自体作る必要はありません）。

## 3. Railwayへデプロイ

スマホのブラウザで https://railway.app を開けばOKです。

1. https://railway.app にログインし **New Project → Deploy from GitHub repo** を選択
2. 今回のリポジトリを選択
3. **Variables** タブで環境変数を設定
   - `DISCORD_TOKEN`
   - `CLIENT_ID`
   - （任意）`GUILD_ID`
4. Railwayが自動で `npm install` → `node index.js`（Procfileのworker）で起動
5. デプロイ後、Railwayの **Deployments** ログで `✅ ログイン完了` と `✅ スラッシュコマンドを自動登録しました` が出ればOK

### スラッシュコマンドの登録について

Bot起動のたびに自動でDiscordへコマンドが登録されるので、`deploy-commands.js`を手動で実行する必要はありません。コマンドを追加・変更した場合も、Railway上でBotが再起動すれば自動で反映されます。
（`GUILD_ID`を環境変数に設定すると、そのサーバーだけ即座に反映されます。未設定だとグローバル登録となり反映まで最大1時間ほどかかります。）

## コマンド一覧

| コマンド | 説明 |
|---|---|
| `/ping` | Botの応答速度を表示 |
| `/help` | コマンド一覧を表示 |
| `/userinfo [user]` | ユーザー情報を表示 |
| `/serverinfo` | サーバー情報を表示 |
| `/avatar [user]` | アイコン画像を表示 |
| `/poll <question> <option1> <option2> ...` | リアクション投票を作成 |
| `/say <message>` | Botに埋め込みメッセージを発言させる |
| `/roll [sides] [count]` | サイコロを振る |
| `/coinflip` | コインを投げる |
| `/choose <options>` | カンマ区切りの選択肢からランダム選択 |
| `/8ball <question>` | マジック8ボールに質問する |
| `/rps <hand>` | Botとじゃんけん |
| `/quote` | ランダムな格言を表示 |
| `/timestamp` | 現在時刻をDiscordタイムスタンプ形式で表示 |
| `/calc <expression>` | 四則演算・括弧に対応した電卓 |
| `/remind <minutes> <message>` | 指定分数後にリマインド（Bot再起動で消える簡易実装） |
| `/clear` | チャンネルを選択して削除（複数選択可・要確認） |
| `/createspeak <content> <name> <channels> <times>` | チャンネルを作成し、各チャンネルで指定回数発言 |

`/clear` と `/createspeak` は「チャンネル管理」権限を持つメンバーのみ実行できます（`setDefaultMemberPermissions`で制限済み）。加えて、Bot自体にも **チャンネルの管理** 権限が必要です。招待URL生成時（OAuth2 → URL Generator）に `Manage Channels` を選択してください。

## コマンドの追加方法

ルート直下に `cmd-新しい名前.js` というファイルを作り、`data`（SlashCommandBuilder）と `execute` を export すれば自動で読み込まれます。追加後はBotを再起動（Railwayなら再デプロイ）すれば自動でDiscordに反映されます。
