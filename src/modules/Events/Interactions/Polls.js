// /**
//     * Responds to an interaction with a modal
//     * @arg {Object} content An object
//     * @arg {String} [content.title] The title for the modal, max 45 characters
//     * @arg {String} [content.custom_id] The custom identifier for the modal
//     * @arg {Array<Object>} [content.components] An array of components. See [the official Discord API documentation entry](https://discord.com/developers/docs/interactions/message-components#what-is-a-component) for object structure
//     * @returns {Promise}
//     */
//    async createModal(content) {
//     return this._client.createInteractionResponse.call(this._client, this.id, this.token, {
//         type: InteractionResponseTypes.MODAL,
//         data: content
//     }).then(() => this.update());
// }

const { Listener } = require('axoncore');
const Poll = require('../../../Models/Poll');

class Polls extends Listener {
  /**
   * @param {import('axoncore').Module} module
   * @param {import('axoncore').ListenerData} data
   */
  constructor(module, data = {}) {
    super(module, data);

    /** Event Name (Discord name) */
    this.eventName = 'interactionCreate';
    /** Event name (Function name) */
    this.label = 'interactionCreate-Polls';

    this.enabled = true;

    this.info = { description: 'Handles additional poll actions.' };
  }

  // not happy with this code, refactor later
  async generatePollResults(componentMessage) {
    let pollResultsEmbed = {
      color: this.utils.getColor('blue'),
      title: 'Poll Results',
      description: ''
    };

    const emotesAndOptions = componentMessage.embeds[0].description.split('\n');

    const staffNoVote = [ ...this.axon.staff.admins, ...this.axon.staff.sentries ]
                        .filter((staffId, index, array) => staffId !== "0" && array.indexOf(staffId) === index);

    for (let emoteAndOption of emotesAndOptions) {
      emoteAndOption = emoteAndOption.split(' ');
      const emote = emoteAndOption.shift();
      const option = emoteAndOption.join(' ');

      let staffWhoVoted = (await componentMessage.getReaction(emote))
                          .filter((user) => user.id !== this.bot.user.id);

      staffWhoVoted.forEach((user) => {
        let index = staffNoVote.indexOf(user.id);
        if (index !== -1) staffNoVote.splice(index, 1);
      });

      if (staffWhoVoted.length === 0) {
        staffWhoVoted.push('No votes');
      } else {
        staffWhoVoted = staffWhoVoted.map((user) => this.utils.fullName(user));
      }

      pollResultsEmbed.description += `${emote} ${option}: \`${staffWhoVoted.join(', ')}\`\n`;
    }

    for (let userId of staffNoVote) {
      let user = await this.bot.getRESTUser(userId);
      staffNoVote.splice(staffNoVote.indexOf(userId), 1, this.utils.fullName(user));
    }

    if (staffNoVote.length === 0) staffNoVote.push('None');

    pollResultsEmbed.description += `Didn't vote: \`${staffNoVote.join(', ')}\``

    return pollResultsEmbed;
  }

  /* Permissions:
  Show results: OP, Sentries and WL
  Add Option: OP, Sentries, and WL
  Edit Option: OP, Sentries, and WL
  Close Poll (manual): OP and WL (tentative) */

  /* Show results so far: generate poll results so far based on the reactions, and display who hasn't
  voted as well. The options that each staff member voted for isn't saved to the DB yet, and won't be 
  for this part. Retrieve options as a keys array from the 'options' object and convert them to hex to
  display in ephemeral message. */

  /* [Done] Add an option: add an option to the poll. Picking option in the select menu responds with a text modal, 
  where the user can enter the option they want to add. Entire embed will have to be replaced.

  There will be 2 interaction events to handle — one from the select menu and then one from the text modal . */

  /* Edit an option: edit an option in the poll. Picking option in the select menu responds with a text modal,
  where the user will enter the option they want to edit (number or emote), and then a new modal will pop up 
  prompting the user to enter the new poll option.
  
  There will be 3 interactions to handle — one from the select menu, one from the option text modal and one
  from the new poll option text modal. */

  /* End poll: closes the poll by removing the reactions so that staff can't change their vote anymore. Select
  menu will also disappear. The only thing that will remain is a button saying 'Re-Open Poll'. Polls can be a timed
  close or closed manually. */
  async execute(interaction) {
    // console.log(interaction)

    if (interaction.data.custom_id === 'poll_additional_actions') {
      if (interaction.data.values[0] === 'show_results') {
        interaction.defer(64);
        const pollResultsEmbed = await this.generatePollResults(interaction.message);
        interaction.createFollowup({ embed: pollResultsEmbed });
      } else if (interaction.data.values[0] === 'add_option') {
        interaction.createModal({ 
          title: 'Add option',
          custom_id: 'poll_add_option_modal',
          components: [{
            type: 1,
            components: [
              {
                type: 4,
                custom_id: 'text_input_add_option',
                style: 2,
                label: 'Option',
                min_length: 2,
                placeholder: 'Add an option'
              },
            ]
          }]
        });
      } else if (interaction.data.values[0] === 'edit_option') {
        interaction.createModal({ 
          title: 'Edit option',
          custom_id: 'poll_edit_option_modal',
          components: [
            {
              type: 1,
              components: [{
                type: 4,
                custom_id: 'text_input_edit_option_choice',
                style: 1,
                label: 'Option Number/Letter',
                max_length: 1,
                placeholder: 'Enter the number/letter that corresponds to the option you want to edit'
              }]
            },
            // {
            //   type: 1,
            //   components: [{
            //     type: 4,
            //     custom_id: 'text_input_edit_option_new',
            //     style: 2,
            //     label: 'New Option',
            //     min_length: 2,
            //     placeholder: 'Enter the new option'
            //   }]
            // }
          ]
        });

      } else if (interaction.data.values[0] === 'end_poll') {

      } else {

      }

      interaction.message.edit({ embed: interaction.message.embeds[0], components: interaction.message.components });
    }

    if (interaction.data.custom_id === 'poll_add_option_modal') {
      await interaction.deferUpdate();
      const CreatePoll = this.axon.commandRegistry.get('createpoll');
      const originalMessage = await interaction.getOriginalMessage();
      const originalEmbed = originalMessage.embeds[0];
      const newOption = interaction.data.components[0].components[0].value;

      Poll.findById(originalMessage.id, (err, doc) => {
        doc.data.options = { ...doc.data.options, [newOption]: [] }
        doc.save().then((d) => {
          const options = Object.keys(d.data.options);
          const emotes = CreatePoll.createEmotes(options.length);
          const emotesWithOptions = CreatePoll.createOptionsWithEmotes(options, emotes);

          originalMessage.edit({
            embed: { ...originalEmbed, description: emotesWithOptions },
            components: originalMessage.components
          }).then((m) => m.addReaction(emotes[emotes.length - 1]));
        })
        .catch((err) => '');
      });
    }

    console.log(interaction.data);
  }
}

module.exports = Polls;