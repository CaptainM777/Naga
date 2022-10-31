const { Command, CommandOptions, CommandPermissions } = require('axoncore');
const korratopics = require('../../../assets/korratopics.json');
const { readFileSync, writeFileSync } = require('fs');
// const axios = require('axios');

const COMMAND_COOLDOWN = 600000;

class Korra extends Command {
    /**
     * @param {import('axoncore').Module} module
     */
    constructor(module) {
        super(module);

        this.label = 'lok';
        this.aliases = [ 'lok', 'korra' ];

        this.hasSubcmd = false;

        this.info = {
            name: 'topic lok',
            description: 'Provides a random topic about Legend of Korra!',
            usage: 'topic lok',
        };

        /**
         * @type {CommandOptions}
         */
        this.options = new CommandOptions(this, {
            argsMin: 0,
            cooldown: null,
            guildOnly: true,
        } );

        this.permissions = new CommandPermissions(this, {
            channels: {
                bypass: ['372086844956868618', '721604232532459540']
            }
        });
    }

    /**
     * @param {import('axoncore').CommandEnvironment} env
     */

    handleCooldown() {
        let data = readFileSync('src/assets/atlacooldown.json');
        let lastUsed = JSON.parse(data);

        const timeLeft = Date.now() - lastUsed;
        if (timeLeft <= COMMAND_COOLDOWN) {
            let time = Math.ceil((600000 - timeLeft) / 100) / 10
            let minutes = Math.floor(time / 60);
            let seconds = Math.ceil(time - minutes * 60);
            if (minutes === 0) {
                return `${seconds} sec`;
            } else {
                return `${minutes} minutes ${seconds} seconds`;
            }
        } else return false;
    }

    async execute( { msg } ) {

        // let atlatopics = await axios.get('http://atla.sh/topics.json');
        // atlatopics = atlatopics.data;

        let timeRemaining = this.handleCooldown();
        if (timeRemaining !== false) {
            return this.sendError(msg.channel, `This command has already been used recently!\nTry again in **${timeRemaining}**!`);
        }

        const topic = Math.floor(Math.random() * korratopics.length);
        return this.sendMessage(msg.channel, {
            embed: {
                color: this.utils.getColor('blue'),
                description: korratopics[topic]
            }
        }).then(writeFileSync('src/assets/atlacooldown.json', JSON.stringify(msg.createdAt)));
    }
}


module.exports = Korra;
