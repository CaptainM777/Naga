const { Command, CommandOptions } = require('axoncore');
const images = require('../../../assets/images.json');

class Pat extends Command {
    /**
     * @param {import('axoncore').Module} module
     */
    constructor(module) {
        super(module);

        this.label = 'pat';
        this.aliases = [ 'pat' ];

        this.hasSubcmd = false;

        this.info = {
            name: 'pat',
            description: 'Pat someone!',
            usage: 'pat [user]',
        };

        /**
         * @type {CommandOptions}
         */
        this.options = new CommandOptions(this, {
            argsMin: 0,
            cooldown: 10000,
            guildOnly: true,
        } );
    }

    displayName(message, member) {
        return (message).channel.guild.members.get(member).nick ?? (message).channel.guild.members.get(member).username;
    }

    /**
     * @param {import('axoncore').CommandEnvironment} env
     */

    async execute({ msg, args }) {

        let member = this.utils.resolveUser(msg.channel.guild, args[0]);

        let embed = {
            color: this.utils.getColor('blue'),
            description: `**${this.displayName(msg, msg.author.id)}** faces a good 'ol slap from **${this.displayName(msg, member.id)}**! I wonder what they did to deserve that...`,
            image: { url: `https://i.imgur.com/${images.slap[Math.floor(Math.random() * images.slap.length)]}.gif` },
            footer: { text: `Requested by: ${this.utils.fullName(msg.author)}` }
        };

        if (member.id === msg.author.id) embed.description = `I can give you le pats, here u are!`;
        if (member.id === this.bot.user.id) embed.description = `Woooooooooooof!!`;

        return msg.channel.createMessage({embed});

    }
}

module.exports = Pat;