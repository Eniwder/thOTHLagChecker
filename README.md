# 非想天則で対戦前にラグを計測するためのもの

- クライアントがホストに凸る前に不安な時に使えます
- 7回pingを送って、それぞれのラグをフレーム単位でプロットします
- 起動が少し遅いのは仕様です

## ダウンロード先

[Releases](https://github.com/Eniwder/thOTHLagChecker/releases/tag/latest)の「▼Assets」にある「
th123lagchecker.exe」をクリックでダウンロードできます。

## 使い方

起動すると以下のような画面になるので、IP:PORT の欄にいつもの書式をコピペして CHECK ボタンを押してください。

<img src="https://github.com/Eniwder/thOTHLagChecker/blob/main/sampleImg.png" width="400px">

初回起動時にWindows Defenderの保護設定やFirewallの画面が出た場合は許可しないと動作しません。

## 計測結果について

- ラグが2F以下なら正常に対戦が成立すると思います
- ゲーム中のラグは測定した値 +0~2F になると思うので、測定値が 4F くらいからはgiurollなどを推奨
  - または、Jitter(測定値のばらつき)が大きく頻繁な場合もgiurollをつけたほうが快適かも

## 備考

- Windows 64bit のみ対応
- ラグ100Fはタイムアウトになったものです。大抵の場合、ホストと通信ができていないかパケロスが発生しています
- 原理としては観戦パケットを送るような仕組みなので、ホストに過剰な負荷がかかることは無いはずです
