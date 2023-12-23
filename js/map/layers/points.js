import { decode } from '@alexpavlov/geohash-js';
import base from "../base.js";
import MarkerClusterGroup from 'leaflet.markercluster';

let GeoJSON = require('geojson');

function getColor(stype) {
    switch (stype) {
     case 'Oil':
       return  '#ffcf09';
     case 'Coal':
       return '#ff000d';
     case 'Gas':
       return '#6600ff';
     case 'Gas/Oil':
       return '#ffcf09';
     case 'Biomass':
       return '#fe01b1';
    }
}

function calcRadius(val, zoom) {
    return (Math.pow(val,0.6)*(zoom)/4);
}

let citation = {
    bigcities: "Simplemaps commercial database of the world`s cities and towns built using authoritative sources such as the NGIA, US Geological Survey, US Census Bureau, and NASA. Neighborhoods within listed cities are not included. Determination of border conflicts and territorial disputes are adopted from US government agencies."
}

let popupoptions = {maxWidth : 350}

let layersList = {
    'big-cities': {
        url: "/cities/points.geojson",
        name: "Big cities <span class='hovertext' data-hover='" + citation.bigcities + "'><i class='fa fa-info-circle'></i></span></i>",
        attr: {
            style: {
                color: '#39ff14'
            },
            pointToLayer: function(feature, latlng) {
                let radius_size = Math.max(base.radius_zoom()[base.map.getZoom()], base.radius_zoom()[base.map.getZoom()]*(Math.pow(feature.properties.population, 1/4)/20))
                let fill_opacity = Math.min(0.8, Math.max(0.25, feature.properties.population/3000000))
                return new L.CircleMarker(latlng, {radius: radius_size, stroke: true, weight: fill_opacity*2, fillOpacity: 0});
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup('<table class="styled-table"><thead><tr><td>Name:</td><td>' + feature.properties.city + '</td></tr></thead>' +
                                '<tbody><tr><td>Population:</td><td>' + parseFloat(feature.properties.population).toLocaleString() + '</td></tr>'+
                                '<tr><td>Country:</td><td>' + feature.properties.country + '</td></tr>'+
                                '<tr><td>Get there:</td><td><a href = "https://www.google.com/maps/place/' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + '/@' + feature.geometry.coordinates[1] + "," + feature.geometry.coordinates[0] + ',1500m/data=!3m1!1e3" target = popup>Google Maps Link</a></td></tr>'+
                                '</tbody></table>');
            }
        }
    }, 'foam': {
      url: 'https://map-api-direct.foam.space/poi/filtered?swLng=16&swLat=46&neLng=17&neLat=49&status=application&status=listing&sort=most_value&limit=70&offset=0',
      name: "FOAM POIs <i class='fa fa-info-circle'></i>",
      hidden: true,
      extern: true,
      transform: function (data) {
          data = GeoJSON.parse(data.map(e => {
              let coords = decode(e.geohash);
              e.latitude = coords.latitude;
              e.longitude = coords.longitude;
              return e;
          }), {
              Point: ['latitude', 'longitude'],
              include: ['geohash', 'name', 'owner']
          });
          console.log(data)
          return data;
      },
      attr: {
          style: {
              color: '#00FF00'
          },
          pointToLayer: function(feature, latlng) {
              return new L.circle(latlng, {radius: 8, stroke: false, fillOpacity: 0.5});
          },
          onEachFeature: function (feature, layer) {
              layer.bindPopup('<table><tr><td>Name:</td><td>' + feature.properties.name + '</td></tr></table>');

              let isClicked = false

              layer.on('mouseover', function (e) {
                          if(!isClicked)
                              this.openPopup();
              });
              layer.on('mouseout', function (e) {
                          if(!isClicked)
                              this.closePopup();
              });
              layer.on('click', function (e) {
                          isClicked = true;
                          this.openPopup();
              });
          }
      }
    }, 'polygons':{
        name: "Polygons",
        hidden: false,
        extern: true
    }
};

export default {
    style: {},
    list: layersList
}
