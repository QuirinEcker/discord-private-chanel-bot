class Config {

    constructor(guildID, textChanel) {
        this.guildID = guildID;
        this.textChannelID = textChanel;
        this.adminRoleID = undefined;
        this.accessRoleIDs = new Array();
        this.pcChannelIDs = new Array();
        this.pcCategoryID = undefined;
        this.prefix = '>';
    }

    static getPc(guildConfig, id) {
        let pc;

        guildConfig.pcChannelIDs.forEach((item) => {
            if (item.id === id) {
                pc = item;
            }
        });

        return pc;
    }
}

module.exports = Config;