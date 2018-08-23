# Harmony Hub Integration for Node-RED
[![npm version](https://badge.fury.io/js/node-red-contrib-harmony.svg)](http://badge.fury.io/js/node-red-contrib-harmony) [![GitHub release](https://img.shields.io/github/release/Aietes/node-red-contrib-harmony.svg)](https://github.com/Aietes/node-red-contrib-harmony/releases/latest) [![Build Status](https://travis-ci.org/Aietes/node-red-contrib-harmony.svg?branch=master)](https://travis-ci.org/Aietes/node-red-contrib-harmony) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

Control your devices connected to a Logitech&trade; Harmony Hub from [Node-RED](https://nodered.org).

## Getting started

If you haven't done so yet, install [Node-RED](http://nodered.org/docs/getting-started/installation)

```
sudo npm install -g node-red
```

There are two ways to install the extension: Via *npm* on the **terminal** or from within *Node-RED* in the **browser**.

### Install via terminal and npm

In the terminal open the user data directory `˜/.node-red` and install the package

```
cd ˜/.node-red
npm install node-red-contrib-harmony
```

Then run or restart Node-RED

```
node red
```
Open your Node-RED instance, typically under <http://localhost:1880>, and you should see the new nodes available in the palette in the group **harmony**.

### Install via Node-RED

You can install the extension simply in Node-RED in your browser, by default under <http://localhost:1880>. Click on the *Menu* button (sandwich icon) in the upper right corner. In the menu click **Manage palette**. In the side-panel that opens on the left click on the tab **Install**. In the search field enter *harmony*, in the result list a *node-red-contrib-harmony* card will appear. Click on the **install** button on this card, and you are done. You should now find the new nodes available in the palette in the group **harmony**.

## Usage / Available nodes

Three nodes are available in Node-RED: **H command**, **H activity**, and **H observe**, located in the group **harmony**.

### H command

A node to send a **Command** to a Harmony Hub through Node-RED.

A Harmony **Hub** needs to be selected from the list or created by clicking on the edit button. The Harmony Hub **IP** address can be autodetected by clicking on the search button in the configuration node.

An **Activity** or **Device** that is set up on the Harmony Hub needs to be selected. The dropdown loads available activities and devices automatically, if needed the list can be refreshed by clicking on the refresh button next to the dropdown. Selecting an activity or device changes the available commands below, therefore you'll need to reselect a command below.

A **Command** needs to be selected. The dropdown loads available commands for the selected activity or device automatically, if needed the list can be refreshed by clicking on the refresh button next to the dropdown.

The **Repeat** field allows for the command to be repeated. The default is *1*, meaning the command is send once. For example entering *10* will send the command exactly 10 times. This can be helpful when using commands for volume or channels.

The command configured in the node will be triggered by any input injected into the node, the output slot will return *msg.payload = true* if the command was sent successfully.

### H activity

A node to activate an **Activity** on a Harmony Hub through Node-RED

A Harmony **Hub** needs to be selected from the list or created by clicking on the edit button. The Harmony Hub
**IP** address can be autodetected by clicking on the search button in the configuration node.

An **Activity** that is set up on the Harmony Hub needs to be selected. The dropdown loads available activities automatically, if needed the list can be refreshed by clicking on the refresh button next to the dropdown.

To switch off, select *PowerOff* from the **Activity** dropdown list, or enter *"-1"* into the field.

The command configured in the node will be triggered by any input injected into the node, the output slot will return *msg.payload = true* if the command was sent successfully.

### H observe

A node to observe an **Activity** being triggered on a Harmony Hub through Node-RED

A Harmony **Hub** needs to be selected from the list or created by clicking on the edit button. The Harmony Hub
**IP** address can be autodetected by clicking on the search button in the configuration node.

When an **Activity** is switched on the Harmony Hub, the node sends an object with a payload to the output:
`payload: { activityId: activityId, activityStatus: activityStatus }`
The *activityId* is the ID of the current activity, the *activityStatus* represents the following states:
0 = Hub is off, 1 = Activity is starting, 2 = Activity is started, 3 = Hub is turning off.

## Built With

* [NodeJS](https://nodejs.org/dist/latest-v6.x/docs/api/) - JavaScript runtime built on Chrome's V8 JavaScript engine.
* [Node-RED](http://nodered.org/docs/creating-nodes/) - for wiring together hardware devices, APIs and online services.

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request.

## Authors

* **Stefan Krüger** - *Initial work* - [Aietes](https://github.com/Aietes)
* **Daniel Freese** - *Coding help* - [AirBorne04](https://github.com/AirBorne04)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

This Node-RED module is based on the great work of
**Manuel Alabor** [swissmanu](https://github.com/swissmanu) and
**Daniel Freese** [AirBorne04](https://github.com/AirBorne04), using his [harmonyhub](https://github.com/AirBorne04/harmonyhub) client and discover libraries.
