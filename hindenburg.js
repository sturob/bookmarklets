(function () { // ⩤ ⩥
  if (! [].forEach) {
    alert('browser not supported');
    return;
  }

  function url2keys(url){
    var b = url.split('?')[1].split('&');
    var keys = {};
    b.forEach(function(k){ 
      var tmp = k.split('=');
      keys[tmp[0]] = tmp[1];
    });
    return keys;
  }

  var pov = { site:'', lat:0, lng:0, dir:0 };

  function A() {
    function google() { 
    // prep for new google maps:
    // _.VV.lat
    // window.location.hash.split('!').splice(5, 2).map(function(n){ return n.substr(2) }) -> [ lat, lng ]
      var url = gApplication.getPageUrl();
      var keys = url2keys(url);
      pov.lat = keys.ll.split(',')[0];
      pov.lng = keys.ll.split(',')[1];
      if (keys.cbp) pov.dir = keys.cbp.split(',')[1];
      pov.site = 'google';
      return pov;
    }

    function nokia () {
      var arr = window.location.pathname.substr(1).split(',')
      pov.lat = arr[0];
      pov.lng = arr[1];
      pov.dir = arr[3];
      pov.site = 'nokia';
      return pov;
    }

    function bing () {
      pov.site = 'bing';
      pov.lat = map.get_center().latitude;
      pov.lng = map.get_center().longitude;
      pov.dir = map.get_heading() ? map.get_heading() : 0;
      return pov;
    }

    if (window.gApplication) return google();
    if (window.Microsoft) return bing();
    if (window.nokia) return nokia();
  }

  function B(site, a) {
    if (site == 'bing') {
      a.dir = Math.ceil((a.dir / 90) - 0.5) * 90 // right angles
    }
    if (site == 'google' && a.dir == 0) { // hack around google maps bug
      a.dir = 0.1;
    }

    var sites = {
      google: 'maps.google.com/?cbp=11,' + a.dir + ',,0,-10&layer=c&ie=UTF8&vpsrc=4&layer=c&ll=' 
               + a.lat + ',' + a.lng + '&t=h&z=17&spn…=15&cbll=' + a.lat + ',' + a.lng,
      bing:   'www.bing.com/maps/default.aspx?cp=' + a.lat + '~' + a.lng + '&lvl=18&sty=b&dir=' + a.dir,
      nokia:  'here.com/'+ a.lat + ',' + a.lng + ',18,' + a.dir + ',65,3d.day' // 0->65
    }
    return 'http://' + sites[site];
  }

  if (window.gumtree) {
    if (! gumtree.state.vip_mapLarge) {
      alert('load large map first')
      return;
    }
    pov.lng = gumtree.state.vip_mapLarge.lon;
    pov.lat = gumtree.state.vip_mapLarge.lat;
    window.location = B('bing', pov);
  }

  var CYCLE = { nokia:'google', google:'bing', bing:'nokia' };

  var a = A();
  if (! a) {
    console.log('hindenburg: unsupported site')
    return;
  }

  var b = B(CYCLE[a.site], a);
  if (b) window.location = b;
  
})();