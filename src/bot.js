const debug = require('debug')('utb:bot.js');
const config = require('config');
const Discord = require('discord.js');
const { join } = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const db = low(new FileSync(join(process.cwd(), 'db.json')));

db.defaults({
	channel: {},
	record: {},
	lastStatus: {}
}).write();

const parse = require('./parseCmd')(db);
const cron = require('./cron')(db);

const client = new Discord.Client();

client.login(config.get('token'));

client.on('ready', () => {
	debug('Discord bot logined');
	client.user.setActivity(config.get('at'))
	client.ws.on('INTERACTION_CREATE', i => parse(i, client));
	cron(client);
});

require('./registerCmd');
