const Discord = require('discord.js');
const client = new Discord.Client();
const token = require('./token').token;
const fs = require('fs');
const Config = require('./Config')
const ConfigsArray = require('./ConfigsArray')
const PrivateChannel = require('./PrivateChannel')
let guildConfigs = new ConfigsArray();

console.log(client.login(token));

function loadConfigs() {
    let p = new Promise((resolve, reject) => {
        fs.readFile('./configs.json', 'utf8', (err, data) => {
            if (!err) {
                guildConfigs.configs = JSON.parse(data);
                console.log(guildConfigs.configs)
            }
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
    saveConfigs();
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
    else {
        let roles = Array.from(senderObject.roles);
        let boolAllowed = false;

        roles.forEach((role) => {
            if (role[0] === guildConfig.adminRoleID) {
                boolAllowed = true;
            }
        })

        return boolAllowed;
    }
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

function isAccsesRole(addRole, roles) {
    let allreadyAccsesRole = false;

    roles.forEach((role) => {
        if (role == getUserIdOutOfMention(addRole)) {
            allreadyAccsesRole = true;
        }
    })

    return allreadyAccsesRole;
}

function buildList(roles, msg) {
    let stringBuild = '';

    roles.forEach((role) => {
        stringBuild += ` - ${msg.guild.roles.get(role)}\n`;
    })

    return stringBuild;
}

function runConfigureParameter(parameter, msg) {
    let accessRoles = guildConfigs.get(msg.guild.id).accessRoleIDs;

    switch (parameter[0]) {
        case 'prefix':
            guildConfigs.get(msg.guild.id)[parameter[0]] = parameter[1];
            msg.channel.send(`:thumbsup: prefix set to: '${parameter[1]}'`)
            break
        case 'adminRole':
            guildConfigs.get(msg.guild.id)['adminRoleID'] = getUserIdOutOfMention(parameter[1]);
            msg.channel.send(`:thumbsup: admin role set to: ${msg.guild.roles.get(getUserIdOutOfMention(parameter[1]))}`)
            break;
        case 'accessRole':
            if (parameter[1] === 'add' && checkParameter(parameter, 3)) {
                if (!isAccsesRole(parameter[2], accessRoles)) {
                    guildConfigs.get(msg.guild.id).accessRoleIDs.push(getUserIdOutOfMention(parameter[2]))
                    let stringBuild = "";
                    msg.channel.send(`:thumbsup: accessRole has been added: ${parameter[2]} \n following roles can use the bot: \n \r ${buildList(accessRoles, msg)}`);
                } else {
                    msg.channel.send(`
                    :x: this role is allready on the list \n:page_facing_up: following roles are allready access roles: \n\r${buildList(accessRoles, msg)}
                    `);
                }
            } else if (parameter[1] === 'remove' && checkParameter(parameter, 3)) {
                if (isAccsesRole(parameter[2], accessRoles)) {
                    console.log(accessRoles);
                    accessRoles.forEach((role, index) => {
                        if (role === getUserIdOutOfMention(parameter[2])) {
                            guildConfigs.get(msg.guild.id).accessRoleIDs.splice(index, 1);
                        }
                    })
                    msg.channel.send(`:thumbsup: access role was deleted \n:page_facing_up: following access roles are remaining \n\r${buildList(accessRoles, msg)}`)
                } else {
                    msg.channel.send(`:x: role not found in list \n:page_facing_up: there are following access roles \n\r${buildList(accessRoles, msg)}`)
                }
            }
            break;
        case 'pcCategory':
            let channels = msg.guild.channels;
            let categories = new Array();

            channels.forEach((channel) => {
                if (channel.type === 'category') {
                    let channelNameWithoutSpace = channel.name.replace(' ', '-');

                    if (channelNameWithoutSpace.toLowerCase() === parameter[1].toLowerCase()) {
                        categories.push(channel.id);
                    }
                }
            });

            if (categories.length > 1) {
                msg.channel.send(`:x: the name has to be unique`);
            } else if (categories.length < 1) {
                msg.channel.send(`:x: didn't found any categories with this name`)
            } else {
                guildConfigs.get(msg.guild.id).pcCategoryID = categories[0];
                msg.channel.send(`:thumbsup: private chanel category is set to ${parameter[1]}`)
            }
            break;
        case 'botChannel':
            guildConfigs.get(msg.guild.id)['textChannelID'] = getUserIdOutOfMention(parameter[1]);
            msg.channel.send(`:thumbsup: bot channel set to: ${msg.guild.channels.get(getUserIdOutOfMention(parameter[1]))}`);
            break;
        case 'showConfig':
            let configList = "";
            let guildConfig = guildConfigs.get(msg.guild.id);

            for (let propertyKey in guildConfig) {
                let value;
                switch (propertyKey) {
                    case 'guildID':
                        value = client.guilds.get(guildConfig[propertyKey]).name;
                        break;
                    case 'textChannelID':
                        value = msg.guild.channels.get(guildConfig[propertyKey]).name;
                        break
                    case 'accessRoleIDs':
                        let accessRoleIDsArray = guildConfig[propertyKey];
                        value = `(`;
                        accessRoleIDsArray.forEach((roleID) => {
                            value += `${msg.guild.roles.get(roleID).name}, `
                        });
                        value += `)`;
                        break
                    break;
                    case 'pcChannelsIDs':
                        break;
                    case 'prefix':
                        value = guildConfig[propertyKey];
                        break
                    case 'adminRoleID':
                        value = msg.guild.roles.get(guildConfig[propertyKey]);
                        break;
                    case 'pcCategoryID':
                        value = msg.guild.channels.get(guildConfig[propertyKey]).name;
                }

                if (propertyKey != 'pcChannelIDs') {
                    configList += `- **${propertyKey.replace('ID', '')}:** ${value}\n`
                }
            }

            msg.channel.send(`:page_facing_up: Config: \n${configList}`)
            break;
        default:
            msg.channel.send(`:x: I am not aware of such configuration (${parameter[0]})`)
            break
    }
}

function senderHasAccessRole(msg) {
    let guildConfig = guildConfigs.get(msg.guild.id);
    let sender = msg.member;
    let senderRoles = Array.from(sender.roles);
    let accesRoles = guildConfig.accessRoleIDs;
    let senderHasAccessRole = false;

    senderRoles.forEach((senRole) => {
        accesRoles.forEach((accRoleID) => {
            if (senRole[0] === accRoleID) {
                senderHasAccessRole = true;
            }
        })
    })

    return senderHasAccessRole;
}

function runPcParameter(parameter, msg) {
    let guildConfig = guildConfigs.get(msg.guild.id);
    let privateChannel = Config.getPc(guildConfig, parameter[1]);

    if (senderHasAccessRole(msg)) {
        switch (parameter[0]) {
            case 'addMember':
                PrivateChannel.add(privateChannel, getUserIdOutOfMention(parameter[2]));
                msg.channel.send(`:thumbsup: you have added ${parameter[2]}`);
                break;
            case 'removeMember':
                PrivateChannel.remove(privateChannel, getUserIdOutOfMention(parameter[2]));
                msg.channel.send(`:thumbsup: you have removed ${parameter[2]}`);
                break;
            case 'create': {
                let guildConfig = guildConfigs.get(msg.guild.id);
                let pcCategory = msg.guild.channels.get(guildConfig.pcCategoryID);

                msg.guild.createChannel(parameter[1], {
                    type: 'voice'
                })
                    .then((channel) => {
                        let privateChannel = new PrivateChannel(channel.id, msg.member.id, msg.guild.id);

                        channel.overwritePermissions(msg.guild.defaultRole, {
                            CONNECT: false
                        })
                            .then(() => {
                                channel.setParent(msg.guild.channels.get(guildConfig.pcCategoryID));
                            })
                            .catch((err) => {
                                console.log(err);
                            })

                        guildConfigs.get(msg.guild.id).pcChannelIDs.push(privateChannel);
                        msg.channel.send(`:thumbsup: created private channel.\nWith this unique identifier you can change the permission of the pc Channel: **${channel.id}**`);
                        saveConfigs();
                    })
                    .catch((err) => {
                        msg.channel.send(':x: bot has not enough permissions')
                        console.log(err);
                    })
            }
                break;
            default:
                break;
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
                runConfigureParameter(parameter, msg)
            } else {
                msg.channel.send(':x: You are not allowed to configure');
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
        case "pc":
            runPcParameter(parameter, msg);
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

module.exports.client = client;