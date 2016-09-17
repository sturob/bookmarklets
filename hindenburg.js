(function () { // ⩤ ⩥
  if (! [].forEach) {
    alert('browser not supported');
    return;
  }

  function url_to_params (url) {
    var pairs = url.split('?')[1].split('&');
    var params = {};
    pairs.forEach(function (pair) { 
      var tmp = pair.split('=');
      params[tmp[0]] = tmp[1];
    });
    return params;
  }

  var pov = { site:'', lat:0, lng:0, dir:0 };

  function A() {
    function newGoogle () {
      // _.VV.lat
      var data = window.location.pathname.split(/@/);
      pov.lat = data.shift();
      pov.lng = data.shift();
      var keys = data.map(function (n) { return n.substr(-1) });
      var values = data.map(function (n) { return n.substr(0, n.length - 1) });
      var params = {};
      for (var n = 0; n < keys.length; n++) {
        params[ keys[n] ] = values[n];
      }
      pov.dir = params['h']
      pov.site = 'google';
      return pov;  
    }
    function google () { 
      var url = gApplication.getPageUrl();
      var params = url_to_params(url);
      pov.lat = params.ll.split(',')[0];
      pov.lng = params.ll.split(',')[1];
      if (params.cbp) pov.dir = params.cbp.split(',')[1];
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
    if (window.here) return nokia();

    // blaah, new google maps, hacky
    if (window.location.href.search(/\.google\./) && window.location.href.search(/maps/) && window._) {
      return newGoogle();
    } 
  }

  function B(site, a) {
    if (site == 'bing') {
      a.dir = Math.ceil((a.dir / 90) - 0.5) * 90 // right angles
    }
    if (site == 'google' && a.dir == 0) { // hack around google maps bug
      a.dir = 0.1;
    }

    var sites = {
      google: 'www.google.com/maps/preview#!data=!1m6!1m3!1d1566!2d' + a.lng + '!3d' + a.lat + 
              '!2m1!1f' + a.dir + '!2m1!1e3&fid=7',
      bing:   'www.bing.com/maps/default.aspx?cp=' + a.lat + '~' + a.lng + '&lvl=18&sty=b&dir=' + a.dir,
      nokia:  'here.com/'+ a.lat + ',' + a.lng + ',18,' + a.dir + ',25,3d.day' 
    }
    return 'http://' + sites[site];
  }

  if (window.gumtree) {
    if (! gumtree.state.vip_mapLarge) {
      alert('load large map first');
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
