const HarmonyHubDiscover = require('@harmonyhub/discover').Explorer
var harmonyClient = require('@harmonyhub/client').getHarmonyClient
var events = require('events')
var netstat = require('node-netstat')

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

  var getNextAvailablePort = function (portRangeAsString) {
    var portString = process.env.USE_PORT_RANGE || portRangeAsString

    if (portString) {
      var portStart, portLast

      portStart = parseInt(portString.split('-')[0])
      portLast = parseInt(portString.split('-')[1])

      var portArr = []

      netstat({
        sync: true,
        filter: {
          local: {
            address: null
          }
        }
      }, portArr.push.bind(portArr))

      portArr = portArr.map(
        portInfo => portInfo.local.port
      ).filter(
        // filter port range and also the index to eliminate duplicates
        (portNr, index, arr) => portNr >= portStart && portNr <= portLast && arr.indexOf(portNr) === index
      )

      if (portArr.length > portLast - portStart) {
        throw new Error('No available port in the range ' + portString)
      } else {
        for (var i = portStart; i <= portLast; ++i) {
          if (portArr.indexOf(i) < 0) {
            return i
          }
        }
      }
    } else {
      return 0
    }
  }

  function createClient (node) {
    var harmony = node.harmony
    var ip = node.ip
    if (harmony && typeof harmony.end !== 'undefined') {
      try {
        harmony.end()
      } catch (e) { }
    }
    harmonyClient(ip)
      .catch(function (err) {
        console.log('error: ' + err)
        if (err) throw err
      }).then(function (harmony) {
        node.harmony = harmony
        harmony.on('stateDigest', function (digest) {
          node.harmonyEventEmitter.emit('stateDigest', digest)
        })
      }).catch(function (err) {
        console.log('error: ' + err)
      })
  }

  RED.httpAdmin.get('/harmony/server', function (req, res, next) {
    const discover = new HarmonyHubDiscover(getNextAvailablePort('5002-5100'))
    var hubsFound

    discover.on('update', function (hubs) {
      hubsFound = hubs
    })

    // search for hubs for 3 seconds, then return result
    discover.start()
    setTimeout(function () {
      discover.stop()
      res.end(JSON.stringify(hubsFound))
    }, 3000)
  })

  RED.httpAdmin.get('/harmony/activities', function (req, res, next) {
    if (!req.query.ip) {
      res.status(400).send('Missing argument IP')
    } else {
      harmonyClient(req.query.ip)
        .catch(function (err) {
          res.status(500).send('Request failed.')
        }).then(function (harmony) {
          harmony.getActivities()
            .then(function (acts) {
              harmony.end()
              acts = acts.map(function (action) {
                return {
                  id: action.id,
                  label: action.label
                }
              })
              res.status(200).send(JSON.stringify(acts))
            })
            .catch(function (err) {
              harmony.end()
              res.status(500).send('Request failed.')
            })
        })
    }
  })

  RED.httpAdmin.get('/harmony/commands', function (req, res, next) {
    if (!req.query.ip || !req.query.activity) {
      res.status(400).send('Missing argument.')
    } else {
      harmonyClient(req.query.ip)
        .then(function (harmony) {
          return harmony.getActivities()
            .then(function (acts) {
              var act = acts
                .filter(function (act) {
                  return act.id === req.query.activity
                })
                .pop()
              var commands = act.controlGroup
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
              res.status(200).send(JSON.stringify(commands))
            })
            .catch(function (err) {
              harmony.end()
              if (err) throw err
            })
        })
        .catch(function (err) {
          res.status(500).send('Request failed.')
        })
    }
  })

  RED.httpAdmin.get('/harmony/devices', function (req, res, next) {
    if (!req.query.ip) {
      res.status(400).send('Missing argument IP')
    } else {
      harmonyClient(req.query.ip)
        .then(function (harmony) {
          return harmony.getAvailableCommands()
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
            })
            .catch(function (err) {
              harmony.end()
              if (err) throw err
            })
        })
        .catch(function (err) {
          res.status(500).send('Request failed.')
        })
    }
  })

  RED.httpAdmin.get('/harmony/device-commands', function (req, res, next) {
    if (!req.query.ip || !req.query.deviceId) {
      res.status(400).send('Missing argument.')
    } else {
      harmonyClient(req.query.ip)
        .then(function (harmony) {
          return harmony.getAvailableCommands()
            .then(function (commands) {
              var device = commands.device.filter(function (device) {
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
            })
            .catch(function (err) {
              harmony.end()
              if (err) throw err
            })
        })
        .catch(function (err) {
          res.status(500).send('Request failed.')
        })
    }
  })
}
