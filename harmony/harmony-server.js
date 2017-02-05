var HarmonyHubDiscover = require('harmonyhubjs-discover')
var harmonyClient = require('harmonyhubjs-client')

module.exports = function (RED) {
  function HarmonyServerNode (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.ip = n.ip

    harmonyClient(node.ip).then(function (harmony) {
      node.harmony = harmony
      !(function keepAlive () {
        harmony.request('getCurrentActivity').timeout(50000).then(function (response) {
          setTimeout(keepAlive, 50000)
        }).catch(function (e) {
          console.log('Disconnected from Harmony Hub: ' + e)
        })
      }()) // jshint ignore:line
    }).catch(function (err) {
      console.log('error: ' + err)
      if (err) throw err
    })
  }
  RED.nodes.registerType('harmony-server', HarmonyServerNode)

  RED.httpAdmin.get('/harmony/server', function (req, res, next) {
    var discover = new HarmonyHubDiscover(61991)

    discover.on('online', function (hub) {
      res.end(JSON.stringify(hub.ip))
      discover.stop()
    })

    discover.start()
  })

  RED.httpAdmin.get('/harmony/activities', function (req, res, next) {
    if (!req.query.ip) {
      res.status(400).send('Missing argument IP')
    } else {
      harmonyClient(req.query.ip)
                .then(function (harmony) {
                  harmony.getActivities()
                        .then(function (acts) {
                          harmony.end()
                          res.status(200).send(JSON.stringify(acts))
                        }).fail(function (err) {
                          harmony.end()
                          res.status(500).send('Request failed.')
                          if (err) throw err
                        })
                }).fail(function (err) {
                  res.status(500).send('Request failed.')
                  if (err) throw err
                })
    }
  })

  RED.httpAdmin.get('/harmony/commands', function (req, res, next) {
    if (!req.query.ip || !req.query.activity) {
      res.status(400).send('Missing argument.')
    } else {
      harmonyClient(req.query.ip)
                .then(function (harmony) {
                  harmony.getActivities()
                        .then(function (acts) {
                          acts.some(function (act) {
                            if (act.id === req.query.activity) {
                              harmony.end()
                              res.status(200).send(JSON.stringify(act.controlGroup))
                            }
                          })
                        }).fail(function (err) {
                          harmony.end()
                          res.status(500).send('Request failed.')
                          if (err) throw err
                        })
                }).fail(function (err) {
                  res.status(500).send('Request failed.')
                  if (err) throw err
                })
    }
  })
}
