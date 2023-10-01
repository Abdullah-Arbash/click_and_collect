import React from 'react'
import { useContext, useState, useEffect} from 'react'
import NavM from '../components/NavM'
import ExtentionNav from '../components/ExtentionNav'
import {rolleContact, sectionContact} from '../Contect'
import Section from '../components/Section'
import '../css/haendler.css'
import Button from 'react-bootstrap/Button'
import Offnungzeiten from '../components/Offnungzeiten'
import Spiner from '../components/Spiner'
import fetchapi from '../module/fetchapi'
import InputGroup from 'react-bootstrap/InputGroup'
import { FormControl,Form} from 'react-bootstrap'
import Alert from 'react-bootstrap/Alert'
import Mitarbeitertabele from '../components/händeler/Mitarbeitertabele'
import AufgabenH from '../components/händeler/AufgabenH'
import SortimentH from '../components/händeler/SortimetH'
import Arbeitszeiten from '../components/händeler/Arbeitszeiten'
import Auftraege from '../components/händeler/Auftraege'
import Verkaufsdaten from '../components/händeler/Verkaufsdaten'
import { useNavigate } from 'react-router-dom'



function HaenderPortal() {
    const {rolle} = useContext(rolleContact)
    const {section, setsection} = useContext(sectionContact)
    const [profildrop, setprofildrop] = useState(false)
    const [bearbeitetbuttom, setbearbeitetbuttom] = useState(false)
    const [spiner, setspiner] = useState(false)
    const [profildaten, setprofildaten] = useState({})
    
    const [opentime, setopentime] = useState([]);

    const [fehler,setfehler] = useState('')
    const [perfect,setperfect] = useState(false)
    const [worning, setworning] = useState(false) 
    const [success, setsuccess] = useState('');
    const [fail, setfail] = useState('');

    const navigate = useNavigate()

  

     useEffect(()=>{
            if(bearbeitetbuttom){
                setworning(true)
            }
            if(profildrop){
                setspiner(true)
                fetchapi('POST',{}, '/view-profile').then((res)=>{
                    if(res.status){
                        if(res.data.status){
                          setspiner(false)
                          setfehler('')
                          setopentime(res.data.data)
                          setprofildaten(res.data.details)
                        }else{
                          setspiner(false)
                          setfehler(res.data.msg)
                        }
                      }else{
                        setspiner(false)
                        setfehler('Ein fehler ist aufgetreten!')
                      }
                })
                
            }
    },[bearbeitetbuttom, profildrop])

                                                /* start profil */

    function profilclick(){setprofildrop((prev)=>{ return !prev}) 
    setsection('')
    }

    function click(){setprofildrop(false)}

    function bearbeitenclick(){
        setbearbeitetbuttom(prev=>!prev)
            setperfect(false)
            setworning(false)
            setfehler('')
    }

    function abschickenbuttom(){
        setworning(false)
             setspiner(true)
             let input={
                data: profildaten,
                time:opentime
             }
            fetchapi('POST',input,'/change-profile' ).then((res)=>{
                 if(res.status){
                    if(res.data.status){
                        console.log(res.data)
                        setspiner(false)
                        setsuccess(res.data.msg)
                    }else {
                        setspiner(false)
                        setfail(res.data.msg)
                    }
                 }else{
                    setspiner(false)
                    setfehler('Einfehler ist aufgetreten')
                 }   
            })
    }
    function datachangetime(event){
        const x = event.target.name
        let  v = event.target.value;

        if(x==='movon'||x==='mobis'||x==='divon'||x==='dibis'||x==='mivon'||x==='mibis'||x==='dovon'||x==='dobis'||x==='frvon'||x==='frbis'||x==='savon'||x==='sabis'||x==='sovon'||x==='sobis'){
            let newOpenTimes = [...opentime];
            if (x === 'movon') {
              newOpenTimes[0].startTime = v;
            } else if (x === 'mobis') {
              newOpenTimes[0].endTime = v;
            }
            if (x === 'divon') {
                newOpenTimes[1].startTime = v;
              } else if (x === 'dibis') {
                newOpenTimes[1].endTime = v;
              }
              if (x === 'mivon') {
                newOpenTimes[2].startTime = v;
              } else if (x === 'mibis') {
                newOpenTimes[2].endTime = v;
              }
              if (x === 'dovon') {
                newOpenTimes[3].startTime = v;
              } else if (x === 'dobis') {
                newOpenTimes[3].endTime = v;
              }
              if (x === 'frvon') {
                newOpenTimes[4].startTime = v;
              } else if (x === 'frbis') {
                newOpenTimes[4].endTime = v;
              }
              if (x === 'savon') {
                newOpenTimes[5].startTime = v;
              } else if (x === 'sabis') {
                newOpenTimes[5].endTime = v;
              }
              if (x === 'sovon') {
                newOpenTimes[6].startTime = v;
              } else if (x === 'sobis') {
                newOpenTimes[6].endTime = v;
              }
            setopentime(newOpenTimes);
           }
        else{
            setprofildaten((prev)=>{return {...prev,[event.target.name]:event.target.value}   })
        }
    }

    function logoutclick(){
      localStorage.clear();
      navigate("/start")
 }

 function x(){
  setsection('')
}
                                       
    return ( 
        <div className='haendler'>
            <NavM geschäftname={profildaten.shopname} name={profildaten.name} rolle='Händler' profilclick={profilclick} logoutclick={logoutclick} x={x}/>
            <div className='container'>
                <ExtentionNav aufgaben={['Sortiment','Mitarbeiter','Arbeitszeiten','Aufgaben','Aufträge','Verkaufsdaten']} click={click}/>
                {spiner && <Spiner />}
                {profildrop && 
                <Section name='Profil:'>
                    {worning && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>Ihre Daten werden erst gespeichert erst nach dem Sie auf Abschicken gedrückt haben</Alert>}
                    {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                    {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>Ihre daten wurden erfolgreich gespeichert</Alert>}
                    <div className='buttoms'>
                    {!bearbeitetbuttom && <Button variant="secondary" onClick={bearbeitenclick} style={{marginBottom:'3rem'}}>Bearbeiten</Button>}
                    {bearbeitetbuttom && <div><Button variant="primary" onClick={bearbeitenclick}  style={{marginBottom:'3rem',marginRight:'10px'}}>zurück</Button><Button variant="primary" onClick={abschickenbuttom}  style={{marginBottom:'3rem'}}>Abschicken</Button></div>}
                    </div>  
                    <div className='profil'>
                     {!bearbeitetbuttom && <> <div className='links'>
                            <p className='data'>Shop-Name: <span className='data-wert'>{profildaten.shopname}</span></p>
                            <p className='data'>katogerie: <span className='data-wert'>{profildaten.shopkategorie}</span></p>
                            <div>
                            <p className='data' style={{margin:0}}> Adresse: </p>
                            <ul style={{ listStyle: 'none'}}>
                                <li><span>Straße: <span className='adresse-d'>{profildaten.straße}</span></span></li>
                                <li><span>Postleizal: <span className='adresse-d'>{profildaten.postleitzahl}</span></span></li>
                                <li><span>Ort: <span className='adresse-d'>{profildaten.ortschaft}</span> </span></li>
                                <li><span>Land: <span className='adresse-d'>{profildaten.land}</span> </span></li>
                            </ul>
                            </div>
                            <p className='data'>Tel: <span className='data-wert'>{profildaten.telefonnummer}</span></p>
                            <p className='data'>Umsatzsteuernummer: <br></br><span className='data-wert'>{profildaten.umsatzsteuerid}</span></p>
                            <div>
                            <p className='data' style={{margin:0}}>Öffnungszeiten:</p>
                                {profildaten.oeffnungszeiten === 'Noch nicht definiert' ? <p>{profildaten.oeffnungszeiten}</p> : <Offnungzeiten time={opentime} />} 
                            </div>
                        </div>
                        <div className='rechts'>
                        <p className='data'>Name: <span className='data-wert'>{profildaten.name}</span></p>
                        <p className='data'>Vorname: <span className='data-wert'>{profildaten.vorname}</span></p>
                        <p className='data'>Email: <span className='data-wert'>{profildaten.email}</span></p>
                        <p className='data'>Passwort: <span className='data-wert'>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span></p>
                        </div> </>}

                        {bearbeitetbuttom && <><div className='links'>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.shopname} onChange={datachangetime} name='shopname' placeholder='Shop-Name:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.shopkategorie} onChange={datachangetime} name='shopkategorie' placeholder='katogerie:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.straße} onChange={datachangetime} name='straße' placeholder='Straße:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.postleitzahl} onChange={datachangetime} name='postleitzahl' placeholder='Postleizal:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.ortschaft} onChange={datachangetime} name='ortschaft' placeholder='Ort:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.land} onChange={datachangetime} name='land' placeholder='Land:'/></InputGroup>
                        {fail && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fail}</Alert>}
                        {success && <Alert key='success' variant='success' style={{textAlign:'center'}}>{success}</Alert>}
                        </div>
                      { profildaten.oeffnungszeiten!=='Noch nicht definiert' &&  <Form>
                        <p className='data' style={{margin:'20px 0px 0px 0px'}}>Öffnungszeiten:</p>
                        <Form.Group>
                            <Form.Label>Montag</Form.Label> {/*{day: 'Montag', startTime: '10:00', endTime: '17:00'}*/}
                            <Form.Control onChange={datachangetime} value={opentime[0].startTime}  name='movon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[0].endTime}  name='mobis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Dienstag</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[1].startTime}  name='divon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[1].endTime}  name='dibis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Mittwoch</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[2].startTime}  name='mivon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[2].endTime}  name='mibis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Donnerstag</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[3].startTime}  name='dovon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[3].endTime}  name='dobis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Freitag</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[4].startTime}  name='frvon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[4].endTime}  name='frbis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Samstag</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[5].startTime}  name='savon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[5].endTime}  name='sabis' type="time" placeholder="Bis" />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Sonntag</Form.Label>
                            <Form.Control onChange={datachangetime} value={opentime[6].startTime}  name='sovon' type="time" placeholder="Von" />
                            <Form.Control onChange={datachangetime} value={opentime[6].endTime}  name='sobis' type="time" placeholder="Bis" />
                        </Form.Group>
                        </Form>}
                        
                        <div className='rechts'>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.name} onChange={datachangetime} name='name' placeholder='Name:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.vorname} onChange={datachangetime} name='vorname' placeholder='Vorname:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.email} onChange={datachangetime} name='shopemail' placeholder='Email:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.passwort} type="password" onChange={datachangetime} name='passwort' placeholder='Neue Paswort:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.neuepasswort} type="password" onChange={datachangetime} name='neuespasswort' placeholder='Paswort wiederholen:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.telefonnummer} onChange={datachangetime} name='telefonnummer' placeholder='Tel:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.umsatzsteuerid} onChange={datachangetime} name='umsatzsteueridentifikationsnummer' placeholder='Umsatzsteuernummer:'/></InputGroup>
                        </div> </>}
                    </div>   
                </Section>
                }



                {section!== '' && <Section name={`${section}:`}>


                  {section === 'Mitarbeiter' &&
                  <div className='mitarbeiter'>
                      <Mitarbeitertabele/>      
                  </div>              
                  }
                  {section === 'Aufgaben' &&
                  <div className='Aufgaben'>
                    <AufgabenH />
                  </div>              
                  }

                  {section === 'Sortiment' &&
                  <div className='sortiment'>
                    <SortimentH />
                  </div>              
                  }

                  {section === 'Arbeitszeiten' &&
                  <div className='Arbeitszeiten'>
                    <Arbeitszeiten />
                  </div>              
                  }

                 {section === 'Aufträge' &&
                  <div className='Aufträge'>
                    <Auftraege />
                  </div>              
                  }

                 {section === 'Verkaufsdaten' &&
                  <div className='verkaufsdaten'>
                    <Verkaufsdaten />
                  </div>              
                  }

                              
                  </Section>}
            </div>
      </div>
     );
}

export default HaenderPortal;