import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import fetchapi from '../../module/fetchapi';
import X2 from './WunschlisteCard';
import '../../css/kunde.css';
import { Alert, Badge } from 'react-bootstrap';
import { Card } from 'react-bootstrap';

function Wunschliste(props){

  const [produkte, setprodukte] = useState([]);
  const [l, setl] = useState(1);
  const [pNr, setpNr] = useState(null);
  const [fehler, setfehler] = useState('');
  const [perfect, setperfect] = useState('');
  const [warning, setwarning] = useState('');

  // Produkte in der Wunschliste anzeigen
  function produkteAnzeigen() {
    console.log('Produkte ausgeben.')

    let input = {
      "first": "produkt",
      "second": "wunschlisteEinsehen"
    }
    fetchapi('POST',input, '/kunde-functions').then((res)=>{
      console.log(res)
        if(res.data.data.length === 0){
        setwarning(res.data.msg)
        console.log(res)
        console.log(res.data.msg) 
      }
         setprodukte(res.data.data)
         console.log(res.data.data)
      
    })
}

useEffect(()=>{
    produkteAnzeigen()
},[])

// Produkt aus der Wunschliste löschen
function loeschenclick(l){
  console.log('Produkt aus der Wunschliste entfernen.')
  console.log(l)
  setpNr(l)
  setl((prev)=>{return prev+1})

  let input = {
    "first": "produkt",
    "second": "produktAusWunschliste",
    "produktID": pNr
  }
  fetchapi('POST', input, '/kunde-functions').then((res)=>{
    console.log(res.msg)
    if(res.data.status == true) {
    console.log('Produkt aus dem Warenkorb entfernt.')
    setperfect(res.data.msg)
  } else {
    setfehler(res.data.msg)
  }
  })
}


  return (
    <div>
          <div className='container-fluid'>
            <Card className='Wunschliste'>
            <div className='wunschliste' >
            <p></p>
            <h3>
            Wunschliste: <Badge bg="secondary"></Badge>
            </h3>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
            {produkte.map((item)=>{
            return <X2 key={item.ProduktID} P_Name={item.P_Name} H_name={item.H_name} Bestellmenge={item.Bestellmenge} Preis={item.Preis} bild={item.Bild} loeschenclick={()=>{loeschenclick(item.ProduktID)}}/>
            })}
            {warning && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>Ihre Wunschliste ist leer!</Alert>}
            {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
            {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
            </div>
            <Button variant='info' onClick={props.wlz}>zurück</Button>
            </div>
            </Card>
          </div>
    </div>
  )
}

export default Wunschliste;
