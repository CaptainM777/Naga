const { Command, CommandOptions, CommandPermissions } = require('axoncore');
const Poll = require('../../../Models/Poll');

class CreatePoll extends Command {
  constructor(module) {
    super(module);

    this.label = 'createpoll';
    this.aliases = [ 'fpoll' ];

    this.info = {
      name: 'createpoll',
      description: 'Create a poll. Time limit is optional',
      usage: 'createpoll [time limit] [question]|[option 1]|[option 2]',
      examples: [
        'createpoll 72h What should we have for dinner?|Steak|Burgers|Mac n\' Cheese',
        'createpoll What should we have for breakfast?|Bacon|Eggs|Beans on toast (ew)'
      ]
    };

    this.options = new CommandOptions(this, {
      argsMin: 2,
      cooldown: null, 
      // deleteCommand: true
    });

    this.permissions = new CommandPermissions(this, {
      staff: {
        needed: this.axon.staff.sentries,
        bypass: this.axon.staff.owners,
      },
    });

    this.durationRegex = /\d+(d|h)/g;
  }

  convertToMilliseconds(timeDurations) {
    const daysRegex = /\d+d/g, hoursRegex = /\d+h/g;
    let milliseconds = 0;

    for (let timeDuration of timeDurations) {
      if (daysRegex.test(timeDuration)) {
        milliseconds += parseInt(timeDuration.replace('d', '')) * 24 * 60 * 60 * 1000;
      } else if (hoursRegex.test(timeDuration)) {
        milliseconds += parseInt(timeDuration.replace('h', '')) * 60 * 60 * 1000;
      }
    }

    return milliseconds;
  }

  /**
   * Constructs an emotes array based on the number of options. Emotes are paired
   * with their respective option in the poll itself.
   * @param {Number} optionsLength - The number of options in the poll
   */
  createEmotes(optionsLength) {
    const emotes = [];
    const enclosingKeycapCodepoint = 8419;

    for (let i = 1; i <= optionsLength; i++) {
      if (i <= 9) { // constructs digits 1-9 with enclosing keycap
        emotes.push(String.fromCharCode(i + 48, enclosingKeycapCodepoint));
      } else if (i > 9) { // constructs regional indicator letters
        emotes.push(String.fromCodePoint(i + 127452));
      }
    }

    return emotes;
  }

  createOptionsWithEmotes(options, emotes) {
    let optionsWithEmotes = '';

    for (let i = 0; i < options.length; i++) {
      optionsWithEmotes += `${emotes[i]} ${options[i]}\n`;
    }

    return optionsWithEmotes;
  }
  
  async execute({ msg, args }) {
    let pollEnd, embedFields = [];
    if (this.durationRegex.test(args[0])) {
      let duration = this.convertToMilliseconds(args[0].match(this.durationRegex));

      pollEnd = Date.now() + duration;
      embedFields.push({ 
        name: 'Poll End', 
        value: `This poll will end on <t:${Math.floor(pollEnd / 1000)}>` 
      });

      args.shift();
    }

    args = args.join(' ').split('|');

    const question = args.shift();
    const options = args;

    if (options.length === 0) {
      return this.sendError(msg.channel, 'No options were provided!');
    } else if (options.length > 15) {
      return this.sendError(msg.channel, 'Can\'t provide more than 15 options!');
    }

    const emotes = this.createEmotes(options.length);

    const optionsWithEmotes = this.createOptionsWithEmotes(options, emotes);

    const dbOptions = options.reduce((previousValue, currentValue) => {
      return { ...previousValue, [currentValue]: [] }
    }, {});

    msg.channel.createMessage({
      embed: {
        color: this.utils.getColor('green'),
        author: {
          name: this.utils.fullName(msg.author),
          icon_url: msg.author.avatarURL
        },
        title: question,
        description: optionsWithEmotes,
        fields: embedFields,
        timestamp: new Date()
      },
      components: [
        {
          type: 1,
          components: [
            {
              custom_id: 'poll_additional_actions',
              type: 3,
              placeholder: 'Additional actions',
              options: [
                {
                  label: 'Show results so far',
                  value: 'show_results',
                },
                {
                  label: 'Add an option',
                  value: 'add_option'
                },
                {
                  label: 'Edit an option',
                  value: 'edit_option'
                },
                {
                  label: 'End poll',
                  value: 'end_poll',
                }
              ]
            }
          ]
        }
      ]
    }).then(async (message) => {
      for (let emote of emotes) {
        message.addReaction(emote);
      }

      new Poll({ 
        _id: message.id,
        data: {
          question: question, 
          options: dbOptions,
          author: msg.author.id,
          channel: msg.channel.id,
          endsOn: pollEnd
        }
      }).save();
    });
  }
}

module.exports = CreatePoll;