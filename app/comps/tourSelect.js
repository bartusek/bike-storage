var Ractive = require('ractive');
import * as avail from '../availability.js';

var tourSelectComponent = Ractive.extend({
  isolated: false,
  template: require('./tourSelect.html'),
  data: {
      something: 'hahah',
  },
  oninit() {
    this.on('FireTourSelected', function(event) {
      // console.log('TourSelect compontent, tour selected, event ' + JSON.stringify(event));
      this.root.router('/tour/CZB'+event.context.code);
    });

    this.on('displayAddTour', function(event) {
      this.set('addTour.correct',false);
      this.set('view.addTour',true);
      this.observeRegistration=this.observe('addTour.code', function(event) {
        const code = avail.parseTourCode(event);
        this.set('addTour.correct', code !==undefined);
        if (code !== undefined) {
          console.log('Tour mask ' + JSON.stringify(avail.getTourMask(event)));
          //   console.log('Tour mask and ' + JSON.stringify(avail.and(avail.getTourMask(event),[0,0,0,0,0,0,0,0,4032,0,0,0])));
          //   console.log('Tour mask or ' + JSON.stringify(avail.or(avail.getTourMask(event),[0,0,0,0,0,0,0,0,4032,0,0,0])));
          //   console.log('Tour mask not ' + JSON.stringify(avail.not(avail.getTourMask(event))));
          }
        });
      });
    this.on('addTour', function(event) {
      console.log('Add tour ' + JSON.stringify(event));
      const newCode = this.get('addTour.code');
      const timeMask = avail.getTourMask(newCode);
      const d = newCode % 100;
      const m = ((newCode - d) % 10000) / 100;

      this.set('view.addTour',false);
      this.push('tours',{"code":newCode, "time":timeMask})
      this.fire('showTourDetail', { context: { code: newCode}});
      if (this.observeRegistration) {
        this.observeRegistration.cancel();
      }
      this.set('addTour.code','');
    });
  },
});


module.exports = tourSelectComponent;
