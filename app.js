var express = require('express'),
  config = require('./config/config');

var app = express();
var irc = require('irc');

require('./config/express')(app, config);

var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket) {

	var channel = '#ingenuitydesign';

	socket.on('login', function(credentials) {

		var username = credentials.username || 'Guest';
		var password = credentials.password || false;

		// This is where we do the fun stuff
		var client = new irc.Client('irc.freenode.net', username, {
			channels: [channel]
		});

    client.hostMask = client.hostMask || ''; // Bug in irc.js

		socket.on('disconnect', function() {
			client.disconnect();
		});

		client.addListener('error', function(err) {
			console.log(err);
		});

		client.addListener('quit', function(message) {
			console.log('Disconnected from IRC');
		});

		client.addListener('registered', function(message) {

			socket.emit('chat notification', {
				handle: "login",
				code: "ok",
				message: 'Logged in'
			});

      client.addListener('names', function(channel, nicks) {
        console.log(nicks);
        console.log(channel);

        var users = [];

        for (var x in nicks) {
          users.push(nicks[x] + x);
        }

        var obj = {
          channel: channel,
          users: users
        };

        socket.emit('chat notification', {
          handle: 'names',
          code: 'ok',
          message: obj
        });

      });

			client.addListener('message' + channel, function (from, message) {
				socket.emit('chat message', {
					from: from,
					message: message
				});

			});

			socket.on('chat message', function(msg) {
				console.log(msg);
				client.say(channel, msg);
			});

		});

	});

});

http.listen(process.env.PORT || config.port);
