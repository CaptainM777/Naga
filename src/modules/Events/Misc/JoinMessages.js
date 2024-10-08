const { Listener } = require('axoncore');

const config = require('../../../../configs/config.json');
const server = require('../../../Models/Server.js');

class JoinMessages extends Listener {
    /**
     * @param {import('axoncore').Module} module
     * @param {import('axoncore').ListenerData} data
     */
    constructor(module, data = {} ) {
        super(module, data);

        /** Event Name (Discord name) */
        this.eventName = 'guildMemberAdd';
        /** Event name (Function name) */
        this.label = 'JoinMessages';

        this.enabled = true;

        this.info = {
            description: 'Naga join messages',
        };
    }

    /**
     * @param {import('eris').Message} msg
     */
    
    async execute(guild, member) { // eslint-disable-line
        if (config.settings.joinLogs === true && guild.id === '370708369951948800') {
            const messages = (await server.findById(guild.id).exec()).data.joinMessages;
            let joinmsg = Math.floor(Math.random() * messages.length);
            let msg = messages[joinmsg];
            msg = msg.replace(/['"]+/g, "'")
            msg = msg.replace(/{\w[{USER}]+/g, `${member.mention}`);
            await this.bot.getChannel('761932923217379338').createMessage(msg);
        }
    }
}

module.exports = JoinMessages;
