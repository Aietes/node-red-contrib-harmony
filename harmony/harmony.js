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
            console.log("input");
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
                        //harmony.startActivity("22915958");
                    });
                msg.payload = true;
            }
            node.send(msg);
        });
    }
    RED.nodes.registerType("H command",HarmonySendCommand);

    RED.httpAdmin.get('/harmony/activities', function(req, res, next) {
        if(!req.query.ip) {
            res.status(500).send("Missing argument IP");
        } else {
            harmony(req.query.ip)
                .then(function(harmony) {
                    harmony.getActivities()
                        .then(function(acts) {
                            res.end(JSON.stringify(acts));
                        });
                });
        }
    });

    RED.httpAdmin.get('/harmony/sendaction', function(req, res, next) {
        if(!req.query.ip || !req.query.action) {
            res.status(500).send("Missing argument.");
        } else {
            harmony(req.query.ip)
                .then(function(harmony) {
                    var encodedAction = req.query.action.replace(/\:/g, '::');
                    console.log(encodedAction);
                    harmony.send('holdAction', 'action=' + encodedAction + ':status=press');
                    //harmony.startActivity("22915958");
                });
        }
    });

    RED.httpAdmin.get('/harmony/commands', function(req, res, next) {
        if(!req.query.ip || !req.query.activity) {
            res.status(500).send("Missing argument.");
        } else {
            harmony(req.query.ip)
                .then(function(harmony) {
                    harmony.getActivities()
                        .then(function(acts) {
                            acts.some(function(act) {
                                if(act.id === req.query.activity) {
                                    res.end(JSON.stringify(act.controlGroup));
                                    return true
                                }
                                return false
                                });
                            });
                    });
        }
    });
};  

//                     harmony.isOff()
//                         .then(function(off){
//                             console.log('Currently off.')
//                         });
// harmony('192.168.1.200')
//   .then(function(harmonyClient) {
//     harmonyClient.isOff()
//       .then(function(off) {
//         if(off) {
//           console.log('Currently off. Turning TV on.')

//           harmonyClient.getActivities()
//             .then(function(activities) {
//               activities.some(function(activity) {
//                 if(activity.label === 'Watch TV') {
//                   var id = activity.id
//                   harmonyClient.startActivity(id)
//                   harmonyClient.end()
//                   return true
//                 }
//                 return false
//               })
//             })
//         } else {
//           console.log('Currently on. Turning TV off')
//           harmonyClient.turnOff()
//           harmonyClient.end()
//         }
//       })
//   })

