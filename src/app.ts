import "dotenv/config";
import {Client, Message, REST, Routes} from "discord.js";

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name:"enable",
    description: 'Enable vxtwtter conversion',
  },
  {
    name:"disable",
    description: 'disable vxtwtter conversion',
  }
];
const rest = new REST({version:"10"}).setToken(process.env.DISCORD_BOT_TOKEN!!);
try {
  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID!!), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

const client = new Client({intents: ["MessageContent","GuildMessages","DirectMessages","Guilds"]});
client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`);
});

let isEnabled: Record<string,boolean> = {};

client.on("messageCreate", async (message:Message) => {
  console.log("messageCreate",message);
  if(isEnabled[message.channelId] === undefined)
  {
    isEnabled[message.channelId] = true;
  }
  if(isEnabled[message.channelId])
  {
    if (message.author.bot) return; // Ignore messages from other bots

    const urlRegex = /(https:\/\/(twitter|x).com\/)\S+/g;
    const urls = message.content.match(urlRegex);
  
    if (urls) {
      const modifiedUrls = urls.map((url) => url.replace(/(twitter\.com|x\.com)/, 'vxtwitter.com'));
      console.log({urls,modifiedUrls});
      if (modifiedUrls.length > 0) {
        const reply = modifiedUrls.join('\n');
        message.channel.send(reply);
        message.channelId
      }
    }
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  console.log("interactionCreate",interaction.commandName);
  switch(interaction.commandName)
  {
    case "ping": 
      await interaction.reply('Pong!');
      break;
    case "enable":
      if(!isEnabled[interaction.channelId])
      {
        isEnabled[interaction.channelId] = true;
        await interaction.reply("vxtwitter conversion enabled");
      }
      else{
        await interaction.reply("vxtwitter conversion already enabled");
      }
      break;
    case "disable":
      isEnabled[interaction.channelId] = false;
      await interaction.reply("vxtwitter conversion disabled");
      break;
  }
});


client.login(process.env.DISCORD_BOT_TOKEN);