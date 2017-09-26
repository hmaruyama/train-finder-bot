# 画像DE路線当てBOT

※これを動かすには[駅すぱあとWebサービス フリープラン](https://ekiworld.net/service/lp/webservice/)のアクセスキーが必要です！
アクセスキーは[こちら](https://ekiworld.net/free_provision/index.php)から無料で申し込みできます。

## 起動方法

### 必要なツール
以下のツールをローカルにインストールします。

* Node.js http://nodejs.org
* Bot Framework Channel Emulator https://emulator.botframework.com/
* ngrok https://ngrok.com/download

### コードのクローン

```sh
$ git clone https://github.com/hmaruyama/train-finder-bot.git
$ cd train-finder-bot
$ npm install # 必要なモジュールをインストール
```

### .envファイルの作成

*train-finder-bot* ディレクトリ直下に、 *.env* ファイルを作成し、以下の値を埋めます。

```
CUSTOM_VISION_API_URI={{custom vision api のエンドポイント}}
CUSTOM_VISION_PREDICTION_KEY={{custom vision のprediction key}}
EKISPERT_ACCESS_KEY={{駅すぱあとwebサービスのアクセスキー}}
```

### Bot Framework Channel Emulator の設定

Bot Framework Channel Emulator を立ち上げます。
メニューの *App Settings* を開き、ダウンロードしたngrokのパスを記述します。
*Bypass ngrok for local addresses* と書かれたチェックボックスがありますが、必ずチェックを外してください。

### 起動

*train-finder-bot* ディレクトリ直下で、以下のコマンドを実行し、BOTを起動します。

```sh
$ node app.js
```

BOTが起動されると、リクエストをリスンするポート番号がコンソールに表示されます。

Bot Framework Channel Emulator を立ち上げます。
ウィンドウ上部の`Enter your endpoint URL`をクリックし、以下のURLを入力します。

```
http://localhost:ポート番号/api/messages
```

`Microsoft App ID`と`Microsoft App Password`を指定する画面が表示されますが、空欄のまま`Connect`ボタンをクリックします。

以上でエミュレーターを使用する準備ができました。

下部入力エリアの画像アイコンをクリック、ローカルに保存された路線画像をBOTに送信すると、路線を判別してそれに付随する駅を列挙してくれます。
