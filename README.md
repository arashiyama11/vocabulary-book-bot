# 単語帳bot v13
discord上に自身で問題と正解を書き、それをテスト出来るbotです。
  
# 招待  
招待完了時に「単語帳bot」カテゴリーを作り、その中に「単語帳ターミナル」チャンネルを作成します。  
招待URL→https://discord.com/api/oauth2/authorize?client_id=930741140498550835&permissions=93264&scope=bot  
  
# コマンド一覧  
単語帳botは半角入力、全角入力の両方の同じコマンドがあります。
以下のコマンドの構文では上が半角、下が全角のコマンドになっています
##  !  
#### 構文  
`!`  
`！`  
discord上にコマンド一覧表を表示します。  

## !mkch
問題用のチャンネルを作成します。
作成されたチャンネルでは不正な構文は自動的に削除されます。
#### 構文
`!mkch,channelName`  
`！問題チャンネル作成、channelName`  
#### 引数
* channelName  
作成するチャンネルの名前です。チャンネル名が既にサーバー内にある場合、失敗します。  
#### 例文  
`!mkch,英単語`  
`！問題チャンネル作成、英単語`  

## !start
テストを開始します。
#### 構文
  `!start,channelName,type`  
  `！テスト開始、channelName、type`  
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
#### 例文  
`!start,英単語,1`  
`！テスト開始、英単語、０`  
## !stop  
テストを途中終了します。　  
#### 構文  
`!stop`  
`！テスト途中終了`  
　　









# 問題用チャンネル内  
## 問題の構文  
`問題文//回答`    





## 例文  
`hello//こんにちは`

問題用のチャンネルないでは「//」が含まれていないメッセージは即座に削除されます。  
また、()のなか及び()自体は質問されますが、省略して回答しても正解になります。  
## 一例  
問題用チャンネル内(仮にチャンネル名を英単語とします)  
```
user:collect//集める(c)
user:gather//集める(g)
user:assemble//集める(a)
```

単語帳ターミナル内      
```
user:!start,英単語,2
bot:テストを開始します
bot:gather
user:集める
bot:集める(a)
user:assemble
bot:collect
user集める(c)
```
このように答えた場合すべて正解になります。  
また、一つのチャンネルに100題以上の問題があると、古いメッセージから順番に読み込まれ、100題名以降は読み込まれません。`!numbering`,`！ナンバリング`コマンドで題数を数えられます。

# 製作者  
## [jinjanow](https://twitter.com/mejiroship)
### 
### sorce-code https://github.com/jinjanow/Vocabulary-Book-Bot