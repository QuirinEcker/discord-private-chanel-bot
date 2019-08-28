class ConfigsArray {

    constructor() {
        this.configs = new Array();
    }

    get(guildID) {
        let config;
        let guildConfigs = this.configs

        guildConfigs.forEach((item) => {
            if (item.guildID === guildID) {
                config = item;
            }
        });

        return config;
    }

    push(config) {
        this.configs.push(config)
    }
}

module.exports = ConfigsArray;