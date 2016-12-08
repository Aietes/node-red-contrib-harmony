var HarmonyHubDiscover = require('harmonyhubjs-discover');

module.exports = function(RED) {
    function HarmonyServerNode(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        node.ip = n.ip;
    }
    RED.nodes.registerType("harmony-server",HarmonyServerNode);

    RED.httpAdmin.get('/harmony/server', function(req, res, next){
        var discover = new HarmonyHubDiscover(61991);
        
        discover.on('online', function(hub) {
                res.end(JSON.stringify(hub.ip));
                discover.stop();          
            });

		discover.start();
	});
}