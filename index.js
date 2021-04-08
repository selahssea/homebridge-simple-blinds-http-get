var request = require('request');

module.exports = (api) => {
  api.registerAccessory('homebridge-simple-blinds-http-get-plugin', 'SimpleBlindsHttpGetPlugin', SimpleBlindsHttpGetPlugin);
};

class SimpleBlindsHttpGetPlugin {

  constructor(log, config, api) {
      this.log = log;
      this.config = config;
      this.api = api;

      this.openURL = config.open_url;
      this.closeURL = config.close_url;
      this.statusURL = config.status_url;

      this.Service = this.api.hap.Service;
      this.Characteristic = this.api.hap.Characteristic;

      // extract name from config
      this.name = config.name;

      // create a new Slats service
      this.service = new this.Service.Slats(this.name);

      // create handlers for required characteristics
      this.service.getCharacteristic(this.Characteristic.CurrentSlatState)
        .onGet(this.handleCurrentSlatStateGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.SlatType)
        .onGet(this.handleSlatTypeGet.bind(this));

      this.service.getCharacteristic(this.Characteristic.SwingMode)
        .onGet(this.handleSwingModeGet.bind(this))
        .onSet(this.handleSwingModeSet.bind(this));

      this.service.getCharacteristic(this.Characteristic.TargetTiltAngle)
        .onSet(this.handTargetTiltAngleSet.bind(this));

  }

  handleSwingModeSet(value) {
    this.log(`handleSwingModeSet: ${value}`)
    value ? this.run(this.openURL, resp => {
      this.log(`Opening response: ${resp}`);
    }) : this.run(this.closeURL, () => {
      this.log(`Closing response: ${resp}`);
    })
  }

  handTargetTiltAngleSet(value) {
    this.log(`handTargetTiltAngleSet: ${value}`)
    value ? this.run(this.openURL, resp => {
      this.log(`Opening response: ${resp}`);
    }) : this.run(this.closeURL, () => {
      this.log(`Closing response: ${resp}`);
    })
  }

  handleSwingModeGet() {
    let currentValue = this.Characteristic.SwingMode.SWING_ENABLED;
    this.run(this.statusURL, resp => {
      currentValue = resp;
    });
    return currentValue;
  }

  /**
   * Handle requests to get the current value of the "Current Slat State" characteristic
   */
  handleCurrentSlatStateGet() {
    this.log.debug('Triggered GET CurrentSlatState');

    // set this to a valid value for CurrentSlatState
    const currentValue = this.Characteristic.CurrentSlatState.SWINGING;

    return currentValue;
  }


  /**
   * Handle requests to get the current value of the "Slat Type" characteristic
   */
  handleSlatTypeGet() {
    this.log.debug('Triggered GET SlatType');

    // set this to a valid value for SlatType
    const currentValue = this.Characteristic.SlatType.VERTICAL;

    return currentValue;
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