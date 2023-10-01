import React from 'react';
import {useState, useEffect} from 'react'
import { Form, Table } from 'react-bootstrap'
import fetchapi from '../../module/fetchapi'
import Spiner from '../Spiner'
import Button from 'react-bootstrap/Button'
import Alert from 'react-bootstrap/Alert'

function Mitarbeitertabele(){

  const [employees, setEmployees] = useState([]);
  
  const [mitarbeiter, setmitarbeiter] = useState({
    name:'',
    vorname:'',
    email:'',
    passwort:''
  })

  const [fehler, setfeher] = useState('')
  const [perfect, setperfect] = useState('')
  const [spiner, setspiner] = useState(false)
  const [on, seton] = useState(true)


  function start(){
    let input={
      first: 'mitarbeiter',
      second: 'mitarbeiterEinsehen',
    }
     setspiner(true)
     fetchapi('POST', input, '/haendler-functions').then((res)=>{
      if(res.data.details===0){
        seton(false)
      }
      setEmployees(res.data.data)
      setspiner(false)
     })
  }
  
  useEffect(()=>{
   start()
  },[])

  

  function handleChangemitarbeiter(event, index) {
    setfeher('')
    setperfect(false);
    const newEmployees = [...employees];
    newEmployees[index][event.target.name] = event.target.value;
    setEmployees(newEmployees);
  }




  function mitarbeiteraendern(event, index) {
    event.preventDefault();
    let input={
      first: 'mitarbeiter',
      second: 'mitarbeiterBearbeiten',
      name:employees[index].name,
      vorname: employees[index].vorname,
      email: employees[index].email,
      passwort: employees[index].passwort,
      id:employees[index].ID
    }
    setspiner(true)
    fetchapi('POST', input, '/haendler-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          setspiner(false)
          setperfect('Ihre Änderung wurden gespeichert')
        }else{
          setfeher(res.data.msg)
        }
      }else{
        setfeher('Ein fehler ist aufgetreten');
      }
    })
    setspiner(false)
  }  




  function mitarbeiterhinzufügen(){
    setfeher('')
    let input={
      first: 'mitarbeiter',
      second: 'mitarbeiterErstellen',
      name: mitarbeiter.name,
      vorname: mitarbeiter.vorname,
      email: mitarbeiter.email,
      passwort:mitarbeiter.passwort
      };
     setspiner(true)
     fetchapi('POST', input, '/haendler-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          setspiner(false)
          setmitarbeiter({name:'',vorname:'',email:'',passwort:''})
          setperfect('Ihre Änderung wurden genommen')
          start()
        }else{
          setfeher(res.data.msg)
        }
      }else{
        setfeher('Ein fehler ist aufgetreten')
      }
     })
     setspiner(false)
  }


    return(
      <div>
      {spiner && <Spiner />} 
      {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>Ihre Änderungen wurden gespeichert.</Alert>}
      {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
      <Table striped bordered hover>
           <thead>
              <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Vorname</th>
              <th>Email</th>
              <th>Passwort</th>
              <th></th>
              </tr>
           </thead>
          <tbody>
              {on && employees.map((employee, index) => (
                  <tr key={employee.ID}>
                  <td>{employee.ID}</td>
                  <td>
                  <Form.Control
                  name="name"
                  value={employee.name}
                  onChange={(event) => handleChangemitarbeiter(event, index)}
                  />
                  </td>
                  <td>
              <Form.Control
               name="vorname"
              value={employee.vorname}
              onChange={(event) => handleChangemitarbeiter(event, index)} 
              />
              </td>
              <td>
              <Form.Control
              name="email"
              value={employee.email}
              onChange={(event) => handleChangemitarbeiter(event, index)}
              />
              </td>
               <td>
              <Form.Control
              name="passwort"
              value={employee.passwort}
              onChange={(event) => handleChangemitarbeiter(event, index)}
              />
             </td>
              <td>
              <Button style={{width:'107.4px'}} variant="primary" onClick={(event) => mitarbeiteraendern(event, index)}>
                          Speichern
              </Button>
              </td>
              </tr>
               ))}
               <tr>
               <td>_</td>
               <td>
                  <Form.Control
                  name="name"
                  value={mitarbeiter.name}
                  onChange={(event)=>{setmitarbeiter((prev)=>{return {...prev, [event.target.name]: event.target.value}})}}
                  />
                </td>
                <td>
              <Form.Control
               name="vorname"
              value={mitarbeiter.vorname}
              onChange={(event)=>{setmitarbeiter((prev)=>{return {...prev, [event.target.name]: event.target.value}})}} 
              />
              </td>
              <td>
              <Form.Control
              name="email"
              value={mitarbeiter.email}
              onChange={(event)=>{setmitarbeiter((prev)=>{return {...prev, [event.target.name]: event.target.value}})}}
              />
              </td>
               <td>
              <Form.Control
              name="passwort"
              value={mitarbeiter.passwort}
              onChange={(event)=>{setmitarbeiter((prev)=>{return {...prev, [event.target.name]: event.target.value}})}}
              />
             </td>
             <td>
              <Button variant="primary" onClick={mitarbeiterhinzufügen}>
                          Hinzufügen
              </Button>
              </td>
               </tr>
        </tbody>
     </Table>
  </div>
    )
}


export default Mitarbeitertabele