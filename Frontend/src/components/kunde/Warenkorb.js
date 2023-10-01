import React, { useContext, useDebugValue, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import '../../css/kunde.css';
import { Alert, Badge, Card, Form, InputGroup, Table } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import X from './WarenkorbCard';
import { sectionContact } from '../../Contect';
import Section from '../Section';
import TerminK from './TerminK';
import { BsCheckSquare } from 'react-icons/bs';


function Warenkorb(props){

  const [rendern, setrendern] = useState('warenkorb');
  const [p_anzahl,setp_anzahl]= useState(1);

  const productsState = useState(props.products);
  const [wID, setwID] = useState(null);
  const [Warenkorb, setWarenkorb] = useState();
  const [spiner, setspiner] = useState(false);
  const [fehler, setfehler] = useState('');
  const [perfect, setperfect] = useState('');
  const [date, setdate] = useState({jahr:'', monat:'', tag:''});
  const [jahr, setJahr] = useState({jahr:''});
  const [monat, setMonat] = useState({monat:''});
  const [tag, setTag] = useState({tag:''});
  const [l, setl] = useState(1);
  const [pNr, setpNr] = useState(null);
  const [geloescht, setgeloescht] = useState('');
  const [warning, setwarning] = useState('');



  // Termin
  const [terminslot, setterminslot] = useState(false);
  const [termindrop, settermindrop] = useState(false);
  const [t, sett] = useState(null);
  const {section, setsection} = useContext(sectionContact);
  const [terminfrei, setterminfrei] = useState(false);
  const [terminbesetzt, setterminbesetzt] = useState(false);
  const [meldung, setmeldung] = useState('');


  // Bestellung
  const [slotNr, setslotNr] = useState(null);
  const [s, sets] = useState(1);
  const [cc, setcc] = useState(1);


  const x=1;


  const [produkte, setprodukte] = useState([])
  
  // Produkte im Warenkorb anzeigen
  function produkteAnzeigen() {
    console.log('Produkte ausgeben.')

    let input = {
      "first": "bestellung",
      "second": "warenkorbEinsehen"
    }
    fetchapi('POST',input, '/kunde-functions').then((res)=>{
      console.log(res.data.data.length);
      if(res.data.data.length === 0) {
          setwarning(res.data.msg)
          console.log(res)
      } else if(res.data.status == true){
         setprodukte(res.data.data)
         console.log(res.data.msg)
         console.log(res.data.data)
        } else {
          setfehler(res.data.msg)
          console.log(res.data.msg)
        }
    })
}

useEffect(()=>{
    produkteAnzeigen()
},[])


  function loeschenclick(l){
    console.log('Produkt aus dem Warenkorb entfernen.')
    console.log(l)
    setpNr(l)
    setl((prev)=>{return prev+1})

    let input = {
      "first": "bestellung",
      "second": "produktAusWarenkorb",
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


  // Terminauswahl
  function terminclick(){
    setrendern('termin')
  }

  function tz(){
    setrendern('warenkorb')
  }

  // Datum
  function dateselect(event){
    console.log(event.target.value)
    setdate((prev)=>{return {...prev,[event.target.name]:event.target.value}})
  }

  function handleChangeJahr(event) {
    setfehler('')
    setperfect(false);
    const newJahr = [...jahr];
    newJahr[event.target.jahr] = event.target.value;
    setJahr(newJahr);
  }

  function handleChangeMonat(event) {
    setfehler('')
    setperfect(false);
    const newMonat = [...monat];
    newMonat[event.target.monat] = event.target.value;
    setMonat(newMonat);
  }

  function handleChangeTag(event) {
    setfehler('')
    setperfect(false);
    const newTag = [...tag];
    newTag[event.target.tag] = event.target.value;
    setTag(newTag);
  }

  // Termine anzeigen
  function terminAnzeigen(){    
    console.log("Slots ausgegeben.")
    let input = {
      "first": "auftrag",
      "second": "termineEinsehen",
      "jahr": date.jahr,
      "monat": date.monat,
      "tag": date.tag
  }
  fetchapi('POST', input, '/kunde-functions').then((res) =>{
    console.log(res)
      setmeldung(res.data.msg)
      setterminslot(res.data.data)
      console.log(res.data.data)
      
  })
  }

  useEffect(()=>{
        console.log('Termine ausgeben Funktion.')
        terminAnzeigen()  
  },[]) 

 // Slot auswählen
  function checkclick(cc){
    console.log("ausgewählt")
    console.log(cc)
    setslotNr(cc)
    setcc((prev)=>{return prev+1})
  }

  // Bestellung abschließen
  function bestellenclick(){    
    console.log("Bestellung abschließen.")
    console.log(slotNr)
    let input = {
      "first": "auftrag",
      "second": "warenkorbBestellen",
      "jahr": date.jahr,
      "monat": date.monat,
      "tag": date.tag,
      "slot": slotNr
  }
  fetchapi('POST', input, '/kunde-functions').then((res) =>{
      console.log(res.data.msg)
      if(res.data.status == true){
        setperfect(res.data.msg)
      } else {
        setfehler(res.data.msg)
      }
  })
  }

  // Warenkorb Bestellmenge
  function minusclick(mc){
    setp_anzahl(mc)
    setp_anzahl((prev=>{
       return prev-1
    }))
  }

  function plusclick(pc){
    setp_anzahl(pc)
    setp_anzahl((prev=>{
       return prev+1
    }))
  }


  return (
    <div>
      {rendern === 'warenkorb' &&
          <div className='container-fluid'>
            <Card className='Warenkorb' >
            <div className='warenkorb' >
            <h3>
            Warenkorb: <Badge bg="secondary"></Badge>
            </h3>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
            {produkte.map((item)=>{
            return <X key={item.ProduktID} P_Name={item.P_Name} H_name={item.H_name} Preis={item.Preis} bild={item.Bild} Bestellmenge={item.Bestellmenge} loeschenclick={()=>{loeschenclick(item.ProduktID)}} plusclick={()=>{plusclick(item.Bestellmenge)}} minusclick={()=>{minusclick(item.Bestellmenge)}}>
            </X>
            })}
            {warning && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>Ihr Warenkorb ist leer!</Alert>}
            {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
            {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
            </div>
            <Button className='terminauswahlButton' variant='secondary' onClick={terminclick}>Termin auswählen</Button>
            </div>
            </Card>
            <Button variant='info' onClick={props.wkz}>zurück</Button>
          </div>
          }
          {rendern === 'termin' &&
          <div>
            <p></p>
          <InputGroup className="Kalender">
          <Form.Control name='jahr'
                  date="jahr"
                  value={date.jahr}
                  onChange={(event) => dateselect(event)}
                  placeholder="Jahr eingeben..."
                  />
          <Form.Control name='monat'
                  date="monat"
                  value={date.monat}
                  onChange={(event) => dateselect(event)}
                  placeholder="Monat eingeben..."
                  />
          <Form.Control name='tag'
                  date="tag"
                  value={date.tag}
                  onChange={(event) => dateselect(event)}
                  placeholder="Tag eingeben..."
                  />
          <Button style={{width:'107.4px', height:'70px'}} variant="primary" onClick={(event) => terminAnzeigen(event)}>
            Termine anzeigen
          </Button>
          </InputGroup>
          <Form.Text className="text-muted">
            Bitte geben Sie ein Datum der Form JJJJ.MM.TT ein.
          </Form.Text>
          {meldung && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>{meldung}</Alert>}
         
          
          <span></span>
          <div className="Terminauswahl" style={{ cursor: 'pointer'}}>
            {terminslot.map((item)=>{
            return <Table striped bordered hover key={item.slot}>
              <thead>
                <tr>
                  <th>Uhrzeit</th>
                  <th>Slot</th>
                  <th>Verfügbarkeit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{item.start} {item.ende}</td>
                  <td>{item.slot}</td>
                  <td><Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="" 
                            onClick={()=>{checkclick(item.slot)}}/>{item.besetzt === true ? 'besetzt' : 'frei'}
                        </Form.Group>
                  </td>
                </tr>
              </tbody>
            </Table>;
          })}</div> 
          <Button variant='primary' onClick={bestellenclick}> Bestellung abschließen</Button>
          {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
          {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
          <p></p>
          <Button variant='info' onClick={tz}>zurück</Button>
    </div>
    }
    </div>

  )
  }
export default Warenkorb;