var HarmonyHubDiscover = require('harmonyhubjs-discover')
var harmonyClient = require('harmonyhubjs-client')
var events = require('events')

module.exports = function (RED) {
  function HarmonyServerNode (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.ip = n.ip
    node.harmonyEventEmitter = new events.EventEmitter()
    createClient(node)

    this.on('close', function () {
      if (node.harmony && typeof node.harmony.end !== 'undefined') {
        try {
          node.harmony.end()
        } catch (e) { }
      }
    })
  }
  RED.nodes.registerType('harmony-server', HarmonyServerNode)

  function createClient (node) {
    var harmony = node.harmony
    var ip = node.ip
    if (harmony && typeof harmony.end !== 'undefined') {
      try {
        harmony.end()
      } catch (e) { }
    }
    harmonyClient(ip).then(function (harmony) {
      node.harmony = harmony
      harmony.on('stateDigest', function(digest) {
        node.harmonyEventEmitter.emit('stateDigest', digest)
      })
      !(function keepAlive () {
        harmony.request('getCurrentActivity').timeout(50000).then(function (response) {
          setTimeout(keepAlive, 50000)
        }).catch(function (e) {
          console.log('Disconnected from Harmony Hub: ' + e)
          createClient(node)
        })
      }()) // jshint ignore:line
    }).catch(function (err) {
      console.log('error: ' + err)
      if (err) throw err
    })
  }

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

  RED.httpAdmin.get('/harmony/devices', function (req, res, next) {
    if (!req.query.ip) {
      res.status(400).send('Missing argument IP')
    } else {
      harmonyClient(req.query.ip)
                .then(function (harmony) {
                  harmony.getAvailableCommands()
                        .then(function (commands) {
                          var devices = commands.device
                            .filter(function (device) {
                              return device.controlGroup.length > 0
                            })
                            .map(function (device) {
                              return {id: device.id, label: device.label}
                            })
                          harmony.end()
                          res.status(200).send(JSON.stringify(devices))
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

  RED.httpAdmin.get('/harmony/device-commands', function (req, res, next) {
    if (!req.query.ip || !req.query.deviceId) {
      res.status(400).send('Missing argument.')
    } else {
      harmonyClient(req.query.ip)
                .then(function (harmony) {
                  harmony.getAvailableCommands()
                        .then(function (commands) {
                          var device = commands.device.filter(function(device) {
                            return device.id === req.query.deviceId
                          }).pop()
                          var deviceCommands = device.controlGroup
                            .map(function (group) {
                              return group.function
                            })
                            .reduce(function (prev, curr) {
                              return prev.concat(curr)
                            })
                            .map(function (fn) {
                              return {action: fn.action, label: fn.label}
                            })
                          harmony.end()
                          res.status(200).send(JSON.stringify(deviceCommands))
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
