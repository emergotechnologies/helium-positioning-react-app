import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl"  // imported as js library
import { Map, NavigationControl, Source, Layer } from 'react-map-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from '@turf/turf';

// imbed MapBox API Token (needs to be moved into .env file!)
mapboxgl.accessToken = 'pk.eyJ1IjoiM2RnbGFkaWF0b3IiLCJhIjoiY2xlaDh0bTJxMGIwdzN2cWZudWZtemt6NiJ9.0lDb0FGEL2kjq0rqTL0jyg'

// STYLE MAP ELEMENTS

// GPS history circles
const layerStylePointGPS = {
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': ['get', 'color'],
    'circle-stroke-color': '#34C856',
    'circle-stroke-width': 1,
    'circle-opacity': ['get', 'visibility'],
    'circle-stroke-opacity': ['get', 'visibility']
  }
}

// GPS endpoint
const layerStyleEndPoint = {
  type: 'circle',
  paint: {
    'circle-radius': 7,
    'circle-color': 'coral',
    'circle-opacity': ['get', 'visibility']
  }
}
// GPS line label
const layerGPSLineLabel = {
  type: 'symbol',
  layout: {
    "symbol-placement": "line-center",
    'text-field': ['get', 'model'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-justify': 'auto',
    'text-size': 12,
  },
  paint: {
    'text-color': '#2abf4c',
    'text-opacity': ['get', 'visibility'],
    'text-translate': [8, 10],
  }
}
// GPS history line
const layerGPSHistoryLine = {
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 2,
    'line-opacity': ['get', 'visibility']
  }
}

// Model EndPoints
const layerStylePoint = {
  type: 'circle',
  paint: {
    'circle-radius': 5,
    'circle-color': ['get', 'color'],
    'circle-opacity': ['get', 'visibility'],
    'circle-stroke-opacity': ['get', 'visibility']
  }
}

// Distance Endpoints
const layerEndpointLabel = {
  type: 'symbol',
  layout: {
    'text-field': ['get', 'model'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-radial-offset': 1,
    'text-justify': 'auto',
    'text-size': 12
  },
  paint: {
    'text-color': 'white',
    'text-opacity': ['get', 'visibility']
  }
}
// Distance Lines
const layerDistanceLine = {
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round',
  },
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 2,
    'line-opacity': ['get', 'visibility']
  }
}
// Distance Line Labels
const layerDistanceLabel = {
  type: 'symbol',
  layout: {
    "symbol-placement": "line-center",
    'text-field': ['get', 'distance'],
    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
    'text-justify': 'auto',
    'text-size': 12,


  },
  paint: {
    'text-color': 'white',
    'text-opacity': ['get', 'visibility'],
    'text-translate': [10, -10],
  }
}

const MapBox = ({ devices, range, handleDistance, show }) => {

  const mapRef = useRef()

  // take the last gps coordinate and zoom in to this spot when map loades
  let currentLat;
  let currentLong;
  if (devices.length !== 0) {
    const lastPosition = devices[0].features[0].geometry.coordinates.length - 1;
    currentLat = devices[0].features[0].geometry.coordinates[lastPosition][0]
    currentLong = devices[0].features[0].geometry.coordinates[lastPosition][1]
  }

  // SLIDER
  const arrayLength = devices[0].features[0].geometry.coordinates.length;
  let sliceEnd = -Math.abs(arrayLength - range)
  let sliceStart = sliceEnd - 1;                   // create 1 element long section to display a single value
  if (sliceEnd === 0) sliceEnd = arrayLength + 1;  // prevent from cutting of the last array element

  // DISTANCE CALCULATION

  // Mask
  const getCurrentCoords = (model) => {
    let visibleCoords;
    devices.map(device => {
      device.features.filter(feature => feature.properties.model === model).map(feature => {
        const { coordinates } = feature.geometry;
        visibleCoords = coordinates.slice(sliceStart, sliceEnd);
      })
    })
    return visibleCoords;
  }

  // Single coordinate values
  let currentGPS = getCurrentCoords('GPS');
  let currentNearestNeighbor = getCurrentCoords('Nearest Neighbor');
  let currentMidpoint = getCurrentCoords('Midpoint');
  let currentLinearReg = getCurrentCoords('Linear Regression');
  let currentGradient = getCurrentCoords('Gradient Boosting')


  // Distance between points
  const units = { units: 'meters' }
  const disNearestNeighbor = turf.distance(...currentGPS, ...currentNearestNeighbor, units)
  const disMidpoint = turf.distance(...currentGPS, ...currentMidpoint, units)
  const disLinearReg = turf.distance(...currentGPS, ...currentLinearReg, units)
  const disGradient = turf.distance(...currentGPS, ...currentGradient, units)

  // geoJson model points
  const pointDistance = (currentModel, modelName, color, distance) => {
    let distanceJson = {
      "type": "Feature",
      "properties": {
        "model": modelName,
        "color": color,
        "distance": `${distance} m`,
        "visibility": 1,
        "id": crypto.randomUUID(),
      },
      "geometry": {
        "type": "LineString",
        "coordinates": [
          ...currentGPS,
          ...currentModel
        ]
      }
    }
    return distanceJson;
  }

  let modelDistance = [];
  modelDistance.push(
    pointDistance(currentNearestNeighbor, 'Nearest Neigbor', '#fa0064', disNearestNeighbor.toFixed(2)),
    pointDistance(currentMidpoint, 'Midpoint', '#009ffa', disMidpoint.toFixed(2)),
    pointDistance(currentLinearReg, 'Linear Regression', '#13dd8f', disLinearReg.toFixed(2)),
    pointDistance(currentGradient, 'Gradient Boosting', '#fac800', disGradient.toFixed(2))
  )

  let gpsEndpoint = {
    "type": "Feature",
    "properties": {
      "model": 'GPS',
      "visibility": 1,
      "id": crypto.randomUUID(),
    },
    "geometry": {
      "type": "MultiPoint",
      "coordinates": [
        ...currentGPS,
      ]
    }
  }

  // Pass distance values on to parent
  let distanceArray = [];
  distanceArray.push(disNearestNeighbor.toFixed(2), disMidpoint.toFixed(2), disLinearReg.toFixed(2), disGradient.toFixed(2));

  useEffect(() => {
    handleDistance(distanceArray)
  }, [range])
  
  return (
    <Map
      initialViewState={{
        longitude: currentLat ? currentLat : 11.412000,
        latitude: currentLong ? currentLong : 47.2613503,
        zoom: 12.5
      }}
      style={{ width: '100%', height: show ? 500 : 792}}
      mapStyle='mapbox://styles/3dgladiator/clehczbri004501pvl44p83zt'
      ref={mapRef}
    >
      <NavigationControl position='top-right' />

      {/** GPS HISTORY LINE */}
      {devices.map(device => (
        device.visibility &&
        device.features.filter(feature => feature.geometry.type === 'LineString').map(feature => {
          const { coordinates } = feature.geometry;
          const visibleCoords = coordinates.slice(0, sliceEnd)
          const updatedFeature = {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: visibleCoords,
            }
          }
          return (
            <Source key={feature.properties.id} type='geojson' data={updatedFeature}>
              <Layer {...layerGPSHistoryLine}></Layer>
              <Layer {...layerGPSLineLabel}></Layer>
              <Layer {...layerStylePointGPS}></Layer>
            </Source>
          )
        })
      ))}

      {/** DISTANCE LINES */}
      {devices.map(device => (
        device.visibility &&
        modelDistance.map(model => {
          return (
            <Source key={model.properties.id} type='geojson' data={model}>
              <Layer {...layerDistanceLabel}></Layer>
              <Layer {...layerDistanceLine}></Layer>
            </Source>
          )
        })
      ))}

      {/** ENDPOINT GPS */}
      <Source key={gpsEndpoint.properties.id} type='geojson' data={gpsEndpoint}>
        <Layer {...layerEndpointLabel} />
        <Layer {...layerStyleEndPoint} />
      </Source>


      {/** MODEL POINTS */}
      {devices.map(device => (
        device.visibility &&
        device.features.filter(feature => feature.geometry.type === 'MultiPoint').map(feature => {
          const { coordinates } = feature.geometry;
          const visibleCoords = coordinates.slice(sliceStart, sliceEnd)
          const updatedFeature = {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: visibleCoords,
            }
          }
          return (
            <Source key={feature.properties.id} type='geojson' data={updatedFeature}>
              <Layer {...layerStylePoint}></Layer>
              <Layer {...layerEndpointLabel}></Layer>
            </Source>
          )
        })
      ))}
    </Map>
  )
}

export { MapBox }