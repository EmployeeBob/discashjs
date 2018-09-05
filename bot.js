const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const sql = require("sqlite");
sql.open("./score.sqlite");
const prefix = "dis";
client.on("ready", () => {
  console.log(`Discash has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('thieves.', { type: 'WATCHING' });
});
client.on("message", async message => {
  if (message.author.bot) return;
  if (message.channel.type !== "text") return;
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    } else {
      let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
      if (curLevel > row.level) {
        row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });
  if (!message.content.startsWith(prefix)) return;
  if (message.content.startsWith(prefix + "cash")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.channel.send({embed: {color: 000, title: "Apologies. You do not have any Discash yet. Try to earn some by being a more active member. Try typing 'discash' again."}});
      message.channel.send({embed: {color: 000, title: `You currently have ${row.points} Discash. Type more and be active to earn more.`}});
      message.channel.send("Transaction commands are in development. Please wait.")
    });
  } else {
    if (message.content.startsWith(`${prefix}pay`)) {
        const who = message.guild.member(args[0]).user || async client.fetchUser(args[0]) || message.mentions.users.first();
        return sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(async row => {
            sql.run(`UPDATE scores SET points = ${row.points - 20} WHERE userId = ${message.author.id}`);
            message.channel.send(`Your transaction is being processed...`);
            const row1 = await sql.get(`SELECT * FROM scores WHERE userId ="${who.id}"`);
            sql.run(`UPDATE scores SET points = ${row1.points + 20} WHERE userId = ${message.author.id}`);
            message.channel.send(`You have successfully completed a transaction.`);
            message.channel.send(`Your current balance is ${row1.points + 20} Discash.`);
        });
    }
  }
});
client.login("your-token-here");
