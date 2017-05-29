# TwbColumnRenamer

Tableau Desktop の基礎集計支援アプリです。  
.twb ファイルのデータソースのカラム名を一括で置換します。

## Demo
https://taiga.github.io/tableau/TwbColumnRenamer/

## 注意事項
- 読み込んだ .twb ファイルのカラムは `データソース順` に出力 ( 置換 )
- `非表示のフィールド` も置換対象に含まれる
- `ビン`, `計算`, `グループ` などのユーザフィールドは置換対象外
- **書き出した .twb ファイルは必ず Tableau Desktop で開いて上書き保存してください ( 重要 )**

## サポート環境
- Google Chrome
- Tableau Desktop 10.2

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
