import React, { useEffect, useState } from 'react';
import { Form, FormControl, Button, Dropdown } from 'react-bootstrap';
import { Table } from 'react-bootstrap';
import { BsDownload } from 'react-icons/bs';
import fetchapi from '../../module/fetchapi';
import Spinner from '../Spiner';
import jsPDF from 'jspdf';



function ArbeitszeitenM() {
    const [workTimes, setWorkTimes] = useState([]);

    const [tasks, setTasks] = useState([]);

    const [gerendert, setgerendert] = useState('einsicht')

    const [selectedWeek, setSelectedWeek] = useState(0);

    const [fehler, setfeher] = useState('')
    const [ok, setok] = useState('')
    const [spiner, setspiner] = useState(false)

    function fetchzeit(){
      let input={
          first: 'arbeitszeiten',
          second: 'arbeitszeitenEinsehen',
          kw: selectedWeek
          }     
      setspiner(true)
      fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
          if(res.status){
              if(res.data.status){
                  setWorkTimes(res.data.data)
              }else{
                  setfeher(res.data.msg)
              }
          }else{
              setfeher('Ein Fehler ist aufgetreten!')
          }
          setspiner(false)
        })    
  }

  

  const handleDownload = () => {
    const pdf = new jsPDF();
  
    const data = workTimes.map(item => {
      if (item.isWorking) {
        return [item.startTime, item.endTime];
      } else {
        return [null, null];
      }
    });
  
    // Tabelle hinzufügen
    pdf.autoTable({
      head: [['Montag', 'Dienstag', 'Mitwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']],
      body: [data],
    });
  
    pdf.save(`Arbeitszeiten .....`);
  }

    const handleTask = () => {
        if(gerendert ==='einsicht'){setgerendert('aufgaben')}
        else{setgerendert('einsicht')}
    }


    console.log(tasks)

      const handleCheckbox = (task) => {
  
      };

      const handleWeekChange = week => {
        console.log(week)
        setSelectedWeek(week);
    };

    useEffect(()=>{
      aktulisieren()
    },[selectedWeek])

    useEffect(()=>{
      fetchzeit()
    },[])

    function aktulisieren(){
      fetchzeit()
  }
  function start(){
    let input={
      "first": "aufgaben",
      "second": "aufgabenEinsehen",
  
    }
    setspiner(true)
    fetchapi('POST', input, '/mitarbeiter-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          console.log(res)
          setTasks(res.data.data)
        }else{
            setfeher(res.data.msg)
        }
    }else{
        setfeher('Ein Fehler ist aufgetreten!')
    }
    setspiner(false)
    })
  }

  useEffect(()=>{
    if(gerendert === 'aufgaben'){
      start()
    }
  },[gerendert])

    return ( 
        <div>
          {spiner && <Spinner />}
            {gerendert ==='einsicht' && <><Form>
            <h4> KW {selectedWeek}</h4>
                <div className='u-u'>
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
                <Button variant="primary" onClick={handleDownload}>
                <BsDownload></BsDownload>
                </Button>
                <Button variant="primary" onClick={handleTask}>
                    Aufgaben
                </Button>
                </div>
            </Form>
            <Table striped bordered hover>
                <thead>
                    <tr>
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
                    <tr>
                      {workTimes.map((day, index) => (
                        <td key={index}>
                          {day.startTime} - {day.endTime}
                        </td>
                      ))}
                    </tr>
                </tbody>
            </Table> </>}
            {gerendert === 'aufgaben' &&<>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: '1rem' }}>
               <Button variant="primary" onClick={handleTask} style={{ alignSelf: 'flex-end' }}>Zurück</Button>
            </div>
                        <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Aufgabe</th>
                            <th>Erledigt</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                            <td>{task.task}</td>
                            <td>
                                <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleCheckbox(task)}
                                />
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                </>
            }
        </div>
    );
}

export default ArbeitszeitenM;