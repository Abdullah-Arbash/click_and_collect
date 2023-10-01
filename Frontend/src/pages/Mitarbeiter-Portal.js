import React, {useContext,useState, useEffect} from 'react';
import NavM from '../components/NavM';
import ExtentionNav from '../components/ExtentionNav';
import Section from '../components/Section';
import { sectionContact } from '../Contect';
import { FormControl} from 'react-bootstrap';
import InputGroup from 'react-bootstrap/InputGroup';
import {rolleContact} from '../Contect';
import Button from 'react-bootstrap/Button';
import fetchapi from '../module/fetchapi';
import Alert from 'react-bootstrap/Alert';
import Produktkategorie from '../components/mitarbieter/Produktkategorie';
import ArbeitszeitenM from '../components/mitarbieter/ArbeitszeitenM';
import AufträgeM from '../components/mitarbieter/AufträgeM';
import { useNavigate } from 'react-router-dom';


function MitarbeiterPortal() {
    const {section, setsection} = useContext(sectionContact)
    const {rolle} = useContext(rolleContact)
    const [profildrop, setprofildrop] = useState(false)
    const [profildaten, setprofildaten] = useState({id:rolle.id,name:'',vorname:'',email:'',passwort:'',neuepasswort:''})
    const [bearbeitetbuttom, setbearbeitetbuttom] = useState(false)
    const [fehler,setfehler] = useState('')
    const [perfect,setperfect] = useState(false)
    const [worning, setworning] = useState(false)
    const [spiner, setspiner] = useState(false)
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

    function datachange(event){      
          setprofildaten((prev)=>{return {...prev,[event.target.name]:event.target.value}   })
    }

    function profilclick(){setprofildrop((prev)=>{ return !prev}) 
    setsection('')
    }

    function bearbeitenclick(){
        setbearbeitetbuttom(prev=>!prev)
            setperfect(false)
            setworning(false)
            setfehler('')
    }

    function click(){setprofildrop(false)}

    function abschickenbuttom(){
      setworning(false)
           setspiner(true)
          fetchapi('POST',profildaten,'/change-profile' ).then((res)=>{
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

  function logoutclick(){
    localStorage.clear();
    navigate("/start")
}

function x(){
    setsection('')
  }

    return ( 
      <div className='mitarbeiter'>
            <NavM geschäftname='' name='' rolle='Mitarbeiter' profilclick={profilclick} logoutclick={logoutclick} x={x}/>
            <div className='container'>
                  <ExtentionNav aufgaben={['Produktkategorie', 'Arbeitszeiten / Aufgaben','Aufträge']} click={click}/>

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
                            <div>
                            <ul style={{ listStyle: 'none'}}>
                            </ul>
                            </div>
                            <div>
                            </div>
                        </div>
                        <div className='rechts'>
                        <p className='data'>Name: <span className='data-wert'>{profildaten.name}</span></p>
                        <p className='data'>Vorname: <span className='data-wert'>{profildaten.vorname}</span></p>
                        <p className='data'>Email: <span className='data-wert'>{profildaten.email}</span></p>
                        <p className='data'>Passwort: <span className='data-wert'>&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;</span></p>
                        </div> </>}

                        {bearbeitetbuttom && <><div className='links'>

                        </div>

                        
                        <div className='rechts'>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.name} onChange={datachange} name='name' placeholder='Name:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.vorname} onChange={datachange} name='vorname' placeholder='Vorname:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.shopemail} onChange={datachange} name='shopemail' placeholder='Email:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.passwort} type="password" onChange={datachange} name='passwort' placeholder='Neues Passwort:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.neuespasswort} type="password" onChange={datachange} name='neuespasswort' placeholder='Passwort wiederholen:'/></InputGroup>
                        {fail && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fail}</Alert>}
                        {success && <Alert key='success' variant='success' style={{textAlign:'center'}}>{success}</Alert>}
                        </div> </>}
                    </div>   
                </Section>
                }



                  {section!== '' && <Section name={`${section}:`}>

                  {section === 'Produktkategorie' &&
                  <div className='produktkategorie'>
                      <Produktkategorie/>      
                  </div>              
                  }

                  {section === 'Arbeitszeiten / Aufgaben' &&
                  <div className='arbeitszeiten-aufgaben'>
                      <ArbeitszeitenM/>      
                  </div>              
                  }

                  {section === 'Aufträge' &&
                  <div className='aufträge'>
                      <AufträgeM/>      
                  </div>              
                  }

                              
                  </Section>}
            </div>
      </div>
     );
}

export default MitarbeiterPortal;