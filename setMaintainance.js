const Discord = require('discord.js');
const client = new Discord.Client();
const token = "NjEzMTE5NDgxODQxMDU3ODE1.XWfTlw.YCqrjGudoY2yIudvRjkMsmNivvU";

client.login(token)
    .then(() => {

    })


client.on('ready', () => {
    console.log('read<');
    client.user.setStatus('idle');
})