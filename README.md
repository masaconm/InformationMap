# 課題 - Information Map

## ② 課題内容（どんな作品か）

- このプロジェクトは、Google Maps を中心に動的な情報データ表示とユーザーインタラクションを組み合わせたアプリケーションのデモとなります。  
  サンプルデータでは特定の地域における安全情報を設定し、情報を地図とリストで表示させています。

## ③ DEMO

デプロイしている場合は URL を記入（任意）

## ④ 工夫した点・こだわった点

- ユーザーが直感的に操作できるよう、以下のプログラム構成としました。

- 地図の初期化 (initMap)  
  Google Maps とジオコーダー（Geocoder）のセットアップ。  
  地図の表示設定（初期中心位置とズームレベル）とデータの取得を開始。

- データ処理  
  データをカテゴリに分類し、各カテゴリのデータを地図とリストに反映（`categorizeData`、`processData`）。

- 地図上での視覚的な情報提示  
  各住所に基づきマーカーと円を描画し、視覚的に情報を区別。  
  カテゴリに応じて異なる円の色を設定。  
  同じ場所に情報が複数ある場合、マーカーのラベルを更新して件数を表示。

- 情報ウィンドウの表示・管理  
  住所クリック時に情報ウィンドウを表示し、詳細情報をタブ形式で切り替え可能。  
  タブのデザインと切り替え操作をスムーズに実装。

- リストの管理  
  各カテゴリごとにリストを作成し、リスト項目をクリックすると該当住所へ地図を移動。

- 情報ウィンドウの管理  
  住所クリック時に関連情報をウィンドウに表示（`displayInfoWindow`）。  
  複数の情報がある場合はタブで切り替え可能。

- ユーザーインタラクション  
  地図、リスト、情報ウィンドウのクリックイベントを動的に処理。

## ⑥ 難しかった点・次回トライしたいこと（又は機能）

- Google Maps API の設定が複雑で難しかったです。  
- 表示データをサーバーサイドで管理する仕様にしたいです。

## ⑦ 質問・疑問・感想、シェアしたいこと等なんでも
