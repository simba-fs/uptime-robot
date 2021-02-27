require('dotenv').config();

const simply = require('simply.js');
const helpMsg = require('./helpMsg.js');

const lowdb = require('lowdb');
const Adapter = require('lowdb/adapters/FileSync');
const db = lowdb(new Adapter('db.json'));

let url = db.get('url');
let channelID = db.get('channel');
let channel = [];

/**
 *	get channel object when the bot restart
 *	@function
 *	@param {Array} broadcastPool - the pool contains channel object
 *	@param {Array} broadcastPoolID - the pool contains channel id
 */
function restoreChannel(channel, channelID){
	channel.length = 0;
	channelID.forEach(id => {
		channel.push(simply.client.channels.get(id));
	});
}

/**
 *	verify the url
 *	@function
 *	@param {String} url
 */
function isUrl(target){
	let parsedUrl = require('url').parse(target);
	return (parsedUrl.protocol && parsedUrl.slashes && parsedUrl.host);
}

/**
 *	replace '.' to _
 */

simply.login(process.env.DC_ROT_TOKEN);

simply.on('ready', () => {
	restoreChannel(channel, channelID);
})

simply.set('prefix', '!');
simply.set('activity', `stay at ${process.env.at || 'known'}`);

simply.cmd('utb', (msg, arg) => {
	switch(arg[1]){
		case 'ping':
			msg.channel.send('pong');
			break;
		case 'addUrl':
			(() => {
				if(arg.length < 3){
					msg.channel.send('Warning! You must pass a url');
				}else if(url.includes(arg[2]).value()){
					msg.channel.send('Url has added to the list');
				}else{
					url.push(arg[2]).write();
					msg.channel.send(`Add ${arg[2]} to the list`);
				}
			})();
			break;
		case 'removeUrl':
			(() => {
				if(arg.length < 3){
					msg.channel.send('Warning! You must pass a url');
				}else if(url.includes(arg[2])){
					url.remove(i => i === arg[2]).write();
					msg.channel.send(`Remove ${arg[2]} from the list`);
				}
			})();
			break;
		case 'listUrl':
			(() => {
				allUrl = [
					'```',
					'Uptime Robot'
				];
				url.value().forEach(i => allUrl.push(i));
				allUrl.push('```');
				msg.channel.send(allUrl.join('\n'));
			})();
			break;
		case 'add':
			(() => {
				if(!channelID.includes(msg.channel.id).value()){
					msg.channel.send(`Add channel ${msg.channel.id}`);
					channel.push(msg.channel);
					channelID.push(msg.channel.id).write();
				}else{
					msg.channel.send('This channel has added');
				}
			})();
			break;
		case 'remove':
			(() => {
				if(channelID.includes(msg.channel.id).value()){
					msg.channel.send(`Remove channel ${msg.channel.id}`);
					channel = channel.filter(i => i.id !== msg.channel.id);
					channelID.remove(i => i === msg.channel.id).write();
				}else{
					msg.channel.send('This channel isn\'t in the list');
				}
			})();
			break;
		case 'help':
		default:
			msg.channel.send(helpMsg);

	}
})

/**
 *	broadcast msg to all channels
 *	@function
 *	@param {String} msg - message to send to the channel
 */
function broadcast(msg){
	channel.forEach(i => i.send(msg));
}

module.exports = broadcast;
