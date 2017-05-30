# TwbColumnRenamer
Tableau Desktop の基礎集計支援アプリです。  
Tableau ワークブック (.twb) ファイルのデータソースのカラム名を一括で置換します。

## Demo
https://taiga.github.io/tableau/TwbColumnRenamer/

## 使い方
- 上記 Demo ページを開き `[Select .twb file]` ボタンを押して、手元の .twb ファイルを選択する
- 選択した .twb ファイルのデータソースのカラム名が一覧表示される
- 右側のテキストエリアに置換文字列を入力する
  - 改行区切り
  - 空白行のカラムはスキップ
- `[Replace &amp; Export .twb]` ボタンを押すと、任意の文字列に置換された `≪元のファイル名≫_replace.twb` が出力される
- 書き出された .twb ファイルを Tableau Desktop で開き上書き保存する

## 注意事項
- 読み込んだ .twb ファイルのカラムは `データソース順` に置換して出力
- `非表示のフィールド` も置換対象に含まれる
- `ビン`, `計算`, `グループ` などのユーザ定義フィールドは置換対象外
- Tableau パッケージド ワークブック (.twbx) ファイルは非サポート
- **書き出した .twb ファイルは必ず Tableau Desktop で開いて上書き保存してください ( 重要 )**

## サポート環境
- Google Chrome
- Tableau Desktop 10.2 ( 多少のバージョン違いは問題ないと思いますが… )

## QA
- Q: 書き出した .twb ファイルが開けない
  - A: 不具合です。動作環境と、置換元となる .twb を添えて issue にてお知らせください 

## 環境構築

```
$ npm install
```

## ビルド

#### 開発版
```
$ npm run build
```

#### リリース版
```
$ npm run build:prod
```

### ライセンス
MIT
