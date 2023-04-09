import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const Device = ({ device, handleCheck }) => {

    return (
        <>
            <div>
                <div>
                    {device.features.map(feature => {
                        if (feature.geometry.type === 'LineString') {
                            return <div key={feature.properties.id}>
                                <div className='flex justify-between items-center'>
                                    <h3>GPS History</h3>
                                    <FontAwesomeIcon
                                        icon={feature.properties.isChecked ? faEye : faEyeSlash}
                                        size='lg'
                                        color={feature.properties.isChecked ? '#47FF71' : '#E8E8E8'}
                                        onClick={() => handleCheck(feature.properties.id)}
                                        className='pointer'
                                    />
                                </div>
                            </div>
                        }
                    })}
                </div>
                <div className='mb-3 mt-8'><p>Deviation from GPS position:</p></div>
                <div>
                    {device.features.map(feature => {
                        if (feature.geometry.type === 'MultiPoint') {
                            return <div key={feature.properties.id} className='flex justify-between items-start'>
                                <h3 className='h-[36px]'>{feature.properties.model}</h3> {feature.properties.currentDistance && <p className='text-right'>{feature.properties.currentDistance} m</p>}
                            </div>
                        }
                    })}
                </div>
            </div>
        </>
    )
}

export { Device }