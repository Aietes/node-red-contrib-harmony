var harmony = require('harmonyhubjs-client');

module.exports = function(RED) {
    function HarmonySendCommand(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.server = RED.nodes.getNode(n.server);
        node.activity = n.activity;
        node.label = n.label;
        node.command = n.command;

        if(!node.server) return;

        node.on('input', function(msg) {
            try {
                msg.payload = JSON.parse(msg.payload);
            } catch(e) {

            }

            if(!node.command || !node.server) {
                msg.payload = false;
            } else {
                harmony(node.server.ip)
                    .then(function(harmony) {
                        var encodedAction = decodeURI(node.command);
                        harmony.send('holdAction', 'action=' + encodedAction + ':status=press');
                        harmony.end();
                        msg.payload = true;
                    });
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("H command",HarmonySendCommand);

    function HarmonyActivity(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.server = RED.nodes.getNode(n.server);
        node.activity = n.activity;
        node.label = n.label;

        if(!node.server) return;

        node.on('input', function(msg) {
            try {
                msg.payload = JSON.parse(msg.payload);
            } catch(e) {

            }
            msg.payload = false;
            harmony(node.server.ip)
                .then(function(harmony) {
                    harmony.startActivity(node.activity);
                    harmony.end();
                    msg.payload = true;
                });
            node.send(msg);
        });
    }
    RED.nodes.registerType("H activity",HarmonyActivity);

    RED.httpAdmin.get('/harmony/activities', function(req, res, next) {
        if(!req.query.ip) {
            res.status(400).send("Missing argument IP");
        } else {
            harmony(req.query.ip)
                .then(function(harmony) {
                    harmony.getActivities()
                        .then(function(acts) {
                            harmony.end();
                            res.status(200).send(JSON.stringify(acts));
                        }).fail(function(err) {
                            res.status(500).send("Request failed.");
                        });
                }).fail(function(err) {
                    res.status(500).send("Request failed.");
                });
        }
    });

    RED.httpAdmin.get('/harmony/commands', function(req, res, next) {
        if(!req.query.ip || !req.query.activity) {
            res.status(400).send("Missing argument.");
        } else {
            harmony(req.query.ip)
                .then(function(harmony) {
                    harmony.getActivities()
                        .then(function(acts) {
                            acts.some(function(act) {
                                if(act.id === req.query.activity) {
                                    harmony.end();
                                    res.status(200).send(JSON.stringify(act.controlGroup));
                                }
                            });
                        }).fail(function(err) {
                            res.status(500).send("Request failed.");
                        });
                }).fail(function(err) {
                    res.status(500).send("Request failed.");
                });
        }
    });
};