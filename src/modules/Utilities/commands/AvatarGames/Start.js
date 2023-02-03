const { Command, CommandOptions, CommandPermissions } = require('axoncore');

class Start extends Command {
    /**
     * @param {import('axoncore').Module} module
     */
    constructor(module) {
        super(module);

        this.label = 'start';
        this.aliases = [ 'start' ];

        this.hasSubcmd = false;

        this.info = {
            name: 'agames start',
            description: 'Unlocks the Avatar Games channel!',
            usage: 'agames start',
        };

        /**
         * @type {CommandOptions}
         */
        this.options = new CommandOptions(this, {
            argsMin: 0,
            cooldown: 10000,
            guildOnly: true,
        });

        this.permissions = new CommandPermissions(this, {
            // staff: {
            //     needed: this.axon.staff.sentries,
            //     bypass: this.axon.staff.owners,
            // },
            custom: (msg) => msg.member.roles.includes('830138455337730049') // Event Masters
        });
    }
    /**
     * @param {import('axoncore').CommandEnvironment} env
     */

    async execute({ msg }) {
            await this.bot.editChannelPermission('709827097559826553', '370708369951948800', 1024n, 0n, 0)
            this.sendSuccess(msg.channel, 'Starting Avatar Games!');
    }
}


module.exports = Start;

