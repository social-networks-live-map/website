// Define the control that will contain the chart
var chartControl = L.Control.extend({
  options: {
    position: 'topright',
    backgroundColor: 'rgba(255, 255, 255, 0.6)'
  },
  onAdd: function (map) {
    // Create the container for the chart
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    container.id = 'chart-container';
    container.style.backgroundColor = this.options.backgroundColor;
    // Add the chart element to the container
    // var chartElement = document.getElementById('chart');
    // container.appendChild(chartElement);
    //container.style.opacity = 1;
    // Prevent clicks on the chart from propagating to the map
    // L.DomEvent.disableClickPropagation(container);

    return container;
  }
});

// Set up the Leaflet map
var map = L.map('map', {zoomControl: false}).setView([51.505, -0.09], 13);
//map.addControl(new chartControl());

// Add the tile layer (map tiles from OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 0,
        maxZoom: 20,
        tms: false,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
}).addTo(map);

L.control.zoom({
    position: 'topleft'
}).addTo(map);