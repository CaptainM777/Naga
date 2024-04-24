const { Command, CommandOptions, CommandPermissions } = require('axoncore');

class SimplePoll extends Command {
  constructor(module) {
    super(module);

    this.label = 'simplepoll';
    this.aliases = [ 'poll' ];

    this.info = {
      name: 'simplepoll',
      description: 'Create a yes, no, indifferent poll. Time limit is optional',
      usage: 'simplepoll [time limit] [question]',
      examples: [
        'simplepoll 72h Should we call the Ghostbusters?',
        'simplepoll Should we eat out tonight?'
      ]
    };

    this.options = new CommandOptions(this, {
      argsMin: 1,
      cooldown: null, 
      // deleteCommand: true
    });

    this.permissions = new CommandPermissions(this, {
      staff: {
        needed: this.axon.staff.sentries,
        bypass: this.axon.staff.owners,
      },
    });
  }

  async execute({ msg, args }) {
    this.axon.commandRegistry.get('createpoll').execute({ msg, args: [...args, '|yes|no|indifferent'] });
  }
}

module.exports = SimplePoll;