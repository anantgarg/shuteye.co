var express = require('express'),
	io 	= require('socket.io'),
    uuid = require('node-uuid'),
    app = express();

app.get('/h/:id', function(req, res) {
	if (id == null || id == undefined) {
		res.redirect('/h/' + uuid());
	}
	console.log(id);
});

app.enable('trust proxy').listen(8001);
io.listen(app);

io.sockets.on('connection', function(client) {
	client.on('message', function(details) {
		var other = io.sockets.sockets[details.to];

		if (!otherClient) {
			return;
		}
		delete details.to;
		details.from = client.id;
		otherClient.emit('message', details);
	});

	client.on('join', function(name) {
		client.join(name);
		io.sockes.in(name).emit('joined', {
			room: name, 
			id: client.id
		});
	});

	function leave() {
		var rooms = io.sockets.manager.roomClients[client.id];
		for (var name in rooms) {
			if (name) {
				io.sockets.in(name.slice(1)).emit('left', {
					room: name,
					id: client.id
				});
			}
		}
	}

	client.on('diconnect', leave);
	client.on('leave', leave);

	client.on('create', function(name, callback) {
		callback = name;
		name = uuid();

		if (io.sockets.clients(name).length) {
			callback('taken');
		} else {
			client.join(name);
			if (callback) callback(null, name);
		}
	});
});
