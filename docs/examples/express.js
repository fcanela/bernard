const express = require('express');
const app = express();
const server = app.listen(9000);

const Bernard = require('bernard');
const bernard = new Bernard();
bernard.prepare();

bernard.addTask({
    title: 'Express Server',
    handler: function() {
        return server.close();
    }
});



