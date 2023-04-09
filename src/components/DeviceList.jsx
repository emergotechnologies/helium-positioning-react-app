import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Device } from './Device.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

const DeviceList = ({ devices, handleReload, handleLiveUpdate, liveUpdate, handleRename, handleCheck }) => {

    // HANDLE RENAME
    const [edit, setEdit] = useState(false)

    const editName = () => {
        setEdit(true);
    }

    const handleChange = ({ target }) => {
        const { name, value } = target;
        handleRename(name, value, devices[0].id)    // passing event targets and value to parent
    }

    // select the available input on focus
    const handleFocus = ({ target }) => {
        target.setSelectionRange(0, target.value.length)
    }

      // exit input field when losing focus
      const handleBlur = () => {
        setEdit(false)
    }

    // exit input field by clicking ENTER
    const inputRef = useRef()
    useEffect(() => {
        if (!edit) return;
        const inputField = inputRef.current

        inputField.addEventListener('keydown', (event) => {
            if (event.keyCode === 13) setEdit(false)
        })
        return () => inputField.removeEventListener('keydown', () => { })
    }, [edit])


    return (
        <div className='container bg-black p-6 sm:max-w-[410px] sm:m-2 rounded-lg'>
            <h1 className='text-center sm:text-left text-[#47FF71] sm:text-white'>Helium Positioning API</h1>
            <div className='mt-9'><p>Device Name:</p>
                <div className='flex items-center justify-between'>
                    {!edit ? <h2>{devices[0].deviceName}</h2> : (
                        <input
                            type='text'
                            name='deviceName'
                            value={devices[0].deviceName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            autoFocus
                            ref={inputRef}
                        />
                    )}
                    <FontAwesomeIcon icon={faPenToSquare} size='lg' color={edit ? '#47FF71' : '#BBBBBB'} onClick={editName} className='cursor-pointer' />
                </div>
            </div>

            <div className='flex flex-col mt-6'>
                <div className='flex flex-row justify-center'>
                    <button onClick={handleReload} className='bg-[#171717] text-sm p-2 min-w-[162px] rounded-lg min-h-[38px] mx-2 sm:hover:bg-[#47FF71] sm:hover:text-black'>Reload Data</button>
                    <button onClick={handleLiveUpdate} className='bg-[#171717] text-sm p-2 min-w-[162px] rounded-lg min-h-[38px] mx-2 hover:bg-[#47FF71]' style={{ backgroundColor: liveUpdate ? '#47FF71' : '#171717', color: liveUpdate ? 'black' : '#d1d1d1' }}>
                        {liveUpdate ? 'Stop' : 'Start'} Live Update
                    </button>
                </div>
                <div className='flex justify-center my-7'>
                    <img src='./RAK_white_front.png'></img>
                </div>
            </div>


            {devices.map(device => (
                <div key={device.id}>
                    <div>
                        <li>
                            < Device
                                device={device}
                                handleRename={handleRename}
                                handleCheck={handleCheck}
                            />
                        </li>
                    </div>
                </div>
            ))}
        </div>
    )
}

DeviceList.propTypes = {
    devices: PropTypes.array.isRequired
}

export { DeviceList }

