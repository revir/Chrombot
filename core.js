var socket = io.connect('http://localhost: 5000');
  socket.on('connected', function (data) {
    console.log('connected');
    // socket.emit('my other event', { my: 'data' });
});