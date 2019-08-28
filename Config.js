class Config {

    constructor(guildID, textChanel) {
        this.guildID = guildID;
        this.textChannelID = textChanel;
        this.adminRoleID = undefined;
        this.accsesRoleIDs = new Array();
        this.pcChannelIDs = new Array();
        this.pcCategoryID = undefined;
        this.prefix = '>';
    }
}

module.exports = Config;