require('dotenv').config();
const Discord = require('discord.js');
var express = require('express');
var app = express();

const client = new Discord.Client();

const prefix = '!';
const targetMpId = '1';
const port = 4000;
const vipRoleId = process.env.VIP_ROLE_ID;
var userAddressDict = {};

client.once('ready', () => {
    console.log("DiscordBot is ready");
});

client.on('message', (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'join'){
        message.channel.send('To authenticate, please open this url with the wallet that you had used to join the membership')
        message.channel.send('http://localhost:3000/discordbot/' + targetMpId + '/' + message.member.guild.id + '/' + message.member.user.id + '/' + vipRoleId);
    }
});

app.post('/addrole/:mpId/:userAddress/:guildId/:userId/:roleId', function (req, res) {
    const mpId = req.params.mpId;
    const userAddress = req.params.userAddress;
    const guildId = req.params.guildId;
    const userId = req.params.userId;
    const roleId = req.params.roleId;

    const userAddressObj = {'mpId': mpId, 'guildId': guildId, 'userId': userId, 'roleId': roleId};
    userAddressDict[userAddress] = userAddressObj;

    client.guilds.cache.get(guildId).members.cache.get(userId).roles.add(roleId).catch(console.error);
    console.log('addrole', mpId, userAddress, guildId, userId, roleId);
    res.send('ok');
})

app.post('/removerole/:mpId/:userAddress', function (req, res) {
    const userAddress = req.params.userAddress;
    const userAddressObj = userAddressDict[userAddress];
    if (userAddressObj) {
        delete userAddressDict.userAddress;
        const guildId = userAddressObj.guildId;
        const userId = userAddressObj.userId;
        const roleId = userAddressObj.roleId;
        client.guilds.cache.get(guildId).members.cache.get(userId).roles.remove(roleId).catch(console.error);
        console.log('removerole', guildId, userId, roleId);
    }
    res.send('ok');
})

var server = app.listen(port, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("app listening at http://%s:%s", host, port)
   client.login(process.env.DROPLETPOOL_APP_TOKEN);
})
