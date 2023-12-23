import base from "./base.js";
require('leaflet.control.layers.tree');
import { layerSets, layers } from './layers/sets.js';
import './controls/LayerSelectionControl';

let controls = {
  layersControls: null,
  addControls: function(){
    let width = $(window).width()

    let baseTree = [{
        label: 'Base Layers',
        children: [
            { label: 'Google Satellite', layer: layerSets.baseTiles.layers.satellite, radioGroup: 'baselayers' },
            { label: 'Esri Satellite', layer: layerSets.baseTiles.layers.esri, radioGroup: 'baselayers' },
            { label: 'OpenStreetMap', layer: layerSets.baseTiles.layers.streets, radioGroup: 'baselayers' },
            { label: 'Light', layer: layerSets.baseTiles.layers.light, radioGroup: 'baselayers' },
            { label: 'Terrain', layer: layerSets.baseTiles.layers.terrain, radioGroup: 'baselayers' },
            { label: 'Dark', layer: layerSets.baseTiles.layers.dark, radioGroup: 'baselayers' },
            { label: 'World Population', layer: layerSets.baseTiles.layers.worldpop, radioGroup: 'baselayers' },
            { label: 'Night Lights', layer: layerSets.baseTiles.layers.nightlight, radioGroup: 'baselayers' },
            //{ label: 'Disabled', layer: layerSets.baseTiles.layers.empty },
            /* ... */
        ]
      }]

      let overlaysTree = [
          {
              label: 'Social Networks News',
              layer: layerSets.tweets.layers.tweets,
          },
          {
              label: 'Drawlayer',
              layer: layerSets.points.layers.polygons,
          },
          {
            label: 'Points of Interest',
            children: [
              { label: 'Datasets',
                collapsed: false,
                children: [
                  //{ label: layerSets.points.layers["e-prtr"].options.name, layer: layerSets.points.layers["e-prtr"]},
                  //{ label: layerSets.points.layers["eu-ets"].options.name, layer: layerSets.points.layers["eu-ets"]},
                  //{ label: layerSets.points.layers["power-plants"].options.name, layer: layerSets.points.layers["power-plants"]},
                  { label: layerSets.points.layers["big-cities"].options.name, layer: layerSets.points.layers["big-cities"]}
                ]},
            ]
        }
      ]


    controls.layersControls = L.control.layers.tree(baseTree, overlaysTree,  {
            namedToggle: false,
            selectorBack: false,
            closedSymbol: '&#8862; &#128193;',//'&#8862; &#x1f5c0;',
            openedSymbol: '&#8863; &#128194;',//'&#8863; &#x1f5c1;',
            collapsed: width < 1800
        });

    controls.layersControls.collapseTree(true).addTo( base.map ).setPosition('topleft');

    //let width = $(window).width()
    //
    //
    // L.control.layers(layerSets.baseTiles.getNameObject(), layerSets.tweets.getNameObject(), {
    //     position: 'topleft',
    //     collapsed: width < 1800
    // }).addTo(base.map);


    // L.control.layers(layerSets.overlays.getNameObject(), layerSets.points.getNameObject(), {
    //     position: 'topleft',
    //     collapsed: width < 1800
    // }).addTo(base.map);

    // L.control.layerSelectionControl(layerSets.countries.layers, {
    //             position: 'bottomleft',
    //             collapsed: true,
    //             name: 'Countries'
    // }).addTo(base.map);
  }
}


export default controls;
