import React from 'react';

function LatestPosition({show}) {

    const lastElement = JSON.parse(sessionStorage.getItem('lastElement'));
    const lastElementsArray = Object.entries(lastElement);

    return (
        <div className={show ? 'hidden' : 'visible bg-black p-6 sm:m-2 sm:min-w-[410px] rounded-lg'} >
            <h3 className='mb-3'>Dataset current position</h3>
            <div className='flex justify-between flex-col'>
                <h4>{`{`} </h4>
                {lastElementsArray.map((entry, index) => (
                    <div key={index} className='flex justify-between'> 
                        <h4>{entry[0]}:</h4>
                        <h4>{entry[1]}</h4>
                    </div>
                ))}
                <h4>{`}`}</h4>
            </div>
        </div>
    )
}

export { LatestPosition }