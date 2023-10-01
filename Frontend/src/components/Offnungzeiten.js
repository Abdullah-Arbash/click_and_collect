import React from 'react';


function Offnungzeiten({time}){
  console.log(time)
  // {day: 'Montag', startTime: '10:00', endTime: '17:00'}
    return(    
        <div>
     { <table>
          <tbody>
            {
              time.map((x)=>{
                return <tr key={x.day}>
                <td>{x.day}</td>
                <td className='data-wert'>{x.startTime === null ? '_?_' : x.startTime} bis {x.endTime === null ? '_?_' : x.endTime}</td>
              </tr>
              })
            }
          </tbody>
        </table>}
      </div>                    
    )
}

export default Offnungzeiten;