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

        function sendCommand(){
            node.server.harmony.send('holdAction', 'action=' + action + ':status=press')
            .catch(function(e){
                node.send( {payload: false} );
                console.log("Error: " + e);
            });
        }

        node.on('input', function(msg) {
            try {
                msg.payload = JSON.parse(msg.payload);
            } catch(e) {

            }

            if(!node.command || !node.server) {
                node.send( {payload: false} );
            } else {
                for( var i=0; i<node.repeat; i++ ){
                    setTimeout(sendCommand,i*300);
                }
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
            node.server.harmony.startActivity(node.activity).then(function(response){
                node.send( {payload: true} );
            }).catch(function(e){
                node.send( {payload: false} );
                console.log("Error: " + e);
            });
        });
    }
    RED.nodes.registerType("H activity",HarmonyActivity);

    function HarmonyObserve(n) {
        RED.nodes.createNode(this,n);
        var node = this;

        node.server = RED.nodes.getNode(n.server);
        node.label = n.label;

        if(!node.server) return;

        setTimeout(function(){
            node.server.harmony.on('stateDigest', function(digest) {
                try{
                    node.send( {payload: { activityId: digest.activityId, activityStatus: digest.activityStatus } } );
                } catch(e) {
                    console.log("Error: " + e);
                }
            });
        }, 2000);
    }
    RED.nodes.registerType("H observe",HarmonyObserve);
};