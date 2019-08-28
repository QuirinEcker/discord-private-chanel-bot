const Discord = require('discord.js');
const client = new Discord.Client();
const token = "NjEzMTE5NDgxODQxMDU3ODE1.XVsSDg.QSI9RL7nidnBB-iJvLFdshRpMWM";
const fs = require('fs');
const Config = require('./Config')
const ConfigsArray = require('./ConfigsArray')
let guildConfigs = new ConfigsArray();

client.login(token);

function loadConfigs() {
    let p = new Promise((resolve, reject) => {
        fs.readFile('./configs.json', 'utf8', (err, data) => {
            guildConfigs.configs = JSON.parse(data);
            console.log(guildConfigs.configs)
        })
    });
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    let guilds = client.guilds;

    loadConfigs()
})

client.on("guildCreate", (guild) => {
    try {
        fs.readFile('welcomeMessage.txt', (err, data) => {
            if (err) {
                throw err;
            } else {
                guild.systemChannel.send("" + data)
            }
        })
    } catch (e) {
        console.error(e.message)
    }

    guildConfigs.push(new Config(guild.id, guild.systemChannelID));
});

client.on("message", (msg) => {
    let message = msg.content;
    if (messageIsCommand(message, msg) && isInBotChanel(guildConfigs.get(msg.guild.id), msg)) {
        let runnableCommand = getRunnableCommand(message);
        runCommand(runnableCommand, msg)
    }
});

function saveConfigs() {
    let configsToSave = guildConfigs.configs;

    fs.writeFile('./configs.json', JSON.stringify(guildConfigs.configs), (err) =>{
        if (err) throw err;
        else console.log('saved');
    });

}

function getParameter(entireCommand) {
    let parameter = new Array();

    entireCommand.forEach((item, index) => {
        if (index > 0) {
            parameter.push(item);
        }
    });

    return parameter;
}

function checkParameter(parameter, supposedParameterLenght) {
    if (parameter.length === supposedParameterLenght) {
        return true;
    } else {
        return false;
    }
}

function getRunnableCommand(command) {
    let runnableCommand = "";

    for (let i = 0; i < command.length; i++) {
        if (i != 0) {
            runnableCommand += command.charAt(i);
        }
    }

    return runnableCommand;
}

function messageIsCommand(message, msg) {
    if (message.charAt(0) === guildConfigs.get(msg.guild.id).prefix) {
        return true;
    } else {
        return false;
    }
}

function playerIsAllowedToConfigure(senderID, currentGuildID) {
    let guildsObject = client.guilds.get(currentGuildID)
    let senderObject = guildsObject.members.get(senderID);
    let guildConfig = guildConfigs.get(currentGuildID);

    if (guildsObject.roles.get(guildConfig.adminRoleID) === undefined)
        return senderID === guildsObject.ownerID
    else
        return senderID === guildsObject.ownerID || senderObject.roles.includes(guildConfig.adminRoleID)
}

function getUserIdOutOfMention(parameterElement) {
    let allNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    let id = "";

    for (let character of parameterElement) {
        if (allNumbers.includes(character)) {
            id += character;
        }
    }

    return id;
}

function runParameter(parameter, msg) {
    if (checkParameter(parameter, 2)) {
        switch (parameter[0]) {
            case 'prefix':
                guildConfigs.get(msg.guild.id)[parameter[0]] = parameter[1];
                msg.channel.send(`:thumbsup: prefix set to: '${parameter[1]}'`)
                break
            default:
                msg.channel.send(`:x: I am not aware of such configuration (${parameter[0]})`)
                console.log(parseInt(getUserIdOutOfMention(parameter[1])));
                break
        }
    }
}

function runCommand(runnableCommand, msg) {
    let entireCommandArray = runnableCommand.split(' ');
    let command = entireCommandArray[0];
    let parameter = getParameter(entireCommandArray);

    switch (command) {
        case "configure":
            if (playerIsAllowedToConfigure(msg.member.id, msg.guild.id)) {
                runParameter(parameter, msg)
            }
            break;
        case "help":
            if (checkParameter(parameter, 1)) {

            } else {
                throw Error('parameter error');
            }
            break;
        case "save":
            if (checkParameter(parameter, 1)) {
                saveConfigs();
            }
            break;
        default:
            msg.channel.send(`:x: I am not aware of such command (${command})`)
    }

    saveConfigs()
}

function isInBotChanel(config, msg) {
    if (msg.channel.id === config.textChannelID) {
        return true
    }
}