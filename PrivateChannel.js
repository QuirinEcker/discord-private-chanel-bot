const index = require('./index');

class PrivateChannel {

    constructor(id, creatorID, guildID) {
        this.id = id;
        this.guildID = guildID;
        this.accessMemberIDs = new Array();
        this.accessMemberIDs.push(creatorID)
    }

    static add(pc, memberID) {
        let client = index.client;
        let guild = client.guilds.get(pc.guildID);
        let channel = guild.channels.get(pc.id);

        pc.accessMemberIDs.push(memberID);

        channel.overwritePermissions(client.guilds.get(pc.guildID).members.get(memberID), {
            CONNECT: true
        })
    }

    static remove(pc, memberID) {
        let client = index.client;
        let guild = client.guilds.get(pc.guildID);
        let channel = guild.channels.get(pc.id)

        for (let accessMemberIDIndex in this.accessMemberIDs) {
            if (this.accessMemberIDs[accessMemberIDIndex] === member.id) {
                this.accessMemberIDs.splice(accessMemberIDIndex, 1);
            }
        }

        channel.overwritePermissions(guild.members.get(memberID), {
            CONNECT: false
        })
    }
}

module.exports = PrivateChannel;