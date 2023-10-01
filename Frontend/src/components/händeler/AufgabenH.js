import React, { useState, useEffect } from 'react';
import { Table, Button, Dropdown } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import Spiner from '../Spiner';
import Alert from 'react-bootstrap/Alert';


function AufgabenH(){

    const [tasks, setTasks] = useState([]);
    
      const [employees, setEmployees] = useState([]);

      const [newTask, setNewTask] = useState('');

      const [newEmployee, setNewEmployee] = useState('');

      const [spiner, setspiner] = useState(false);

      const [ok, setok] = useState('');

      const [fehler, setfehler] = useState('');

      function start(){
        let input={
          first: 'aufgaben',
          second: 'aufgabenEinsehen',
        }
        setspiner(true)
        fetchapi('POST', input, '/haendler-functions').then((res)=>{
          if(res.status){
            if(res.data.status){
              console.log('aufgabenEinsehen')
              console.log(res)
              setTasks(res.data.data)
              setspiner(false)
              setfehler('')
         //   setok(res.data.msg)
            }else{
              setspiner(false)
              setok('')
              setfehler(res.data.msg)
            }
          }else{
            setspiner(false)
            setfehler('Einfehler ist aufgetreten!')
          }
        })
      }

      useEffect(()=>{

        // **11**
        start()
   
        // **22**
        
        let input_2= {
          first: 'aufgaben',
          second: 'mitarbeiterDropdown',
        }
        fetchapi('POST', input_2, '/haendler-functions').then((res)=>{   // response muss gepasst werden !! 
          console.log('mitarbeiterDropdown');
          console.log(res)
         setEmployees(res.data.data)
        })

      },[])
      

      function aufgabeerstellen(){
        setfehler('')
        setok('')
        let input_3= {
          first: "aufgaben",
          second: "aufgabeErstellen",
          id: newEmployee,
          task: newTask,
        }

        fetchapi('POST', input_3, '/haendler-functions').then((res)=>{
          if(res.status){
            if(res.data.status){
              console.log('löschen')
              console.log(res)
              setspiner(false)
              setfehler('')
              setok(res.data.msg)
              start()
            }else{
              setspiner(false)
              setok('')
              setfehler(res.data.msg)
            }
          }else{
            setspiner(false)
            setfehler('Einfehler ist aufgetreten!')
          }
        })
        setNewTask('')
      }

      function aufgabeerllll(x){
        setfehler('')
        setok('')
        console.log(x)
        let input_4= {
          "first": "aufgaben",
          "second": "aufgabeLöschen",
          "task": x.task,
          "id": x.id
        }

        fetchapi('POST', input_4, '/haendler-functions').then((res)=>{
          if(res.status){
            if(res.data.status){
              console.log('löschen')
              console.log(res)
              setspiner(false)
              setfehler('')
              setok(res.data.msg)
              start()
            }else{
              setspiner(false)
              setok('')
              setfehler(res.data.msg)
            }
          }else{
            setspiner(false)
            setfehler('Einfehler ist aufgetreten!')
          }
          
        })
      }
      

      return (
        <div>
          {ok && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{ok}</Alert>}
          {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
          {spiner && <Spiner />}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Aufgabe</th>
              <th>Zuständiger Mitarbeiter</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
        {tasks.map((task, index) => (
          <tr key={index} variant={index % 2 === 0 ? 'light' : 'dark'}>
            <td>
              <input
                type="text"
                value={task.task}
                onChange={event => {
                  const newTasks = [...tasks];
                  newTasks[index].task = event.target.value;
                  setTasks(newTasks);
                }}
              />
            </td>
            <td>{task.employee}</td>
            <td>
              <Button style={{width:'107px'}}
                onClick={() => {aufgabeerllll(task)}}
              >
                Löschen
              </Button>
            </td>
          </tr>
        ))}
        <tr>
          <td>
            <input
              value={newTask}
              type="text"
              placeholder="Neue Aufgabe"
              onChange={event => {
                setNewTask(event.target.value);
              }}
            />
          </td>
          <td>
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic">
                Mitarbeiter auswählen
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {employees.map(employee => (
                  <Dropdown.Item
                    key={employee}
                    onClick={() => setNewEmployee(employee.ID)}
                  >
                    {employee.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </td>
          <td>
            <Button variant="primary"
              onClick={() => {
                aufgabeerstellen()
              }}
            >
              Hinzufügen
            </Button>
          </td>
        </tr>
      </tbody>
      </Table>
      </div>
  );

}

export default AufgabenH;

