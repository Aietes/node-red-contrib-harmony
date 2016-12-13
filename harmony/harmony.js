var harmony = require('harmonyhubjs-client');

module.exports = function(RED) {
    function HarmonySendCommand(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.server = RED.nodes.getNode(n.server);
        node.activity = n.activity;
        node.label = n.label;
        node.command = n.command;
        node.repeat = Number.parseInt(n.repeat) || 1;

        var action = decodeURI(node.command);

        if(!node.server) return;

        node.on('input', function(msg) {
            try {
                msg.payload = JSON.parse(msg.payload);
            } catch(e) {

            }

            function sendCommand(harmony, action){        
                harmony.send('holdAction', 'action=' + action + ':status=press').catch(function(e){
                    console.log("Error: " + e);
                });
            }

            function closeConnection(harmony, node){
                harmony.end();
                node.send({ payload: true });
            }

            if(!node.command || !node.server) {
                msg.payload = false;
            } else {
                harmony(node.server.ip).then(function(harmony) {
                    for (var i = 0; i < node.repeat; i++) {
                        setTimeout(sendCommand, i*400, harmony, action);
                    }
                    setTimeout(closeConnection, node.repeat*400, harmony, node);   
                }).catch(function(e){
                    console.log("Error: " + e);
                });
            }
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
            harmony(node.server.ip).then(function(harmony) {
                harmony.startActivity(node.activity);
                harmony.end();
                msg.payload = true;
            }).catch(function(e){
                console.log("Error: " + e);
            });
            node.send(msg);
        });
    }
    RED.nodes.registerType("H activity",HarmonyActivity);

    function HarmonyObserve(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.server = RED.nodes.getNode(n.server);
        node.label = n.label;

        if(!node.server) return;

        harmony(node.server.ip).then(function(harmony) {
            ! function keepAlive(){
                harmony.request('getCurrentActivity').timeout(5000).then(function(response) {
                    setTimeout(keepAlive, 50000);
                }).catch(function(e){
                    //disconnected from hub
                });
            }();

            harmony.on('', function(digest) {
                console.log('stateDigest: ' + JSON.stringify(digest));
                msg.payload = digest;
                node.send(msg);
            });
        }).catch(function(e){
            console.log('error: '+e);
        });
    }
    RED.nodes.registerType("H observe",HarmonyObserve);

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