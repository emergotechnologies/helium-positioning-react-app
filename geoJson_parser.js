import * as turf from '@turf/turf'

let devicesData = [];

//! REDUCE TIME FRAME TO THE LAST 24 HOURS

let timeFrameDevice01;
let timeFrameDummy;

const updateEndpoint = () => {
    const currentDate = new Date();
    const endDateTime = currentDate.toISOString();
    // set currentDate to the day BEFORE currentDate
    currentDate.setDate(currentDate.getDate() - 1);
    const startDateTime = currentDate.toISOString();

    timeFrameDevice01 = `http://localhost:8081/v1/devices/94549326-02fa-4715-84b0-42608e915220/historic_data/?fields=LOCATION,LOCATION_NN,LOCATION_MP,LOCATION_TL_LIN,LOCATION_TL_GRAD&resolution=raw&timeframe_start=${startDateTime}&timeframe_end=${endDateTime}`;

    // local test data
    timeFrameDummy = './dataCake_testData.json';
}

updateEndpoint();


//! FETCH API DATA AND CONVERT IT INTO GEOJSON

// get raw data from DataCake API
const fetchJson = async () => {
    // clear all data in devicesData
    devicesData = [];

    let rawDataDevice01 = [];
    const checkSum = '["time","LOCATION","LOCATION_MP","LOCATION_NN","LOCATION_TL_GRAD","LOCATION_TL_LIN"]'

    try {
        rawDataDevice01 = await fetch(timeFrameDummy)
            .then(response => response.json()).catch(error => console.log(error.message))

        const keysArrayDevice01 = JSON.stringify(Object.keys(rawDataDevice01[0]))

        if (keysArrayDevice01 === checkSum) {
            const cleanFirstObjectDevice01 = removeNulls(rawDataDevice01);
            const cleanDataDevice01 = parseCleanData(cleanFirstObjectDevice01);
            devicesData.push({ deviceName: 'Emergo-01', ...parseGeoJson(cleanDataDevice01) })
        }
    } catch (error) {
        console.log(error.message)
    }

    return devicesData;
}


//! REMOVE NULLS FROM FIRST OBJECT

// Remove NULLS from the first object in the array
const removeNulls = (datasets) => {

    // check if the first object contains any NULLs
    const singleSet = datasets[0]
    const nullObject = Object.values(singleSet).some(value => value === null)  // if null is in first object, return true!

    // search for the first array that is not time or null
    let validCoordinate; // stores first correct coordinates string
    if (nullObject) {
        for (let key in singleSet) {
            if (typeof singleSet[key] === 'string' && singleSet[key].includes(',')) { // a comma differentiate a coordinate from a time value
                validCoordinate = singleSet[key]
                break;      // exit if statement as soon as the first legit value is found
            }
        }
    }
    // exchange all null values with legit values
    if (nullObject) {
        for (const [key, value] of Object.entries(singleSet)) {
            if (value === null) {
                singleSet[key] = validCoordinate
            }
        }
    }

    return datasets;
}


//! REMOVE NULLS FROM ALL FOLLOWING OBJECTS

// Parse into clean JSON
const parseCleanData = (datasets) => {

    let previousCleanDataSet; // initialize empty variable for clean data of previous dataset

    const cleanData = datasets.map((currentDataset) => {
        // define previous dataset and create a loop that takes the values from the previous set
        let previousDataSet = Object.values(datasets[0]);
        if (previousCleanDataSet) {
            previousDataSet = previousCleanDataSet;     
        }

        // iterate over object properties and check if one the values is null
        let dataSetCorrect = true;
        for (let positionData in currentDataset) {
            if (currentDataset[positionData] === null) {
                dataSetCorrect = false;
                break;
            }
        }
        // if none of the values is null, return the current object values and exit function
        if (dataSetCorrect) {
            const propertiesArray = Object.values(currentDataset)
            return propertiesArray  // returns an array of object values
        }
        // if a value is null then:
        else {
            let cleanSet = [];
            let propertiesArray = Object.values(currentDataset)     // values array of currentDataset
            cleanSet = propertiesArray.map((value, valueIndex) => {
                if (value === null) {                               // if a object value is null, then
                    return value = previousDataSet[valueIndex];     // replace it with a valid value from the previous dataset
                } else return value                                 // else return the valid property value
            })
            previousCleanDataSet = cleanSet;                        // set the new set as previousDataSet for the next round
            return cleanSet;                                        // returns an array of object values
        }
    })

    // turn cleanData arrays into objects with correct keys
    const finalData = datasets.map((dataset, datasetIndex) => {
        const cleanSet = cleanData[datasetIndex]
        let cleanSetIndex = 0
        for (let key in dataset) {
            dataset[key] = cleanSet[cleanSetIndex]
            cleanSetIndex++
        }
        return dataset      // returns an array with clean objects
    })

    // save last array element in local storage
    const lastElement = finalData[finalData.length - 1]
    sessionStorage.removeItem('lastElement')
    sessionStorage.setItem('lastElement', JSON.stringify(lastElement))

    return finalData
}

//! CREATE GEOJSON 

// Parse into geoJSON
const parseGeoJson = (coordinates) => {

    let timeStamps = [];
    let gpsCoords = [];
    let nearestCoords = [];
    let midPointCoords = [];
    let linearCoords = [];
    let gradientCoords = [];

    // FEATURECOLLECTION
    const featureCollection = {
        type: "FeatureCollection",
        id: crypto.randomUUID(),
        visibility: true,
        isActive: false,
        timeStamps: timeStamps,
        features: [],
    };

    // TIMESTAMPS:
    coordinates.forEach((item) => {
        const timeString = item.time;
        timeStamps.push(timeString);
    })

    // POSITION DATA INTO ARRAY WITH NUMBERS

    const positionToNumbers = (locationData) => {
        return locationData
            .slice(1, -1)
            .split(',')
            .map(string => Number(parseFloat(string.trim()).toFixed(7)))
            .reverse()
    }

    // HISTORY LINES
    coordinates.forEach((item) => {
        // GPS data
        const gps = positionToNumbers(item.LOCATION)
        gpsCoords.push(gps);

        // NearestNeighbor
        const nearest = positionToNumbers(item.LOCATION_NN)
        nearestCoords.push(nearest)

        // Midpoint
        const midpoint = positionToNumbers(item.LOCATION_MP)
        midPointCoords.push(midpoint)

        // Linear
        const linear = positionToNumbers(item.LOCATION_TL_LIN)
        linearCoords.push(linear)

        //Gradient
        const gradient = positionToNumbers(item.LOCATION_TL_GRAD)
        gradientCoords.push(gradient)
    });

    // Create lineStrings and Multipoints using turf.js
    const gpsHistory = turf.lineString(
        gpsCoords,
        {
            model: 'GPS',
            color: '#47FF71',
            visibility: 1,
            id: crypto.randomUUID(),
            isChecked: true,
        });

    const nearestHistory = turf.multiPoint(
        nearestCoords,
        {
            model: 'Nearest Neighbor',
            color: '#fa0064',
            visibility: 1,
            id: crypto.randomUUID(),
            isChecked: true,
        });

    const midPointHistory = turf.multiPoint(
        midPointCoords,
        {
            model: 'Midpoint',
            color: '#009ffa',
            visibility: 1,
            id: crypto.randomUUID(),
            isChecked: true
        });

    const linearHistory = turf.multiPoint(
        linearCoords,
        {
            model: 'Linear Regression',
            color: '#13dd8f',
            visibility: 1,
            id: crypto.randomUUID(),
            isChecked: true
        });

    const gradientHistory = turf.multiPoint(
        gradientCoords,
        {
            model: 'Gradient Boosting',
            color: '#fac800',
            visibility: 1,
            id: crypto.randomUUID(),
            isChecked: true
        });


    // Add features to the FeatureCollection
    featureCollection.features.push(gpsHistory, nearestHistory, midPointHistory, linearHistory, gradientHistory);

    return featureCollection;
}

export { devicesData, updateEndpoint, fetchJson }