require('dotenv').config();
const JSONbig = require("json-bigint")
const fs = require("fs");
const { Client, Util ,MessageEmbed} = require("discord.js")
const options = {
  intents: ["GUILDS", "GUILD_MESSAGES"],
};
const client = new Client(options);
if (!fs.existsSync("./data.json")) {
  fs.writeFileSync("./data.json", JSON.stringify({ guildsData: [], testData: [] }))
}
let { testData, guildsData } = JSONbig.parse(fs.readFileSync("./data.json"))
client.on("ready", () => {
  console.log("bot is running")
  const embed = new MessageEmbed()
    .setTitle("restart log")
    .addField("reason", "botのメンテナンスです。")
    .addField("TimeStamp", new Date().toLocaleString('ja-JP'))
    .addField("!stopLog","ログが送信されなくなります")
    .setColor(7506394)
    .setFooter({ text: "タイトルをクリックすると一番上に移動します" })
  sendAllLog({ embeds: [embed] }, true)
})
function brackets(s) {
  let left = s?.indexOf("(");
  let right = s?.indexOf(")");
  return s?.substring(0, left) + s?.substring(right + 1, s.length);
}
const reaction = (num) => ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"][num];
function sendAllGuild(msg) {
  client.channels.cache.filter(ch => ch.name === "単語帳ターミナル").forEach(ch => ch.send(msg))
}
function sendAllLog(msg, isRestart) {
  client.channels.cache.filter(ch => ch.name === "単語帳log").forEach(async ch => {
    let first
    let last
    if(isRestart){
      [first,last]=(await Promise.all([ch.messages.fetch({limit:1,after:"0"}),ch.messages.fetch({limit:1})])).map(v=>v.first())
      msg.embeds[0].setURL(first.url)
    }else{
      first=(await ch.messages.fetch({ limit: 1, after: "0" })).first()
    }
    if(last.content!=="!stopLog")ch.send(msg)
  })
}
async function editLog(message) {
  const ch = message.guild.channels.cache.find(ch => ch.name === "単語帳log")
  if (ch === undefined) return
  const msg = (await ch.messages.fetch({ limit: 1, after: "0" })).first()
  let body = makeUpdateLog(message, false)
  if (body.length > 2000) {
    body = makeUpdateLog(message, true)
    if (body.length > 2000) {
      body = body.substring(0, 2000)
    }
  }
  msg.edit(body)
}
function makeUpdateLog(message, isEasy) {
  const channelData = guildsData.find(d => d.guildid === message.guild.id)?.channelsData
  if (channelData === undefined) return "まだテストしていません。"
  const result = channelData.map((d) => {
    const chName = message.guild.channels.cache.get(d.channelid).name
    const sfData = d.questionsData.map((value, index) => {
      let s = "　" + (++index) + "問目　正解数:" + value.s + ",不正解数:" + value.f + "\n"
      if (isEasy) s = "　" + (++index) + "　" + value.s + "," + value.f + "\n"
      return s
    })
    return chName + "\n" + sfData.join("")
  })
  return result.join("")
}
client.on("channelDelete", (channel) => {
  const guildData = guildsData.find(d => d.guildid === channel.guild.id)
  if (guildData === undefined) return
  guildData.channelsData = guildData.channelsData.filter(d => d.channelid !== channel.id)
  testData = testData.filter(d => d.channelid !== channel.id)
})
client.on("messageCreate", async message => {
  if (message.author.bot && message.author.username != client.user.username) return
  if (message.channel.type !== "GUILD_TEXT") return;
  if (message.guild.channels.cache.get(message.channel.parentId)?.name !== "単語帳bot") return;
  if (message.channel.name !== "単語帳ターミナル") {
    if (message.author.bot)return
    if (message.channel.name === "単語帳log"){
      if(message.content==="!stopLog")return
      else message.delete()
    }
    if (message.content.split("//").length !== 2) message.delete();
    if (message.content === "！ナンバリング" || message.content === "!numbering") {
      message.channel.messages
        .fetch({ limit: 100, after: "0" })
        .then(msg => {
          let msgs = msg
            .filter(message => !message.author.bot)
            .map(message => message);
          for (let a = 0; a < msgs.length; a++) {
            if (msgs[a].reactions.cache.size != 0) {
              msgs[a].reactions.removeAll()
            }
          }
          const length = msgs.length;
          let b = 0;
          for (let a = length - 1; a >= 0; a--) {
            b++;
            let s = String(b);
            let re = [];
            if (b % 5 === 0) {
              if (s.length === 1) {
                re.push(reaction(b));
              } else if (s.length === 2) {
                re.push(reaction(s[0]));
                re.push(reaction(s[1]));
              }
            } else if (b === 99) {
              re.push("🇪");
              re.push("🇳");
              re.push("🇩");
            }
            for (let c = 0; c < re.length; c++) {
              if (re.length === 2&&re[0] === re[1]) {
                re[1] = "🔁";
              }
              msgs[a].react(re[c]);
            }
          }
        })
        .catch(e => {
          console.log(e);
        });
    }
    return;
  }
  let thisGuildTestData = testData.find(data => data.guildid === message.guild.id);
  if (thisGuildTestData === undefined) {
    testData.push({
      guildid: message.guild.id,
      type: 0,
      testing: false,
      questions: [],
      answers: [],
      trueAns: [],
      tested: [],
      still:[],
      channel: {},
      questionsId: []
    });
    thisGuildTestData = testData.find(data => data.guildid === message.guild.id);
  }else thisGuildTestData.channel = client.channels.cache.get(thisGuildTestData.channel.id)
  if (message.content.startsWith("!mklogch") || message.content.startsWith("！ログチャンネル作成")) {
    if (message.guild.channels.cache.find(ch => ch.name === "単語帳log") !== undefined) return message.channel.send("既にログ用のチャンネルが存在します")
    const logch = await message.guild.channels.create("単語帳log", { parent: message.channel.parent })
    message.channel.send("単語帳logチャンネルを作成しました")
    for (const m of Util.splitMessage(makeUpdateLog(message))) {
      logch.send(m);
    }
    return
  }
  if (message.content.startsWith("！問題チャンネル作成") || message.content.startsWith("!mkch")) {
    let line = message.content.split(/[、,]/g);
    let ch = message.guild.channels.cache.find(channel => channel.name === line[1]);
    if (ch !== undefined) return message.channel.send("このチャンネル名は既に存在しています");
    if (line.length === 2) {
      message.guild.channels.create(line[1], {
        type:"GUILD_TEXT",
        parent: message.guild.channels.cache.find(g => g.name === "単語帳bot")
      }).then(newChannel => {
        newChannel.send("「問題文//解答」の形式で100題未満で入力してください\n「!numbering」または「！ナンバリング」で題数を数えられます\n()の中の文字及び括弧自体は質問はされますが解答されなくても正解になります");
      }).catch(e => console.log(e))
      message.channel.send("問題チャンネル" + line[1] + "を作成しました");
    } else {
      message.channel.send("「!mkch(！新しい問題チャンネル),チャンネル名」の形式で入力し、チャンネル名に”,”と”、”を含まないようにしてください");
    }
  }

  if ((message.content.startsWith("！テスト開始") || message.content.startsWith("!start")) && !thisGuildTestData.testing) {
    let line = message.content.split(/[,、]/g);
    let questionsChannel = message.guild.channels.cache.find(channel => channel.name === line[1]);
    const firstMsg = (await questionsChannel.messages.fetch({ after: "0", limit: 1 })).first()
    if (firstMsg.author.username !== client.user.username||questionsChannel.name==="単語帳log") return message.channel.send("「!mkch」コマンドで作成したチャンネルでしかテストすることが出来ません。")
    if (isNaN(line[2] - 0)) {
      let fullWidthNam = ["０", "１", "２"]
      let index = fullWidthNam.indexOf(line[2])
      if (index === -1) {
        return message.channel.send("typeは0~2で指定してください")
      } else {
        line[2] = index + ""
      }
    }
    thisGuildTestData.type = line[2];
    if (!(thisGuildTestData.type === "0" || thisGuildTestData.type === "1" || thisGuildTestData.type === "2")) return message.channel.send("typeは0~2で指定してください")
    if (questionsChannel === undefined) return message.channel.send("この名前のチャンネルは存在しません")
    thisGuildTestData.channel = questionsChannel
    thisGuildTestData.channelid = questionsChannel.id
    thisGuildTestData.testing = true
    thisGuildTestData.user = message.author.id;
    let messages = await questionsChannel.messages.fetch({ limit: 100, after: "0" })
    let questions= messages
      .filter(message => !message.author.bot)
      .map(message => message);
    thisGuildTestData.questionsId.push(
      messages
        .filter(message => !message.author.bot)
        .map(message => message.id)
    );
    thisGuildTestData.still=Array(questions.length).fill(0).map((_,i)=>i)
    for (let i = 0; i < questions.length; i++) {
      let line = questions[i].content.split("//");
      if (line.length === 2) {
        thisGuildTestData.questions.push({
          statement: line[0],
          answer: line[1]
        });
      } else {
        questions[i].delete();
      }
    }
    setTimeout(() => {
      message.channel.send("テストを開始します");
    }, 200)
    fs.writeFileSync("data.json", JSONbig.stringify({ "guildsData": guildsData, "testData": testData }, null, " "))
    return editLog(message)
  }
  if ((message.content.startsWith("！テスト途中終了") ||
    message.content.startsWith("!stop")) &&
    thisGuildTestData.testing &&
    message.author.id === thisGuildTestData.user
  ) {
    testData=testData.filter(v=>v!==thisGuildTestData)
    message.channel.send("テストを途中終了しました");
    fs.writeFileSync("data.json", JSONbig.stringify({ "guildsData": guildsData, "testData": testData }, null, " "))
    return editLog(message)
  }
  if (thisGuildTestData.testing && (((message.author.username === client.user.username && message.content === "テストを開始します") || message.author.id === thisGuildTestData.user))) {
    if (message.content !== "テストを開始します") thisGuildTestData.answers.push(message.content);
    if (thisGuildTestData.testing &&
      thisGuildTestData.questions.length > thisGuildTestData.tested.length) {
      let ransu=thisGuildTestData.still[Math.floor(Math.random()*(thisGuildTestData.still.length-1))]
      thisGuildTestData.tested.push(ransu);
      thisGuildTestData.still=thisGuildTestData.still.filter(v=>v!==ransu)
      if (thisGuildTestData.type === "0") {
        message.channel.send(thisGuildTestData.questions[ransu].statement);
        thisGuildTestData.trueAns.push(thisGuildTestData.questions[ransu].answer);
      } else if (thisGuildTestData.type === "1") {
        message.channel.send(thisGuildTestData.questions[ransu].answer);
        thisGuildTestData.trueAns.push(thisGuildTestData.questions[ransu].statement);
      } else if (thisGuildTestData.type === "2") {
        let r = Math.floor(Math.random() * 2);
        if (r === 0) {
          message.channel.send(thisGuildTestData.questions[ransu].statement);
          thisGuildTestData.trueAns.push(thisGuildTestData.questions[ransu].answer);
        } else {
          message.channel.send(thisGuildTestData.questions[ransu].answer);
          thisGuildTestData.trueAns.push(thisGuildTestData.questions[ransu].statement);
        }
      }
      return fs.writeFileSync("data.json", JSONbig.stringify({ "guildsData": guildsData, "testData": testData }, null, " "))
    } else if (
      thisGuildTestData.questions.length ===
      thisGuildTestData.tested.length &&
      thisGuildTestData.testing
    ) {
      if (guildsData.find(d => d.guildid === message.guild.id) === undefined) {
        guildsData.push({ guildid: message.guild.id, channelsData: [] });
      }
      let thisguild = guildsData.find(d => d.guildid === message.guild.id);
      if (thisguild.channelsData.find(d => d.channelid === thisGuildTestData.channel.id) === undefined) {
        thisguild.channelsData.push({
          channelid: thisGuildTestData.channel.id,
          questionsData: []
        });
      }
      let thisdata = thisguild.channelsData.find(d => d.channelid == thisGuildTestData.channel.id).questionsData;
      while (thisdata.length < thisGuildTestData.questions.length) {
        thisdata.push({ s: 0, f: 0 });
      }
      let SoF = "";
      let SoFA = [];
      for (let a = 0; a < thisGuildTestData.questions.length; a++) {
        let q = a + 1;
        if (
          (brackets(thisGuildTestData.answers[a]) ===
            brackets(thisGuildTestData.trueAns[a])) ||
          (thisGuildTestData.answers[a] === thisGuildTestData.trueAns[a])
        ) {
          SoF =
            SoF +
            q +
            "問目:正解\n";
          SoFA.push(true);
        } else {
          SoF =
            SoF +
            q +
            "問目:不正解\n正しい解答:" +
            thisGuildTestData.trueAns[a] +
            "\nあなたの解答:" +
            thisGuildTestData.answers[a] +
            "\n";
          SoFA.push(false);
        }
      }
      thisGuildTestData.channel.messages
        .fetch({ after: "0", limit: 1 })
        .then(mesg => {
          let msg = mesg.map(message => message)[0];
          for (let a = 0; a < SoFA.length; a++) {
            if (SoFA[a]) {
              thisdata[thisdata.length - thisGuildTestData.tested[a] - 1].s++;
            } else {
              thisdata[thisdata.length - thisGuildTestData.tested[a] - 1].f++;
            }
          }
          //data格納終了
          let ans = "「問題文//解答」の形式で100題未満で入力してください\n「!numbering」または「！ナンバリング」で題数を数えられます\n()の中の文字及び括弧自体は質問はされますが解答されなくても正解になります\n";
          for (let a = 0; a < SoFA.length; a++) {
            let per = Math.round((thisdata[a].s * 10000) / (thisdata[a].s + thisdata[a].f)) / 100;
            let b = a + 1;
            let thisline = "問題" + b + ":正答率" + per + "%\n";
            ans = ans + thisline;
          }
          if (ans.length > 2000) msg.edit(ans.substring(0, 2000));
          else msg.edit(ans);
          for (const m of Util.splitMessage("テスト終了\n" + SoF)) {
            message.channel.send(m);
          }
          testData=testData.filter(v=>v!==thisGuildTestData)
          fs.writeFileSync("data.json", JSONbig.stringify({ "guildsData": guildsData, "testData": testData }, null, " "))
          editLog(message)
        });
      return
    }
  }
  if (message.author.id === "842017764402135071" && message.content.startsWith("eval\n")) {
    const before = Date.now()
    new Promise((reslove, reject) => {
      let result = (eval("(async function (){" + message.content.substring(5) + "})()"))
      reslove(result)
    }).then((result) => {
      const time = (Date.now() - before) / 1000
      if (typeof result === "object") result = JSONbig.stringify(result, null, "  ")
      if (result === undefined) result = "undefined"
      if (result === null) result = "null"
      if (result.length > 1900) {
        let msgs = Util.splitMessage(result, { maxLength: 1900 })
        for (let i = 0; i < msgs.length; i++) {
          if (i === msgs.length - 1) return message.reply("```" + msgs[i] + "```\n実行時間:" + time + "秒")
          message.reply("```\n" + msgs[i] + "```")
        }
      }
      message.reply("```\n" + result + "```\n実行時間:" + time + "秒")
    }).catch((e) => {
      message.reply("```\n" + e + "```")
    })
    return;
  }
  if (message.content === "!" || message.content === "！") {
    const embed = new MessageEmbed()
      .setTitle("コマンド一覧")
      .setDescription("日本語入力、英語入力に対応しています。日本語入力の場合は区切り文字を読点、英語入力の場合は区切り文字をカンマにしてください。\n詳しい説明はこちらのURLまでhttps://github.com/jinjanow/Vocabulary-Book-Bot#readme\n")
      .setColor(7506394)
      .addField("!mkch(！問題チャンネル作成),__name__", "```新しい問題用チャンネルを作成します```")
      .addField("!start(！テスト開始),__channelName__,__type__", "```channelNameのチャンネルの問題でテストを開始します\ntypeは0~2を半角で入力し、テストの方法を選択します\n0は通常通りに解答します\n1は答えから問題文を解答します\n2は0,1のランダムです```")
      .addField("!stop(!テスト途中終了)", "```テストを途中終了します```")
      .setFooter({ text: "下線部のみ変更してください" })
    message.channel.send({ embeds: [embed] });
  }
});

client.on("guildCreate", guild => {
  guild.channels.create("単語帳bot", { type: "GUILD_CATEGORY" })
    .then(ctg => {
      guild.channels.create("単語帳ターミナル", { parent: ctg.id })
        .then(ch => {
          ch.send("招待ありがとうございます\nこのbotはdiscord上で単語帳のテストをするbotです\nコマンド一覧は「!」で出すことができます")
        })
        .catch(e => console.log(e))
    })
    .catch(e => console.log(e))
});
client.login(process.env.TOKEN);