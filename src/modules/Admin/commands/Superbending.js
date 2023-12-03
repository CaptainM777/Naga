const { Command, CommandOptions, CommandPermissions } = require('axoncore');

// const userRegex = /<@([^}]+)>/g;

class Superbending extends Command {
    /**
     * @param {import('axoncore').Module} module
     */
    constructor(module) {
        super(module);

        this.label = 'superbending';
        this.aliases = [ 'sp' ];

        this.hasSubcmd = false;

        this.info = {
            name: 'superbending',
            description: 'Assigns initial members to superbending roles',
            usage: 'superbending',
        };

        /**
         * @type {CommandOptions}
         */
        this.options = new CommandOptions(this, {
            argsMin: 0,
            cooldown: 1000,
            guildOnly: true,
        });

        this.roles = {
            nonbender: '372093851600683011',
            waterbender: '372085492910522370',
            earthbender: '372085752319967236',
            firebender: '372085669142724608',
            airbender: '372085326165835777',
        }

        this.permissions = new CommandPermissions(this, {
            staff: {
                needed: this.axon.staff.owners,
                bypass: this.axon.staff.owners,
            },
        });
    };

    async execute({msg}) {
        msg.channel.createMessage('yass');
        try {
            let a = this.bot.guilds.get('370708369951948800').members.filter(m =>
                ((m.roles.includes('811411225639518209'))));
            let members = [];
            for (let i in a) {
                members.push(a[i].id);
            }

            for (let i in members) {
                if (members[i].roles.includes(this.roles.water)) {
                    await this.bot.addGuildMemberRole('370708369951948800', member.id, '1180969376770441298', 'Added super-waterbending role');
                    console.log('water');
                };

                if (members[i].roles.includes(this.roles.earth)) {
                    await this.bot.addGuildMemberRole('370708369951948800', member.id, '1180969390049607791', 'Added super-earthbending role');
                    console.log('earth');
                };

                if (members[i].roles.includes(this.roles.fire)) {
                    await this.bot.addGuildMemberRole('370708369951948800', member.id, '1180969386245378058', 'Added super-firebending role');
                    console.log('fire');
                };

                if (members[i].roles.includes(this.roles.air)) {
                    await this.bot.addGuildMemberRole('370708369951948800', member.id, '1180969398048129166', 'Added super-airbending role');
                    console.log('air');
                };

                if (members[i].roles.includes(this.roles.non)) {
                    await this.bot.addGuildMemberRole('370708369951948800', member.id, '1180969393841242194', 'Added super-nonbending role');
                    console.log('non');
                };
            };
        } catch (err) {
            this.utils.logError(msg, err, 'internal', 'Something went wrong.');
        }
    }
}

module.exports = Superbending;
