import React from 'react';

const RangeSlider = ({ range, handleRangeValue, devices }) => {

    const maxLength = devices[0].features[0].geometry.coordinates.length;
    const timeDate = devices[0].timeStamps[range - 1]

    // Add hours to time
    function addHoursToISOString(timeDate) {
        // Parse the ISO 8601 string into a Date object
        let date = new Date(timeDate);
        // Add two hours (7200 * 1000 milliseconds)
        date.setTime(date.getTime() + 7200 * 1000);
        // Convert the updated Date object back to an ISO 8601 string
        return date.toISOString().replace(/\.\d{3}Z$/, '')
    }

    const updatedTimeDate = addHoursToISOString(timeDate)

    const date = new Date(updatedTimeDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
        timeZone: 'CET',
        hour12: false,
        hour: 'numeric',
        minute: 'numeric'
    });

    return (
        <div className='flex flex-col items-center px-5 sm:px-0 pb-6 sm:pb-0 sm:mt-5'>
            <p className='text-sm my-6'>{formattedDate} <span className='font-bold'>{formattedTime} CET</span></p>
            <input
                type="range"
                id='rangeSlider'
                value={range}
                onChange={handleRangeValue}
                step='1'
                min='1'
                max={maxLength}
                className='slider sm:mt-4'
                style={{ marginBottom: 4 }}
            />
        </div>
    )
}

export { RangeSlider }