var Ractive = require('ractive');

var edit = Ractive.extend({
  isolated: false,
  template: require('./edit.html'),
  data: {
      iserror: 0,
      iscorrect: 0,
      myplaceholder: 'some text',
  },
});


module.exports = edit;
