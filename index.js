// Load requirements
const config = require("./util/config.json");
const qVars = require("./util/qVariables.js");
const qFuncs = require("./util/functions.js");
const commands = require("./util/commands.js");

// Runs on start
qVars.CLIENT.on("ready", () => {
  console.log(`Bot has started`);
  qVars.CLIENT.user.setActivity(`queen help`);

  qFuncs.getMessagesWithAttachments(qVars.CLIENT.channels.cache.get(qVars.BROWNOUTID)).then(output => {
    qVars.brownoutOut = output;
  });

  qFuncs.getMessagesWithAttachments(qVars.CLIENT.channels.cache.get(qVars.QUOTEID)).then(output => {
    qVars.quotesOut = output;
  });

  qVars.lastUpdate = Date.now();
});

// Runs on join new server
qVars.CLIENT.on("guildCreate", guild => {
  console.log(`New guild joined`);
  qVars.CLIENT.user.setActivity(`queen help`);
});

// Runs on leave server
qVars.CLIENT.on("guildDelete", guild => {
  console.log(`Bot has been removed from a guild`);
  qVars.CLIENT.user.setActivity(`queen help`);
});

// Runs when a new message is sent on a server
qVars.CLIENT.on("message", async message => {
  // Counting game moderation
  if (message.channel.id === qVars.COUNTINGGAMEID) {
    qFuncs.countingGameModeration(message);
    return;
  }

  // Don't respond to bots
  if (message.author.bot)
    return;

  var command = message.content.toLowerCase();
  var override = false;

  // Make sure message starts with 'queen' or 'q'
  if (command.startsWith("queen ") || command.startsWith("q ")) {
    override = true;
    command = command.substr(command.indexOf(" ") + 1);
  }

  // If command is not run in general channel or if the gap between last command is greater than generalTimeGap, command will be run
  var currentTime = Math.round((new Date().getTime() / 1000));
  var timeDiff = currentTime - qVars.generalLastCommandTime;
  if (override) {
    if (message.channel.id !== qVars.GENERALID || timeDiff >= qVars.GENERALTIMEGAP) {
      // Get command keyword
      var keyword = command.replace(/ .*/,'');

      // If trying to use buff command, get the [name] desired
      var buffName = "";
      if(keyword.startsWith("buff")) {
        keyword = "buff";
        buffName = command.substr(4).trim();
      }

      // Find command and send message
      var command = command.substr(keyword.length + 1);
      commands.cmds(message, keyword, command, buffName);
    } else if (timeDiff < qVars.GENERALTIMEGAP) {
      message.channel.send("Slow down!");
    }
  }
});

qVars.CLIENT.login(config.token);
