require('./css/main.css');
require('../node_modules/vis/dist/vis.css');

import * as avail from './availability.js';
import router from 'wayfarer';
import 'ractive-animatecss';
import vis from 'Vis';

const hashMatch = require('hash-match');
// const wayfarer = require('wayfarer');
// const router = wayfarer('/404');

// router.on('/', () => console.log('/'));
// router.on('/:id', displayBike);
//
// //show tour detail
// router.on('/tour/:d', function (param)  {
//
// });

function filterBikeList(param) {
  const tourMask = avail.getTourMask(ractive.get('bikeAssignment.tourcode'));
  const guestParams =  ractive.get('bikeAssignment.guestParams');
  if (!guestParams) {
    return;
  }
  const fitMode =  ractive.get('bikeAssignment.fitMode');
  const assignMode =  ractive.get('bikeAssignment.assignMode');
  const bestFrameSize  = avail.getBestFrameSize(guestParams.hf,guestParams.hi,guestParams.g === 'M' ? 'DH' : 'MH');
  const goodFrameSizes = avail.getGoodFrameSizes(guestParams.hf,guestParams.hi,guestParams.g === 'M' ? 'DH' : 'MH').concat(avail.getGoodFrameSizes(guestParams.hf,guestParams.hi,'DR'));
  //filter sizes
  param = param.slice();
  return param.filter(function (elem) {
    let show = true;
    if (fitMode === 'best') {
      show = (elem.size === bestFrameSize);
    } else if (fitMode === 'good') {
      show = (goodFrameSizes.indexOf(elem.size) !== -1);
    }
    if (show && (assignMode === 'unassigned')) {
      show=avail.zeros(avail.and(tourMask,elem.availability));
    }
    return show;
  });
}

function isOnOtherTour(bikeNr, tourCode) {
  const bikes = ractive.get('bikes');
  const bike = bikes.find(function (element) {
    return element.nr ===bikeNr;
  });
  if (!bike) {
    return false;
  } else {
    return !avail.zeros(avail.and(avail.getTourMask(tourCode),bike.availability));
  }
}

function isAssigned(bikeNr, guestName) {
  const guests = ractive.get('guests');
  const guest = guests.find(function (element) {
    return element.name===guestName;
  });
  return guest.bikenr == bikeNr;
}
function canBeAssigned(bikeNr,tourCode,guestName) {
  return !isOnOtherTour(bikeNr,tourCode) && !isAssigned(bikeNr,guestName);
}

function getGuest(bikeNr, tourcode) {
  const guests = ractive.get('guests');
  for (let g in guests) {
    if ((guests[g].tourcode===tourcode) && (guests[g].bikenr===bikeNr)) {
      return guests[g].name;
    }

  }
}

var Ractive = require('ractive');
var ractive = new Ractive({
    router: router(),
    el: '#container',
    template: require('./dashboard.html'),
    components: {
      TourSelect: require('./comps/tourSelect.js'),
      myedit: require('./comps/edit.js'),
    },
    data: {
      bikeDetail: { nr: 254 } ,
      bikes: require('./data/bikes.js'),
      tours: require('./data/tours.js'),
      guests: require('./data/guests.js'),
      tourdetail: { code:'Select', guests:[] },
      view: { addTour: false },
      tourview: true,
      bikeAssignment: {fitMode:'best', assignMode:'unassigned'},
      filterBikes : filterBikeList,
      isOnOtherTour : isOnOtherTour,
      isAssigned : isAssigned,
      canBeAssigned : canBeAssigned
    },
    oninit() {
      this.router.on('/tour/:d',  (param) => {
        // console.log('Routed to tour ' + JSON.stringify(param));
        const tourCode = avail.validateAndNormalizeTourCode(param.d);
        if (tourCode!=undefined) {
          this.selectTour(tourCode);
        } else {
          console.error('Error in parsing tour code ' + JSON.stringify(param));
        }
      });
    },
    selectTour(tourCode) {
      const allGuests = this.get("guests");
      const tourGuests = allGuests.filter( function(item) {
        // console.log('item ' + item.tourcode + 'x' + tourCode + '=' + (item.tourcode == tourCode));
        return item.tourcode == tourCode;
      });
      this.set('tourdetail.code',tourCode);
      this.set('tourdetail.guests',tourGuests);
      this.set('view.bikeAssignment',false);
      this.set('tourdetail.addguestform',false);
    }
});

window.ractive = ractive;

ractive.on('showTours', function(event) {
  ractive.toggle('tourview');
})

ractive.on('showBikes', function(event) {
  ractive.toggle('tourview');

  // DOM element where the Timeline will be attached
  var container = document.getElementById('visualization');

  // Create a DataSet (allows two way data-binding)
  var items = new vis.DataSet();
  var bikegroup = new vis.DataSet();
  var bikes = ractive.get('bikes');
  var itemcounter = 0;
  for (let bike in bikes) {
    bikegroup.add({id:bike , content:bikes[bike].nr.toString() + ' (' + bikes[bike].size + ')'});
    for (let t in bikes[bike].tourcodes) {
      let td = avail.getTourDays(bikes[bike].tourcodes[t]);
      console.log('2016-'+ td.end.month + '-' + td.end.day);
      items.add({
        id:itemcounter++,
        group:bike,
        content: 'CZB '+bikes[bike].tourcodes[t] + ' (' + getGuest(bikes[bike].nr,bikes[bike].tourcodes[t]) + ')',
        start: '2016-'+ td.start.month + '-' + td.start.day,
        end: '2016-'+ td.end.month + '-' + td.end.day,
      });
    }
  }

  // Configuration for the Timeline
  var options = {};

  // Create a Timeline
  var timeline = new vis.Timeline(container, items, options);
  timeline.setGroups(bikegroup);

})

ractive.on('showBikeDetail', function(event, param) {
  //console.log('showBikeDetail function, event:' + JSON.stringify(event));
  //window.ractive.set('bikeDetail','hola');
  $('#myModal').modal('toggle');
})

ractive.on('assignBike', function(event) {
  ractive.set('view.bikeAssignment',true);
  ractive.set('bikeAssignment.name',event.context.name);
  ractive.set('bikeAssignment.selected',event.context.bikenr);
  ractive.set('bikeAssignment.tourcode',event.context.tourcode);
  ractive.set('bikeAssignment.guestParams',{hf:event.context.hfoot, hi:event.context.hinch, g:event.context.gender});
});

ractive.on('displayAddGuestForm', function(event) {
  ractive.set('tourdetail.addguestform',true);
  ractive.observe('tourdetail.addGuestForm.gender', function(event) {
    ractive.set('tourdetail.addGuestForm.check.gender',((event.toUpperCase()==='F') || (event.toUpperCase()==='M')));
  });
  ractive.observe('tourdetail.addGuestForm.hfoot', function(event) {
    const val=parseInt(event);
    ractive.set('tourdetail.addGuestForm.check.hfoot',((val>3) && (val<7)));
  });
  ractive.observe('tourdetail.addGuestForm.hinch', function(event) {
    const val=parseInt(event);
    ractive.set('tourdetail.addGuestForm.check.hinch',((val>=0) && (val<=12)));
  });
});

ractive.on('addGuest', function(event) {
  let name = ractive.get('tourdetail.addGuestForm.name');
  let gender = ractive.get('tourdetail.addGuestForm.gender');
  let hfoot = ractive.get('tourdetail.addGuestForm.hfoot');
  let hinch = ractive.get('tourdetail.addGuestForm.hinch');
  let tourcode = ractive.get('tourdetail.code');
  ractive.push('guests',{"name":name, "gender":gender, "hfoot":hfoot, "hinch":hinch, "tourcode": tourcode, 'bikenr': 0});
  ractive.push('tourdetail.guests',{"name":name, "gender":gender, "hfoot":hfoot, "hinch":hinch, "tourcode": tourcode, 'bikenr': 0});
  ractive.set({
    'tourdetail.addguestform':false,
    'tourdetail.addGuestForm.name':'',
    'tourdetail.addGuestForm.gender':'',
    'tourdetail.addGuestForm.hfoot':'',
    'tourdetail.addGuestForm.hinch':''
  })
  ractive.update('guests');
  ractive.update('tourdetail.guests');

});

ractive.on('assignBikeSubmit', function(event) {
  console.log('Assign bike');
  ractive.set('view.bikeAssignment',false);
  const guests = ractive.get('guests');
  const bikes = ractive.get('bikes');
  const bike = bikes.find(function (element) {
    return element.nr === event.context.nr;
  });
  const tourcode = ractive.get('bikeAssignment.tourcode');
  const lookupNAme = ractive.get('bikeAssignment.name');
  const guest = guests.find(function (element) {
    return element.name===lookupNAme;
  });
  const originalBikeNr = guest.bikenr;

  bike.tours ++ ;
  bike.tourcodes.push(tourcode) ;
  bike.availability = avail.or(avail.getTourMask(tourcode),bike.availability);
  guest.bikenr=event.context.nr;

  if (originalBikeNr) {
    const originalBike = bikes.find(function (element) {
      return element.nr === originalBikeNr;
    });
    console.log('Original bike detected ' + JSON.stringify(originalBike));
    originalBike.tours --;
    originalBike.tourcodes = originalBike.tourcodes.filter(function(elem) {
      return elem!=tourcode;
    })
    originalBike.availability = avail.and(avail.not(avail.getTourMask(tourcode)),originalBike.availability);
    console.log('Original bike after ' + JSON.stringify(originalBike));
  }
  ractive.update('guests');

  //update displayed list
  const tourGuests = guests.filter( function(item) {
    return item.tourcode == tourcode;
  });
  this.set('tourdetail.guests',tourGuests);
  ractive.update('tourdetail.guests');
});

ractive.on('unassignBike', function(event) {
  console.log('Unassign bike ' + JSON.stringify(event));
  const guests = ractive.get('guests');
  const lookupNAme = event.context.name;
  const guest = guests.find(function (element) {
    return element.name===lookupNAme;
  });
  const bikes = ractive.get('bikes');
  const bike = bikes.find(function (element) {
    return element.nr===guest.bikenr;
  });
  guest.bikenr=0;
  bike.tours--;
  bike.tourcodes.filter(function (elem) {
    guest.tourcode!==elem;
  });
  const tourMask = avail.getTourMask(guest.tourcode);
  bike.availability = avail.and(bike.availability,avail.not(tourMask));
  ractive.update('guests');
  ractive.update('tourdetail.guests');
  return false;
});

ractive.on('showBikeBox', function(param) {
  console.log('bikebox', param);
  ractive.set('bikebox',true);
  ractive.set('boxdetailindex',param.index.i);
});

ractive.on('closeBikeBox', function() {
  ractive.set('bikebox',false);
});



router(hashMatch(window.location.hash));
