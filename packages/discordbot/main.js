require('dotenv').config();
const Discord = require('discord.js');
var express = require('express');
var app = express();

const client = new Discord.Client();

const prefix = '!';
const targetMpId = '1';
const port = 4000;
const vipRoleId = '805245913525780500';

client.once('ready', () => {
    console.log("DiscordBot is ready");
});

client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'join'){
        message.channel.send('http://localhost:3000/discordbot/' + targetMpId + '/' + message.member.guild.id + '/' + message.member.user.id + '/' + vipRoleId);
    }
    //console.log('message', message);
    //console.log('message.member', message.member);
    //console.log('message.member.guild.id', message.member.guild.id);
    //console.log('message.member.user.id', message.member.user.id);
});

app.post('/addrole/:guildid/:userid/:roleid', function (req, res) {
    //console.log("req", req);
    const guildid = req.params.guildid;
    //console.log("guildId", guildId);
    const userid = req.params.userid;
    //console.log("userId", userId);
    const roleid = req.params.roleid;

    client.guilds.cache.get(guildid).members.cache.get(userid).roles.add(roleid).catch(console.error);
    console.log('addrole', guildid, userid, roleid);
    res.send('ok');
})

app.post('/removerole/:guildid/:userid/:roleid', function (req, res) {
    const guildid = req.params.guildid;
    const userid = req.params.userid;
    const roleid = req.params.roleid;

    client.guilds.cache.get(guildid).members.cache.get(userid).roles.remove(roleid).catch(console.error);
    console.log('removerole', guildid, userid, roleid);
    res.send('ok');
})

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("app listening at http://%s:%s", host, port)
   client.login(process.env.DROPLETPOOL_APP_TOKEN);
})
