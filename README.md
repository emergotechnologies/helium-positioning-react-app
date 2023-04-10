# Helium Positioning APP

This repository provides a comprehensive solution for visualizing device location data from the DataCake API. It fetches and formats JSON data received from the API, processes the data, and displays it on an interactive map using React, Mapbox GL JS, and a geoJSON parser module.

The parser is responsible for fetching and formatting the JSON data received from the DataCake API. It converts the raw data into a GeoJSON FeatureCollection format, making it compatible with Mapbox GL JS.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledements](#acknowledgements)


## Features

- Fetches device data from the DataCake API
- Processes the raw data using custom JavaScript code (datacake_parser.js)
- Visualizes the device data on an interactive map using Mapbox GL JS
- Displays multiple devices and their respective tracking data
- Allows users to toggle visibility of different data types (GPS, Nearest Neighbor, Midpoint, Linear Regression, and Gradient Boosting)


## Installation

1. Clone the repository:
```
git clone https://github.com/emergotechnologies/helium-positioning-react-app.git
```

2. Install the required dependencies:
```
npm install
```
3. Start the development server:
```
npm start
```

4. Open your web browser and navigate to http://localhost:3000 to view the application.

A live version of the app can be found here: https://helium-positioning.emergo.dev


## Usage

Navigate to the application in your web browser. You will see a map with tracking data visualized as points and lines. Use the interactive controls to toggle the visibility of the GPS layer and explore the data.

- Update the DataCake API endpoints in geoJson_parser.js to fetch data from your devices.
- Customize the React components and Mapbox GL JS map settings to fit your project requirements.


## Contributing

Feel free to submit issues, feature requests, or contribute directly to the project by submitting a pull request.


## License

[MIT](https://choosealicense.com/licenses/mit/)


## Acknowledgements

- [Datacake](https://app.datacake.de) for providing the sample data and API
- [Mapbox GL JS](https://www.mapbox.com/) for the powerful mapping library
- [React Map GL](https://visgl.github.io/react-map-gl/) for the React wrapper around Mapbox GL JS
- [@turf/turf](ZH%5*eY^L2E&ci) for the geospatial analysis library
