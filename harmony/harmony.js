module.exports = function (RED) {
  function HarmonySendCommand (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label
    node.command = n.command
    node.repeat = Number.parseInt(n.repeat) || 1

    var action = decodeURI(node.command)

    if (!node.server) return

    node.on('input', function (msg) {
      try {
        msg.payload = JSON.parse(msg.payload)
      } catch (err) {

      }

      if (!node.command || !node.server) {
        node.send({payload: false})
      } else {
        var k = Math.floor(node.repeat / 3)
        var m = node.repeat % 3

        for (var i = 0; i < k; i++) {
          setTimeout(function () {
            node.server.harmony.send('holdAction', 'action=' + action + ':status=press' + ':timestamp=0').then(function () {
              node.server.harmony.send('holdAction', 'action=' + action + ':status=release' + ':timestamp=50')
            })
            node.server.harmony.send('holdAction', 'action=' + action + ':status=press' + ':timestamp=100').then(function () {
              node.server.harmony.send('holdAction', 'action=' + action + ':status=release' + ':timestamp=150')
            })
            node.server.harmony.send('holdAction', 'action=' + action + ':status=press' + ':timestamp=200').then(function () {
              node.server.harmony.send('holdAction', 'action=' + action + ':status=release' + ':timestamp=250')
            })
          }, i * 300)
        }

        for (i = 0; i < m; i++) {
          var offset = i * 50 + 50
          node.server.harmony.send('holdAction', 'action=' + action + ':status=press' + ':timestamp=' + i * 50).then(function () {
            node.server.harmony.send('holdAction', 'action=' + action + ':status=release' + ':timestamp=' + offset)
          })
        }
        node.send({payload: true})
      }
    })
  }
  RED.nodes.registerType('H command', HarmonySendCommand)

  function HarmonyActivity (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label

    if (!node.server) return

    node.on('input', function (msg) {
      try {
        msg.payload = JSON.parse(msg.payload)
      } catch (e) {

      }
      node.server.harmony.startActivity(node.activity).then(function (response) {
        node.send({payload: true})
      }).catch(function (err) {
        node.send({payload: false})
        console.log('Error: ' + err)
      })
    })
  }
  RED.nodes.registerType('H activity', HarmonyActivity)

  function HarmonyObserve (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.label = n.label

    if (!node.server) return

    setTimeout(function () {
      try {
        node.server.harmonyEventEmitter.on('stateDigest', function (digest) {
		  // console.log(JSON.stringify(digest));
          try {
            node.send({
              payload: {
                activityId: digest.activityId,
                activityStatus: digest.activityStatus
              }
            })
          } catch (err) {
            console.log('Error: ' + err)
          }
        })
      } catch (err) {
        console.log('Error: ' + err)
      }
    }, 2000)
  }
  RED.nodes.registerType('H observe', HarmonyObserve)

  function HarmonySendDeviceCommand (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.deviceId = n.device
    node.label = n.label
    node.command = n.command
    node.repeat = Number.parseInt(n.repeat) || 1

    if (!node.server) return

    var action = decodeURI(node.command)

    node.on('input', function (msg) {
      try {
        msg.payload = JSON.parse(msg.payload)
      } catch (err) { }

      if (!node.command || !node.server) {
        node.send({payload: false})
        return;
      }

      for (var i = 0; i < node.repeat; i++) {
        setTimeout(function () {
          node.server.harmony.send('holdAction', 'action=' + action + ':status=press').then(function () {
            node.server.harmony.send('holdAction', 'action=' + action + ':status=release')
          })
        }, 100)
      }
      node.send({payload: true})
    })
  }
  RED.nodes.registerType('H device command', HarmonySendDeviceCommand)
}
