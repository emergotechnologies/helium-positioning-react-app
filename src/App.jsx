import React, { useState, useEffect } from 'react';
import { DeviceList } from './components/DeviceList.jsx'
import { MapBox } from './components/MapBox.jsx'
import { RangeSlider } from './components/RangeSlider.jsx'
import { devicesData, updateEndpoint, fetchJson } from '../geoJson_parser.js';
import { LatestPosition } from './components/LatestPosition.jsx';
import './app.css';

function HeliumPositioning() {

  const [isLoading, setIsLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [liveUpdate, setLiveUpdate] = useState(false);
  const [range, setRange] = useState();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // async get Data from API function
  const fetchData = async () => {
    await fetchJson();
    setDevices(devicesData);
    setIsLoading(false);
    setRange(devicesData[0].timeStamps.length)
  };

  // display data after successfully loaded
  useEffect(() => {
    updateEndpoint();
    fetchData();
  }, []);

  // handle live update
  const handleLiveUpdate = (event) => {
    event.preventDefault();
    setLiveUpdate(prev => !prev)
  }

  // start live update interval
  useEffect(() => {
    let interval;
    if (liveUpdate) {
      interval = setInterval(() => {
        updateEndpoint();
        fetchData();
      }, 60000);
    } else clearInterval(interval);

    return () => clearInterval(interval);
  }, [liveUpdate])

  // handle data reload
  const handleReload = (event) => {
    event.preventDefault();
    setDevices(devicesData);
    console.log(devicesData);
  }

  // handle rename device
  const handleRename = (name, value, id) => {
    setDevices(prev => prev.map(device => {
      if (device.id === id) {
        return {
          ...device,
          [name]: value
        }
      } else return device
    }))
  }

  // handle model visibility
  const handleCheck = (idToCheck) => {
    setDevices(devices.map(device => {
      return {
        ...device,
        features: device.features.map(feature => {
          if (feature.properties.id === idToCheck) {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                isChecked: !feature.properties.isChecked,
                visibility: feature.properties.visibility === 0 ? 1 : 0
              }
            }
          }
          return feature
        })
      }
    }))
  }

  // save current distance value as geoJson property
  const handleDistance = (distanceArray) => {
    setDevices(devices.map(device => {
      return {
        ...device,
        features: device.features.map((feature, index) => {
          if (feature.geometry.type === 'MultiPoint') {
            return {
              ...feature,
              properties: {
                ...feature.properties,
                currentDistance: distanceArray[index - 1]
              }
            }
          }
          return feature
        })
      }
    }))
  }

  // SLIDER

  // handle range value
  const handleRangeValue = ({ target }) => {
    setRange(target.value)
  }

  // WINDOW WIDTH
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [])

  return (
    <div className='container mx-auto'>
      <div>
        <img src="./emergo_white_small.png" alt="Emergo Logo" className='max-h-[50px] mx-auto sm:ml-2 my-4'/>
      </div>

      <div className='md:flex'>
      {isLoading ? (<p>Loading Data...</p>) : (
        <>
          <div>
            < DeviceList
              devices={devices}
              liveUpdate={liveUpdate}
              handleReload={handleReload}
              handleLiveUpdate={handleLiveUpdate}
              handleRename={handleRename}
              handleCheck={handleCheck}
            />
            <LatestPosition
              show={windowWidth < 640}
            />
          </div>

          <div className='container bg-black my-3 sm:m-2 sm:p-3 rounded-lg'>
              <div>
                < MapBox
                  devices={devices}
                  range={range}
                  handleDistance={handleDistance}
                  show={windowWidth < 640}
                />
              </div>
              <div>
                < RangeSlider
                  range={range}
                  handleRangeValue={handleRangeValue}
                  devices={devices}
                />
              </div>
          </div>
          <LatestPosition
                show={windowWidth > 640}
              />
        </>
      )}
    </div>
    </div>
    
  )
}

export default HeliumPositioning;