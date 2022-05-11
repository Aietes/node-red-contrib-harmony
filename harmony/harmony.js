module.exports = function (RED) {
   function HarmonySendCommand (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label
    node.command = n.command
    node.harmony_type = n.harmony_type
    node.repeat = Number.parseInt(n.repeat) || 1
    node.releasetimestamp = Number.parseInt(n.releasetimestamp) || 50
    node.presstimestamp = Number.parseInt(n.presstimestamp) || 0
    node.delay = Number.parseInt(n.delay) || 0

    
    
    if (!node.server) {
      node.warn("HarmonySendCommand: no server");
      return
    }
    var action = decodeURI(node.command)

    node.on('input', function (msg) {
      var globalContext = this.context().global;

      if (!node.command ) {
        node.warn("HarmonySendCommand: missing command")
        node.send({payload: false})
      } else {
        globalContext.set("HarmonyFunction","Command");
        globalContext.set("HarmonyAction",action);
        globalContext.set("HarmonyDevice",node.activity);
        for (var i = 0; i < node.repeat; i++) {
          node.server.harmony.request('holdAction', 'action=' + action + ':status=press' + ':timestamp='+node.presstimestamp)
            .catch(function (err) {
              node.send({payload: false})
              if (err) throw err
            }).then(function (response) {
              //node.server.harmony.request('holdAction', 'action=' + action + ':status=hold' + ':timestamp='+node.presstimestamp)
              setTimeout(function(){ node.server.harmony.request('holdAction', 'action=' + action + ':status=release' + ':timestamp='+node.releasetimestamp)
                 .catch(function (err) {
                  node.send({payload: false})
                  console.log('Error: ' + err)
              })
            }, node.delay);
             
            })
        }
        node.send({payload: true})
      }
    })
  }
  RED.nodes.registerType('H command', HarmonySendCommand)

  function HarmonySendPress (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label
    node.command = n.command
    node.harmony_type = n.harmony_type
    node.repeat = Number.parseInt(n.repeat) || 1
    node.timestamp = Number.parseInt(n.timestamp) || 0

    if (!node.server) {
      node.warn("HarmonySendPress: no server");
      return
    }

    var action = decodeURI(node.command)

    node.on('input', function (msg) {
      var globalContext = this.context().global;
      if (!node.command || !node.server) {
        node.send({payload: false})
      } else {
        globalContext.set("HarmonyFunction","Press");
        globalContext.set("HarmonyAction",action);
        for (var i = 0; i < node.repeat; i++) {
          node.server.harmony.request('holdAction', 'action=' + action + ':status=press' + ':timestamp='+node.timestamp)
            .catch(function (err) {
              node.send({payload: false})
              if (err) throw err
            }).then(function (response) {
             
            })
        }
        node.send({payload: true})
      }
    })
  }
  RED.nodes.registerType('H press', HarmonySendPress)

  function HarmonySendRelease (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label
    node.command = n.command
    node.harmony_type = n.harmony_type
    node.repeat = Number.parseInt(n.repeat) || 1
    node.timestamp = Number.parseInt(n.timestamp) || 0

    if (!node.server) {
      node.warn("HarmonySendRelease: no server");
      return
    }

    var action = decodeURI(node.command)

    node.on('input', function (msg) {
 
      if (!node.command || !node.server) {
        node.send({payload: false})
      } else {
        var globalContext = this.context().global;
        globalContext.set("HarmonyFunction","Release");
        globalContext.set("HarmonyAction",action);
        globalContext.set("HarmonyDevice",node.activity);
        for (var i = 0; i < node.repeat; i++) {
          node.server.harmony.request('holdAction', 'action=' + action + ':status=release' + ':timestamp='+node.timestamp)
            .catch(function (err) {
              node.send({payload: false})
              if (err) throw err
            }).then(function (response) {
             
            })
        }
        node.send({payload: true})
      }
    })
  }
  RED.nodes.registerType('H release', HarmonySendRelease)

  function HarmonySendHold (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label
    node.command = n.command
    node.harmony_type = n.harmony_type
    node.repeat = Number.parseInt(n.repeat) || 1
    node.timestamp = Number.parseInt(n.timestamp) || 0

    if (!node.server) {
      node.warn("HarmonyHold: no server");
      return
    }
    var action = decodeURI(node.command)

    node.on('input', function (msg) {

      if (!node.command || !node.server) {
        node.send({payload: false})
      } else {
        var globalContext = this.context().global;
        globalContext.set("HarmonyFunction","Hold");
        globalContext.set("HarmonyAction",action);
        globalContext.set("HarmonyDevice",node.activity);
        for (var i = 0; i < node.repeat; i++) {
          node.server.harmony.request('holdAction', 'action=' + action + ':status=hold' + ':timestamp='+node.timestamp)
            .catch(function (err) {
              node.send({payload: false})
              if (err) throw err
            }).then(function (response) {
             
            })
        }
        node.send({payload: true})
      }
    })
  }
  RED.nodes.registerType('H hold', HarmonySendHold)



  function HarmonyActivity (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.activity = n.activity
    node.label = n.label

    if (!node.server) {
      node.warn("HarmonyActivity: no server");
      return
    }
    node.on('input', function (msg) {

      node.server.harmony.startActivity(node.activity)
        .catch(function (err) {
          node.send({payload: false})
          console.log('Error: ' + err)
        }).then(function (response) {
          node.send({payload: true})
        })
    })
  }
  RED.nodes.registerType('H activity', HarmonyActivity)

  function HarmonyGetActivity (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
   
    if (!node.server) {
      node.warn("HarmonyGetActivity: no server");
      return
    }
    node.on('input', function (msg) {

      node.server.harmony.getCurrentActivity()
        .catch(function (err) {
          node.send({payload: false})
          console.log('Error: ' + err)
        }).then(function (response) {
          //console.log('Harmony: ' + response)
          node.send({payload: response})
        })
    })
  }

  RED.nodes.registerType('H GetActivity', HarmonyGetActivity)

  function HarmonyGetActivities (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
   
    if (!node.server) {
      node.warn("HarmonyGetActivities: no server");
      return
    }
    node.on('input', function (msg) {

      node.server.harmony.getActivities()
        .catch(function (err) {
          node.send({payload: false})
          console.log('Error: ' + err)
        }).then(function (response) {
          //console.log('Harmony: ' + response)
          node.send({payload: response})
        })
    })
  }

  RED.nodes.registerType('H GetActivities', HarmonyGetActivities)


 
  function HarmonyGetCommands (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
   
    if (!node.server) {
      node.warn("HarmonyGetCommands: no server");
      return
    }
    node.on('input', function (msg) {

      node.server.harmony.getAvailableCommands()
        .catch(function (err) {
          node.send({payload: false})
          console.log('Error: ' + err)
        }).then(function (response) {
          //console.log('Harmony: ' + response)
          node.send({payload: response})
        })
    })
  }

  RED.nodes.registerType('H GetCommands', HarmonyGetCommands)

  function HarmonyObserve (n) {
    RED.nodes.createNode(this, n)
    var node = this

    node.server = RED.nodes.getNode(n.server)
    node.label = n.label

    if (!node.server) {
      node.warn("HarmonyObserve: no server");
      return
    }

    setTimeout(function () {
      try {
        node.server.harmonyEventEmitter.on('stateDigest', function (digest) {
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
}
