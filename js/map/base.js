import { map } from 'leaflet';
import 'leaflet-sidebar';
import 'leaflet-contextmenu';
import 'leaflet-control-geocoder';

import './controls/LayerSelectionControl';


import './geoip.js';
import './marker/control.js';
//import twitter from './twitter.js';
import { layerSets, layers } from './layers/sets.js'
import tweets from './tweets.js';
import url from './url.js';
import twitter from './twitter.js'
let defaultState = {
    zoom: 3,
    center: {
        lat: 22, // 48.2082,
        lng: 0, // 16.3738,
    },
    layers: [
        'dark',
        'power-plants',
        'no2_2021',
        'tweets',
    ],
}

let defaultOptions = {
    zoomControl: false,
    tap: true,
    maxZoom: 19,
    touchZoom: 'center'
}

let crosshairIcon = L.icon({
    iconUrl: '../../static/crosshair.png',
    iconSize:     [80, 80], // size of the icon
    iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
});

L.Circle.include({
  contains: function (latLng) {
    return this.getLatLng().distanceTo(latLng) < this.getRadius();
  }
});

let tweetBoxActive = false;

let slowFlyTo = false;

let contextmenuOptions = {
    contextmenu: true,
    contextmenuWidth: 200,
    contextmenuItems: [{
        text: 'Tweet here ...',
        callback: function(e) {
            tweets.sidebar.hide();
            base.map.flyTo(e.latlng);
            twitter.showTweetBox(e);
            base.tweetBoxActive = true
        }
    }, {
    //     text: 'Copy area link',
    //     callback: function(e) {
    //         var dummy = document.createElement('input'),
    //             text = window.location.href;
    //
    //         document.body.appendChild(dummy);
    //         dummy.value = text;
    //         dummy.select();
    //         document.execCommand('copy');
    //         document.body.removeChild(dummy);
    //     }
    // }, {
        text: 'Center here and copy area link',
        callback: function(e) {
            base.map.flyTo(e.latlng);
            $(base.map).one('moveend', function () {
                var dummy = document.createElement('input'),
                    text = window.location.href;

                document.body.appendChild(dummy);
                dummy.value = text;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
            })
        }
    }, {
        text: 'Center here ...',
        callback: function(e) {
            base.map.flyTo(e.latlng);
        }
    }]
}

let base = {
    map: null,
    sidebars: {},
    layerSets: {},
    crosshair: L.marker(null, {icon: crosshairIcon, interactive:false}),
    layers: {},
    pushState: false,

    init: function() {
        // init leaflet map
        base.map = map('map', {
            ...defaultOptions,
            ...contextmenuOptions
        });

        //base.addLayers()
        base.addEventHandlers();

        base.layerSets = layerSets;
        base.layers = layers;



        tweets.init();
        base.setInitialState();

    },

    getState: function() {
        return {
            center: base.map.getCenter(),
            zoom: base.map.getZoom(),
            layers: base.getVisibleLayers(),
            tweet: tweets.activeTweet,
        }
    },

    setInitialState: function() {
        base.map.setView(defaultState.center, defaultState.zoom);
        let state = url.getState();
        if (!state.center){
          //state.center = w(0, 0, zoom = 6)
          //state.center = L.GeoIP.getPosition();
          state.center = { lat: 37, lng: 24 }
        }
        //console.log(state.center)
        base.setState({...defaultState, ...state});

        let tweet = state.tweet;

        $(base.map).one('moveend', function () {

            if (!state.tweet) {
                let path = url.getPath()
                //console.log(path)
                if (path in tweets.data.pathToTweetId)
                    tweet = tweets.data.pathToTweetId[path];
            }
            if (tweet)
                tweets.show(tweet);
            base.addControls();

        })
        base.showCrosshair();
    },

    setState: function(state){
        base.pushState = false;
        base.flyTo(state);
        $(base.map).one('moveend', function () {
            base.showLayers(state.layers);
            base.pushState = true;
            url.pushState();
        })
    },

    // setState: function(state) {
    //     setTimeout(base.setStateTimeout(state), 10)
    // },

    flyTo: function(state) {
        // Only show tile layer in fly-to animation
        let tileLayers = Object.keys(base.layerSets.baseTiles.layers)
        let layers = state.layers.filter(x => tileLayers.includes(x))

        // Keep tweets layer
        if (state.layers.includes('tweets'))
            layers.push('tweets')

        // let layers = base.layerSets.tiles.getVisibleLayers();
        // if (layers.length == 0) {
        //     // get that in state
        //     let tileLayers = Object.keys(base.layerSets.tiles.layers)
        //     layers = state.layers.filter(x => tileLayers.includes(x))
        // }

        base.showLayers(layers);

        if(slowFlyTo){
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true});
        } else {
            base.map.flyTo(state.center, state.zoom, {noMoveStart: true, duration: 1});
            slowFlyTo = true
        }
    },

    getSidebarCorrectedCenter: function(center, zoom) {
        let sidebarOffset = document.querySelector('.leaflet-sidebar').getBoundingClientRect().width;
        return base.map.unproject(base.map.project(center, zoom).add([sidebarOffset / 2, 0]), zoom); //substract when sidebar on the left
    },

    showSidebar: function(module, content = null) {
        //let sbs = [tweets, twitter]
        let sbs = [tweets]
        sbs.forEach((m) => {
            if (m != module) {
                m.sidebar.hide();
            }
        });

        module.sidebar.show();
        if (content)
            module.sidebar.setContent(content);

        return module.sidebar;
    },
    //New bullshit
    showPopup: function(module, content = null) {
        let sbs = [tweets]
        sbs.forEach((m) => {
            if (m != module) {
                map.closePopup();
            }
        });

        if (content)
            L.popup(popupOptions).setContent(content)


        return module.popup;
    },

    showLayers: function(ids) {
        let visibleLayers = base.getVisibleLayers()
        // Show
        ids.forEach((id) => {
            if(!visibleLayers.includes(id))
                base.showLayer(id);
        });

        // Hide layers visible, but not in ids
        visibleLayers.forEach((id) => {
            if (!ids.includes(id))
                base.hideLayer(id)
        });

        // Default to light tiles
        if (base.layerSets.baseTiles.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.tiles.layers['light'])

        // Default to empty overlays layer
        if (base.layerSets.overlays.getVisibleLayers().length == 0)
            base.map.addLayer(base.layerSets.overlays.layers['empty'])
    },

    showLayer: function(id) {
        if (!base.map.hasLayer(base.layers[id]))
            base.map.addLayer(base.layers[id])
    },

    showCrosshair: function() {
        base.hideCrosshair()

        base.crosshair = L.marker(null, {icon: crosshairIcon, interactive:false}),
        base.crosshair.setLatLng(base.map.getCenter());
        base.crosshair.addTo(base.map)


        base.map.on('move', function(e) {
            base.crosshair.setLatLng(base.map.getCenter());
        });
        slowFlyTo = false;
    },

    hideCrosshair: function() {
        base.map.removeLayer(base.crosshair)
    },
    // showLayer: function(id) {
    //     setTimeout(base.showLayerTimeout(id), 10)
    // },

    hideLayer: function(id) {
        if (base.map.hasLayer(base.layers[id]))
            base.map.removeLayer(base.layers[id])
    },


    // hideLayer: function(id) {
    //     setTimeout(base.hideLayerTimeout(id), 10)
    // },

    getVisibleLayers: function() {
        return Object.keys(this.layers).filter(k => (base.map.hasLayer(this.layers[k])));

    },

    updateCircleSize: function() {
          var radius_zoom = [0.04,0.16,0.4,1,1.7,2.5,4,5.5,7.5,9.8,12.5,15.4,19,23,27.2,32,37.2,37.2,37.2,37.2];
          function calcRadius(val, zoom) {
              if(val != radius_zoom[zoom])
                    return radius_zoom[zoom]
              else
                    return val;
              //

              //return (Math.pow(val,0.6)*(zoom)/4);
          }

          base.map.eachLayer(function (marker) {

              // let result = base.map.getBounds().contains(latlng) ? 'inside': 'outside';
              //
              // if(result == 'inside'){
              //     return circle;
              // } else {
              //     return 0;
              // }
              //console.log(marker)
              // if(marker._latlng !== undefined){
              //     var result = base.map.getBounds().contains(marker._latlng) ? 'inside': 'outside';
              // } else {
              //     return 0;
              // }
              if (marker._radius != undefined){
                  //marker._mRadius = 100000000
                  //console.log("lol")
                  //marker.setRadius(calcRadius(marker._radius, base.map.getZoom()))
                  marker.setRadius(radius_zoom[base.map.getZoom()])
                  //console.log(radius_zoom[base.map.getZoom()])
                  //console.log(marker)
                  //marker.getElement().style.display = 'block';



                  //marker._map._loaded = false
                  //console.log(marker)
                  //marker.setRadius(calcRadius(marker._orgRadius,base.map.getZoom()));
              }
              // if(result == 'inside'){
              //   if (marker._radius != undefined){
              //       //marker._mRadius = 100000000
              //       //console.log("lol")
              //       //marker.setRadius(calcRadius(marker._radius, base.map.getZoom()))
              //       marker.setRadius(radius_zoom[base.map.getZoom()])
              //       console.log(radius_zoom[base.map.getZoom()])
              //       //console.log(marker)
              //       //marker.getElement().style.display = 'block';
              //
              //
              //
              //       //marker._map._loaded = false
              //       //console.log(marker)
              //       //marker.setRadius(calcRadius(marker._orgRadius,base.map.getZoom()));
              //   }
              // }
          });
    },

    addControlsTimeout: function() {
      let width = $(window).width()
      // L.control.markers({ position: 'topleft' }).addTo(base.map);
      L.control.zoom({ position: 'topright' }).addTo(base.map);

      L.Control.geocoder({
          position: 'topright'
          // defaultMarkGeocode: false
      }).addTo(base.map);

      L.control.layers(layerSets.baseTiles.getNameObject(), layerSets.tweets.getNameObject(), {
          position: 'topleft',
          collapsed: width < 1800
      }).addTo(base.map);

      L.control.layers(layerSets.overlays.getNameObject(), layerSets.points.getNameObject(), {
          position: 'topleft',
          collapsed: width < 1800
      }).addTo(base.map);

      // L.control.layerSelectionControl(layerSets.countries.layers, {
      //     position: 'topright',
      //     collapsed: true,
      //     name: 'Countries'
      // }).addTo(base.map);

      // L.control.layers(null, layerSets.countries.getNameObject(), {
      //     position: 'topright',
      //     collapsed: true
      // }).addTo(base.map);

      // Object.values(base.sidebars).forEach(s => {
      //     base.map.addControl(s);
      // });
    },

    addControls: function() {
        setTimeout(base.addControlsTimeout(), 10)
    },

    addEventHandlers: function() {
        base.map.on("moveend", function () {
            if (base.pushState) {
                //console.log("moveend")
                url.pushState()
            }
        });

        base.map.on("zoomend", function () {
            base.updateCircleSize()
        });

        // base.map.on("contextmenu", function (e) {
        //     //base.map.flyTo(e.latlng);
        //     //twitter.openSidebar(e.latlng)
        // });
        base.map.on("click", function (e) {
            //tweets.closeSidebar();
            base.tweetBoxActive = false;
            tweets.closeSidebar();
            base.showCrosshair();
            twitter.marker.remove();
        });

        base.map.on('baselayerchange overlayadd overlayremove', function (e) {
            if (base.pushState)
                url.pushState();
            return true;
        });

        base.map.on('overlayadd', function (e) {
            base.updateCircleSize()
            return true;
        });

    }


}

export default base
