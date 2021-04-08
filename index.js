const request = require('request');

module.exports = (api) => {
    api.registerAccessory('homebridge-simple-blinds-http-get-plugin', 'SimpleBlindsHttpGetPlugin', SimpleBlindsHttpGetPlugin);
  };
  
  class SimpleBlindsHttpGetPlugin {
  
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.openURL = config.open_url;
        this.closeURL = config.close_url;
        this.statusURL = config.status_url;
        this.api = api;

        this.targetPosition = 0; // 0 – 100
        this.currentPosition = 100;
  
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
  
        // extract name from config
        this.name = config.name;
  
        // create a new Window Covering service
        this.service = new this.Service.WindowCovering(this.name);
  
        // create handlers for required characteristics
        this.service.getCharacteristic(this.Characteristic.CurrentPosition)
          .onGet(this.handleCurrentPositionGet.bind(this));
  
        this.service.getCharacteristic(this.Characteristic.PositionState)
          .onGet(this.handlePositionStateGet.bind(this));
  
        this.service.getCharacteristic(this.Characteristic.TargetPosition)
          .onGet(this.handleTargetPositionGet.bind(this))
          .onSet(this.handleTargetPositionSet.bind(this));
  
    }
  
    /**
     * Handle requests to get the current value of the "Current Position" characteristic
     */
     handleCurrentPositionGet(callback) {
      this.log.debug('Triggered GET CurrentPosition');

      let currentValue = 1;

      this.run(this.statusURL, status => {
        if (status == 0) {
            this.log(`Current status CLOSED`);
            currentValue = 0
        } else if (status == 1) {
            this.log(`Current status OPENED`);
            currentValue = 100
        }
        this.currentPosition = currentValue;
        // callback(null, currentValue);
      })

      // this.currentPosition = currentValue;
      return this.currentPosition;
      // return currentValue;
    }
  
  
    /**
     * Handle requests to get the current value of the "Position State" characteristic
     */
    handlePositionStateGet() {
      this.log.debug('Triggered GET PositionState');
  
      // set this to a valid value for PositionState
      const currentValue = this.Characteristic.PositionState.STOPPED;
  
      return currentValue;
    }
  
  
    /**
     * Handle requests to get the current value of the "Target Position" characteristic
     */
     handleTargetPositionGet(callback) {
      this.log.debug('Triggered GET TargetPosition');
      return this.targetPosition;
      //callback(null, this.targetPosition);
    }
  
    /**
     * Handle requests to set the "Target Position" characteristic
     */
    handleTargetPositionSet(value, callback) {
      this.targetPosition = value ? 0 : 100;
      let currentValue = 0;
      this.log('Triggered SET TargetPosition:', value);
      this.run(value ? this.openURL : this.closeUrl, status => {
        if (status == 'opened') {
            this.log(`Current status OPENED`);
            currentValue = 100;
        } else if (status == 'closed') {
            this.log(`Current status CLOSED`);
            currentValue = 0;
        }
        this.currentPosition = currentValue;
      })
      this.log.debug('Triggered SET TargetPosition:', value);
    }

    run(commandUrl, callback, errorCallback) {
        request({
            method: 'GET',
            url: commandUrl,
        }, (err, response, body) => {
            if (!err && response && response.statusCode == 200) {
                callback(body);
            } else {
                errorCallback(`error: ${err.message}, body: ${body}`);
              }
          });
      }
    
      getServices() {
        return [this.service];
      }
    
    }