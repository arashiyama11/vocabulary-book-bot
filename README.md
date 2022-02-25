# 単語帳bot v13
discord上に自身で問題と正解を書き、それをテスト出来るbotです。
  
# 招待  
招待完了時に「単語帳bot」カテゴリーを作り、その中に「単語帳ターミナル」チャンネルを作成します。  
https://discord.com/api/oauth2/authorize?client_id=930741140498550835&permissions=93264&scope=bot  
  
# コマンド一覧
##  !  
discord上にコマンド一覧表を表示します。  

## !mkch
問題用のチャンネルを作成します。
作成されたチャンネルでは不正な構文は自動的に削除されます。
#### 構文
`!mkch,channelName`  
`!新しい問題チャンネル,channelName`  
#### 引数
* channelName  
作成するチャンネルの名前です。チャンネル名が既にサーバー内にある場合、失敗します。


## !start
テストを開始します。
#### 構文
  `!start,channelName,type`  
  `!テスト開始,channelName,type`  
#### 引数
* `channelName`  
    テストを開始するチャンネルの名前です。  
* `type`  
   テストの形式を0~2の整数で指定します。  
    * `0`  
    botが問題文を表示し、通常通りに回答します。  
    * `1`  
    `0`と逆にbotが回答を表示し、問題文を回答します。  
    * `2`  
      `0`,`1`のランダムです。  
## !stop  
テストを途中終了します。　  
#### 構文  
`!stop`  
`!テスト強制終了`  
　　









# 問題用チャンネル内
## 問題の構文  
`問題文//回答`  
問題用のチャンネルないでは「//」が含まれていないメッセージは即座に削除されます。
また、一つのチャンネルに100題以上の問題があると、古いメッセージから順番に読み込まれ、100題名以降は読み込まれません。`!numbering`,`!ナンバリング`コマンドで題数を数えられます。

# 製作者  
## [jinjanow](https://twitter.com/mejiroship)
### 
### sorce-code https://github.com/jinjanow/Vocabulary-Book-Bot