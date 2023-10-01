import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import Alert from 'react-bootstrap/Alert';
import Spinner from '../Spiner'

function Arbeitszeiten() {

  const [workSchedule, setWorkSchedule] = useState([]);

        const [selectedWeek, setSelectedWeek] = useState(getKalendarWeek());

        const [brarbeitet, setbearbeitet] = useState(false);

        const [fehler, setfeher] = useState('')
        const [ok, setok] = useState('')
        const [spiner, setspiner] = useState(false)

        const handleWeekChange = week => {
            console.log(week)
            setSelectedWeek(week);
        };

        useEffect(()=>{
            aktulisieren()
        },[selectedWeek])

        function getKalendarWeek() {
            let date = new Date();
            let d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            d.setUTCDate(d.getUTCDate() - d.getUTCDay() + 1);
            let kw = Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 8.64e7) + 1) / 7);
            return kw;
          }

        const xyxy = (event)=>{
            setbearbeitet((prev)=>{return !prev})
            if(event.target.innerHTML==='Senden'){
                let input={
                    first: 'arbeitszeiten',
                    second: 'arbeitszeitAendern',
                    kw: selectedWeek,
                    data: workSchedule,
                  }
                  setspiner(true)
                fetchapi('POST', input, '/haendler-functions').then((res)=>{
                    if(res.status){
                      if(res.data.status){
                        console.log(res)
                        setok(res.data.msg)
                      }else{
                        setfeher(res.data.msg)
                      }
                    }else{
                        setfeher('Ein fehelr ist leider aufgetreten!')
                    }
                  })
                  setspiner(false)
            }
        }

        console.log(selectedWeek)

        const handleChange = (event,employee, index) => {
            console.log('jaaa')
        const newWorkSchedule = [...workSchedule];
        const currentEmployeeIndex = newWorkSchedule.findIndex(emp => emp.MitarbeiterID === employee.MitarbeiterID);
        const currentEmployee = {...newWorkSchedule[currentEmployeeIndex]};
        const schedule = [...currentEmployee.schedule];
        schedule[index] = {...schedule[index], [event.target.name]: event.target.value};
        currentEmployee.schedule = schedule;
        newWorkSchedule[currentEmployeeIndex] = currentEmployee;

        setWorkSchedule(newWorkSchedule);
        }

        function fetchzeit(){
            let input={
                first: 'arbeitszeiten',
                second: 'arbeitszeitenEinsehen',
                kw: selectedWeek
                }     
            setspiner(true)
            fetchapi('POST',input, '/haendler-functions').then((res)=>{
                if(res.status){
                    if(res.data.status){
                        console.log(res)
                        setWorkSchedule(res.data.data)
                    }else{
                        setfeher(res.data.msg)
                    }
                }else{
                    setfeher('Ein Fehler ist aufgetreten!')
                }
                setspiner(false)
              })    
        }

        function aktulisieren(){
            console.log(selectedWeek)
            fetchzeit()
        }

        useEffect(()=>{
            fetchzeit()
        },[])

        console.log(workSchedule);
  return (
    <div>
        {spiner && <Spinner />}
         {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
         {ok !=='' && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{ok}</Alert>}
         <div className="row">
             <div className="col-auto">
                    <Dropdown>
                    <Dropdown.Toggle variant="primary" id="dropdown-basic">
                        Kalenderwoche
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="scrollable-menu">
                        {[...Array(52).keys()].map(i => (
                        <Dropdown.Item key={i + 1} onClick={() => handleWeekChange(i + 1)}>
                            KW {i + 1}
                        </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                    </Dropdown>
                </div>
                </div>
                <h4> KW {selectedWeek}</h4>
                {!brarbeitet  && <div className="table-responsive">
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Wochentag</th>
                            <th>Montag</th>
                            <th>Dienstag</th>
                            <th>Mittwoch</th>
                            <th>Donnerstag</th>
                            <th>Freitag</th>
                            <th>Samstag</th>
                            <th>Sonntag</th>
                        </tr>
                        </thead>
                        <tbody>
                        {workSchedule.map((employee, index) => (
                            <tr key={employee.MitarbeiterID} className={index % 2 === 0 ? 'bg-light' : 'bg-white'}>
                            <td>{employee.name}</td>
                            {employee.schedule.map((day, index) => (
                                <td key={index}>
                                {day.isWorking ? `${day.startTime} - ${day.endTime}` : '_'}
                                </td>
                            ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>}
                    {brarbeitet && <div className="table-responsive">
                <table className="table">
                    <thead>
                    <tr>
                        <th>Wochentag</th>
                        <th>Montag</th>
                        <th>Dienstag</th>
                        <th>Mittwoch</th>
                        <th>Donnerstag</th>
                        <th>Freitag</th>
                        <th>Samstag</th>
                        <th>Sonntag</th>
                    </tr>
                    </thead>
                    <tbody>
                    {workSchedule.map((employee, index) => (
                        <tr key={employee.name} className={index % 2 === 0 ? 'bg-light' : 'bg-white'}>
                        <td>{employee.name}</td>
                        {employee.schedule.map((day, index) => (
                            <td key={index}>
                            <form>
                                <label>
                                Arbeitsbeginn:
                                <input type="time" name="startTime" value={day.startTime} onChange={(event)=>{handleChange(event,employee, index)}} />
                                </label>
                                <br />
                                <label>
                                Arbeitsende:
                                <input type="time" name="endTime" value={day.endTime} onChange={(event)=>{handleChange(event,employee, index)}} />
                                </label>
                            </form>
                            </td>
                        ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>}
      <div className="col-auto">
        <button className="btn btn-primary" onClick={(event)=>{xyxy(event)}}>{brarbeitet ? 'Senden' : 'Bearbeiten'}</button>
     </div>
  </div>
  );
}

export default Arbeitszeiten;