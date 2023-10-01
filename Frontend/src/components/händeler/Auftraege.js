import React, { useEffect, useState } from 'react';
import { Table, Button, Card } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import Spinner from '../Spiner'
import Alert from 'react-bootstrap/Alert'
import Offnungzeiten from '../Offnungzeiten';


function Auftraege() {
  const [gerendert, setgerendert] = useState('einsicht')

  const [einsichtdata, seteinsichtdata] = useState([]);

  const numAuftraege = einsichtdata.length;
  const heute = new Date().toLocaleDateString();

  const [oeffneneAuftrage, setoeffneneAuftrage] = useState([]) 

  const [inputSuche, setinputSuche] = useState('');

  const [fehler, setfeher] = useState('')
  const [spiner, setspiner] = useState(false)

  const [okb, setokb] = useState('')

  const [auftrag, setAuftrag] = useState({});

  // Abholschein
  const [a, seta] = useState(1);
  const [auftragid, setauftragid] = useState(null);
  const [bestellinfos, setbestellinfos] = useState({Abholnummer:'', Datum:'', Tag:'', Slot:'', Gesamtkosten:''});
  const [produkte, setprodukte] = useState([]);
  const [zustand, setzustand] = useState('');

  // Bild
  const imgStyle = {
    width: '100%',
    marginTop:'10px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '10px 10px 0px 0px'
  };

  // Shopdaten
  const [opentime, setopentime] = useState([]);
  const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}});
  

    useEffect(()=>{
      if(gerendert==='einsicht'){
              let input={
                "first": "auftrag",
                "second": "alleAuftraegeEinsehen",
                "tagesaktuell": false
            
              }
              setspiner(true)
              fetchapi('POST', input, '/haendler-functions').then((res)=>{
                if(res.status){
                  if(res.data.status){
                      seteinsichtdata(res.data.data)
                  }else{
                      setfeher(res.data.msg)
                  }
              }else{
                  setfeher('Ein Fehler ist aufgetreten!')
              }
              setspiner(false)
              })
      }
      if(gerendert==='ofeneAufträge'){
              let input={
                "first": "Aufträge",
                "second": "Einsicht-offenenAuftraege",
                sotiertnach: ''                
              }
              fetchapi('POST', input, '/haendler-functions').then((res)=>{
                console.log(res)
              })
      }
    },[gerendert])

    function auftragclick(auftragid){
      setfeher('')
      setokb('')
        setgerendert('auftrag')
        let input={
          "first": "auftrag",
          "second": "auftragNachID",
          "auftragID": auftragid
      
        }
        setspiner(true)
        fetchapi('POST', input, '/mitarbeiter-functions').then((res)=>{
          if(res.status){
            if(res.data.status){
                setAuftrag(res.data.details)
                setzustand(res.data.details.Zustand)
                console.log(res.data.details.Zustand)
                setbestellinfos(res.data.details)
                setprodukte(res.data.data)
            }else{
                setfeher(res.data.msg)
            }
        }else{
            setfeher('Ein Fehler ist aufgetreten!')
        }
        setspiner(false)
        })
    }

    

    function sotiernach_m(event){
        // fetch nach bestimmte sotier-art
        console.log(event.target.value)
    }

    function bestimmteauftragsuchen(){
        // fetch nach der such-input => der inputSuche state !!!!!!
    }
  
    const handleBezahltStatusChange = event => {
      setAuftrag({ ...auftrag, bezahltStatus: event.target.value });
    };
  
  
    const auftragstoenieren=(auftragid)=>{
      setokb('')
      setfeher('')
      console.log(auftragid)
      let input={
        "first": "auftrag",
        "second": "auftragStornieren",
        "auftragID": auftragid
    
      }
      setspiner(true)
      fetchapi('POST', input, '/mitarbeiter-functions').then((res)=>{
        if(res.status){
          if(res.data.status){
              setokb(res.data.msg)
          }else{
            setfeher(res.data.msg)
          }
      }else{
          setfeher('Ein Fehler ist aufgetreten!')
      }
      setspiner(false)
      })
      auftragclick(auftragid)
    }

    const auftragschiessen = (auftragid)=>{
      setokb('')
      setfeher('')
      console.log(auftragid)
      let input={
        "first": "auftrag",
        "second": "auftragAbschließen",
        "auftragID": auftragid
    
      }
      setspiner(true)
      fetchapi('POST', input, '/mitarbeiter-functions').then((res)=>{
        if(res.status){
          if(res.data.status){
              setokb(res.data.msg)
          }else{
              setfeher(res.data.msg)
          }
      }else{
          setfeher('Ein Fehler ist aufgetreten!')
      }
      setspiner(false)
      })
      auftragclick(auftragid)
    }


    // Abholschein
    function abholscheineinsehen(a){
      setgerendert('abholschein')
      console.log(a)
      setauftragid(a)
      seta((prev)=>{return prev+1})
    }

// Shopdetails
function shopdetailsanzeigen(){
  console.log('Shopdetails ausgeben...')

  fetchapi('POST', {}, '/view-profile').then((res) =>{
      if(res.status){
          if(res.data.status){
            setspiner(false)
            setfeher('')
            console.log(res)
            console.log(res.data.details)
            setopentime(res.data.data)
            setshopdaten(res.data.details)
          }else{
            setspiner(false)
            setfeher(res.data.msg)
          }
        }else{
          setspiner(false)
          setfeher('Ein fehler ist aufgetreten!')
        }
  })
}

useEffect(() =>{
  console.log('Shopdetails ausgegeben.')
  shopdetailsanzeigen()
},[])

function adz(){
  setgerendert('auftrag')
}


  return (
    <div>

                {spiner && <Spinner />}
                {gerendert==='einsicht' && <div className='einsicht'>
                {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
                    <div style={{textAlign: 'right'}}>
                      <Button variant="primary" onClick={()=>{setgerendert('ofeneAufträge')}}>Offene Aufträge ansehen</Button>
                        <div className="text-center mt-3">
                           <p className="text-muted">
                           Es gibt insgesamt <span style={{fontWeight:700}}> {numAuftraege} </span> Aufträge für heute, <span style={{fontWeight:700}}>{heute}</span>.
                        </p>
                       </div>
                    </div>
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Datum</th>
                    <th>AuftragID</th>
                    <th>Name</th>
                    <th>Vorname</th>
                    <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {einsichtdata.map((x) => (
                    <tr key={x.AuftragID} onClick={()=>{auftragclick(x.AuftragID)}} style={{ cursor: "pointer" }}>
                        <td>{x.Datum}</td>
                        <td>{x.AuftragID}</td>
                        <td>{x.Name}</td>
                        <td>{x.Vorname}</td>
                        <td>{x.Email}</td>
                    </tr>
                    ))}
                </tbody>
                </Table> </div>}
                


                {gerendert==='ofeneAufträge'  &&
                <div className='ofeneAufträge'>
                    <div className="top-bar d-flex justify-content-between align-items-center">
                    <select className="custom-select sort-by-dropdown" style={{maxWidth: '200px', fontSize: '1rem', height: 'calc(2.25rem + 2px)', padding: '0.375rem 1.75rem 0.375rem 0.75rem', borderRadius: '0.25rem'}} onChange={sotiernach_m}>
                        <option>Sortiert nach</option>
                        <option>Abholtermin</option>
                        <option>Abholnummer</option>
                        <option>Name</option>
                        <option>AuftragID</option>
                    </select>
                    <div style={{display:'flex', alignItems:'center'}}>
                    <input type="text" value={inputSuche} onChange={(event)=>{setinputSuche(event.target.value)}} placeholder="Suche ...." className="form-control search-input" style={{maxWidth: '400px', marginRight:'5px'}} />
                    <Button variant="success" className="zuruck-button" onClick={bestimmteauftragsuchen}>Suchen</Button>
                    </div>
                    <Button variant="primary" className="zuruck-button" onClick={()=>{setgerendert('einsicht')}}>Zurück</Button>
                    </div>
                    <Table striped bordered hover>
                    <thead>
                    <tr>
                    <th>Abholtermin</th>
                    <th>AuftragID</th>
                    <th>Name</th>
                    <th>Vorname</th>
                    <th>Email</th>
                    </tr>
                   </thead>
                    <tbody>
                    {oeffneneAuftrage.map((x) => (
                    <tr key={x.auftragID} onClick={()=>{auftragclick(x.auftragID)}}
                      style={{ cursor: "pointer" }}>
                        <td>{x.abholtermin}</td>
                        <td>{x.auftragID}</td>
                        <td>{x.name}</td>
                        <td>{x.vorname}</td>
                        <td>{x.email}</td>
                    </tr>
                    ))}
                    </tbody>
                    </Table>
                </div>
                }


          <div>
                {gerendert === 'auftrag' && (
                  <div>
                    {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okb}</Alert>}
                    {fehler !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehler}</Alert>}
                    <h3 style={{textAlign: 'center', fontSize:'22px'}}>NR: {auftrag.AuftragID}</h3>
                      <div style={{display:'flex',  justifyContent:'space-between'}}>
                      <Button style={{display:'block'}} variant="primary" onClick={()=>{auftragstoenieren(auftrag.AuftragID)}}>Auftrag stornieren</Button>
                      <Button style={{display:'block'}} variant="primary" onClick={()=>{abholscheineinsehen(auftrag.AuftragID)}}>Details</Button>
                      <Button variant="primary" className="zuruck-button" onClick={()=>{setgerendert('einsicht')}}>Zurück</Button>
                    </div>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Abholnummer</th>
                          <th>Datum</th>
                          <th>Slot</th>
                          <th>Name</th>
                          <th>Bezahlstatus</th>
                          <th>Auftragsstatus</th>
                          <th>Gesamtkosten</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{auftrag.AuftragID}</td>
                          <td>{auftrag.Datum}</td>
                          <td>{auftrag.Slot}</td>
                          <td>{auftrag.Name} {auftrag.Vorname}</td>
                          <td>
                            <select
                              value={auftrag.bezahltStatus}
                              onChange={handleBezahltStatusChange}
                            >
                              <option value="bezahlt">Bezahlt</option>
                              <option value="nicht bezahlt">Nicht bezahlt</option>
                            </select>
                          </td>
                          <td>{auftrag.Zustand}</td>
                          <td>{auftrag.Gesamtkosten}</td>
                        </tr>
                      </tbody>
                    </Table>
                    <Button style={{display:'block'}} variant="primary" onClick={()=>{auftragschiessen(auftrag.AuftragID)}}> Bestätigen</Button>
                  </div>
                )}
          </div>


          <div>
            {gerendert === 'abholschein' &&
            <div className="abholscheindetails">
            <div className="leftside">
            <div className="kundenname">
                <p className='data'><span className='data-wert'>{auftrag.Vorname}, {auftrag.Name}</span></p>
            </div>
            <div className="bestellinfos">
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Abholnummer</th>
                            <th>Datum und Uhrzeit</th>
                            <th>Tag</th>
                            <th>Slot</th>
                            <th>Gesamtkosten</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{bestellinfos.AuftragID}</td>
                            <td>{bestellinfos.Datum}</td>
                            <td>{bestellinfos.Tag}</td>
                            <td>{bestellinfos.Slot}</td>
                            <td>{bestellinfos.Gesamtkosten}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
            <div className="produktinfos">
                {produkte.map((item)=>{
                    return <Card key={item.ProduktID}>
                        <img style={imgStyle} variant="top" src={item.Bild} alt='foto'/>
                        <Card.Body>
                            <Card.Title style={{fontWeight:800}}>{item.P_Name}</Card.Title>
                            <Card.Text style={{fontWeight:500}}>€ {item.Preis}</Card.Text>
                            <Card.Text>Menge: {item.Bestellmenge}</Card.Text>    
                      </Card.Body>
                    </Card>
                    
                })}
            </div>
            </div>
            <div className="rightside">
                <div className="bezahlinfos">
                    <p>Die Bezahlung findet vor Ort statt.</p>
                    <h6>Bezahlung: {zustand}</h6>
                </div>
                <Card className = 'impressum'>
                <div className="container-fluid">
                <p></p>
                <p className="data">Shop-Name: <span className='data-wert'>{shopdaten.shopname}</span></p>
            <p className="data">Shop-Kategorie: <span className='data-wert'>{shopdaten.shopkategorie}</span></p>
            <p className="data">E-Mail Adresse: <span className="data-wert">{shopdaten.shopemail}</span></p>
            <div>
                <p className="data" style={{margin: 0}}>Adresse:</p>
                <ul style={{listStyle: 'none'}}>
                    <li><span>Straße: <span className='adresse-d'>{shopdaten.straße}</span></span></li>
                    <li><span>Postleitzahl: <span className='adresse-d'>{shopdaten.postleitzahl}</span></span></li>
                    <li><span>Ort: <span className='adresse-d'>{shopdaten.ortschaft}</span></span></li>
                    <li><span>Land: <span className='adresse-d'>{shopdaten.land}</span></span></li>
                </ul>
            </div>
            <p className="data">Telefonnummer: <span className='data-wert'>{shopdaten.telefonnummer}</span></p>
            <div>
                <p className='data' style={{margin:0}}>Öffnungszeiten:</p>
                {shopdaten.oeffnungszeiten === 'Noch nicht definiert' ? <p>{shopdaten.oeffnungszeiten}</p> : <Offnungzeiten time={opentime} />} 
            </div>
                </div>
                </Card>
            </div>
            <Button variant='info' onClick={adz}>zurück</Button>
        </div>
            }
          </div>








    </div>
  );
}

export default Auftraege;