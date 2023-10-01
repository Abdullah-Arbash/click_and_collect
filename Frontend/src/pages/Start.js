import React, { useEffect } from 'react'
import { useState, useContext } from 'react'
import Button from 'react-bootstrap/Button'
import '../css/start.css'
import {FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import Alert from 'react-bootstrap/Alert'
import regcheck from '../module/regcheck'
import fetchapi from '../module/fetchapi'
import Spinner from 'react-bootstrap/Spinner'
import { useNavigate } from "react-router-dom"
import {rolleContact} from '../Contect'




function Start() {
    const navigete = useNavigate()   
    const [selectrolle, setselectrolle] = useState('') 
    const [click, setclick] = useState('');
    const [regForm, setregForm] = useState({
     rolle:'',
     name:'',
     vorname: '',
     email:'',
     passwort:'',
     geschaeftsname:'',
     impEmail:'',
     stasseNr:'',
     ortschaft:'',
     postleitzahl:'',
     land:'',
     tel:'',
     umsatzsteuerID:'',
     katalog:''
    })

    const [anmeldendaten, setanmeldedaten] = useState({
      email:'',
      passwort:''
    })
    const [regfehler, setregfehler] = useState('');
    const [regstatus, setregstatus] = useState(false);
    const [loginfelhler, setloginfehelr] = useState('');
    const [louding, setloudung] = useState(false);
    const {setrolle} = useContext(rolleContact); // {a: rolle, id: number}

    const [kataloge, setkatoge] = useState([]);
   
    function anmeldenClick(){ 
      setloginfehelr('')
         if(!anmeldendaten.email || !anmeldendaten.passwort){
           !anmeldendaten.email ? setloginfehelr('Bitte geben Sie Ihre email') : setloginfehelr('Bitte geben Sie den passwort')
         }else{
          setloudung(true)
          fetchapi('POST',anmeldendaten, '/login').then((res)=>{
            if(res.status){
              if(!res.data.status){
                setloudung(false)
                setloginfehelr(res.data.msg)
              }else{
                const where = res.data.table;
                if(where==='kunde'){
                  setrolle((prev)=>{return {...prev, a:'kunde'}})
                  navigete("/kunden-portal")
                }else if(where==='haendler'){
                  setrolle((prev)=>{return {...prev, a:'haendler'}})
                  navigete("/haendlern-portal")
                }else if(where==='mitarbeiter'){
                  setrolle((prev)=>{return {...prev, a:'mitarbeiter'}})
                  navigete("/mitarbeitern-portal")
                }else{
                  setrolle((prev)=>{return {...prev, a:'admin'}})
                  navigete("/admin-portal")
                }
              }
            }else{
              setloudung(false)
              setloginfehelr('Ein Fehler ist aufgetreten.')
              setanmeldedaten({ email:'', passwort:''})
            }
          })
         }
    }

    function regClick(){
      if(regcheck(regForm).status===true){
          setregfehler('')
          fetchapi('POST',regForm, '/reg').then((res)=>{
            console.log(res)
            if(res.status){
              if(res.data.status){
              setregstatus(true);
              setregForm({rolle:'',name:'',vorname: '',email:'',passwort:'',geschaeftsname:'',impEmail:'',stasseNr:'',ortschaft:'',postleitzahl:'',land:'',tel:'',umsatzsteuerID:''})
              }else{
                setregfehler(res.data.msg)
              }
            }else{
              setregstatus(false)
              setregfehler(res.msg)
            }
          })
        }else{
          setregstatus(false)
          regcheck(regForm).fehler==='eingaben' ? setregfehler('Es fehlen noch Pflichtangaben(*). Füllen Sie bitte die entsprechenden Felder aus.') : setregfehler('Ihre Email ist ungültig') 
        }
            
    }    
        
    function regFormchange(event){
      setregForm((prev)=>{
         return {...prev, [event.target.name]: event.target.value}
      })
      setregfehler('')
      setregstatus(false)
    }

    function anmeldechange(event){
      setanmeldedaten((prev)=>{
        return {...prev, [event.target.name]: event.target.value}
      })
    }

    function selecthandel(event){
      setselectrolle(event.target.value)
      setregForm((prev)=>{
        return {...prev, [event.target.name]: event.target.value}
      })
    }

    useEffect(()=>{
      if(click==='registrieren'){
        fetchapi('POST',{},'/shopcategories').then((res)=>{
          console.log(res);
          setkatoge(res.data.data)
        })
      }  
    },[click])

    const passwortvergessen = ()=>{
      navigete("/passwortvergessen")
    }

    return (  
    <div className='container'>
        <div className='startPage'>
            <div className='img-btn-2'>
                <img src='/imges/logo.png' alt='logo'/>
                  <div className='btn-2'>
                    <Button variant="success" name='anmelden' onClick={(event)=>{setclick(event.target.name)}}>Anmelden</Button>
                  <Button variant="success" name='registrieren' onClick={(event)=>{setclick(event.target.name)}}>Registrieren</Button>
                </div>
            </div>
        </div>

            {click === 'anmelden' &&
             <div className='form_2'>
               <FormControl className="my-2" fullWidth required>
                 <TextField label="Email" variant="outlined" name='email' onChange={anmeldechange} value={anmeldendaten.email} autoComplete="email" required />
               </FormControl>
               <FormControl className="my-2" fullWidth required>
                 <TextField label="Passwort" type="password" variant="outlined" name='passwort' onChange={anmeldechange} value={anmeldendaten.passwort} autoComplete="current-password" required />
               </FormControl>
               {loginfelhler!=='' && <Alert key='danger' variant='danger' style={{textAlign:'center'}}> {loginfelhler} </Alert>}
               {louding && <Spinner style={{marginLeft:'auto', marginRight: 'auto', marginBottom:'10px'}} animation="border" variant="secondary" />}
               <Button variant="primary" onClick={anmeldenClick}>Anmelden</Button>
               <p style={{fontSize:'17px', margin:'0', textAlign:'center', cursor:'pointer'}} onClick={()=>{passwortvergessen()}}>Haben Sie Ihr Passwort Vergessen?</p>
            </div>}

            {click === 'registrieren' &&
             <div className='form_2'>
            <FormControl className="my-2" fullWidth required>
              <InputLabel>Select Rolle</InputLabel>
               <Select label="Select Rolle" value={regForm.rolle} name='rolle'
                onChange={selecthandel}>
                <MenuItem value="kunde">Kunde</MenuItem>
                <MenuItem value="haendler">Händler</MenuItem>
             </Select>
            </FormControl>
            {selectrolle!=='' && 
             <><div><FormControl className="my-2 as" required>
                 <TextField label="Name" name='name' value={regForm.name} onChange={regFormchange} variant="outlined" autoComplete="name" required />
               </FormControl>
               <FormControl className="my-2 as" required>
                 <TextField label="Vorname" name='vorname' value={regForm.vorname} onChange={regFormchange} variant="outlined" autoComplete="name" required />
               </FormControl>
               </div>
               <FormControl className="my-2" fullWidth required>
                 <TextField label="Email" variant="outlined" name='email' value={regForm.email} onChange={regFormchange} autoComplete="email" required />
               </FormControl>
               <FormControl className="my-2" fullWidth required>
                 <TextField label="Passwort" type="password" variant="outlined" name='passwort' value={regForm.passwort} onChange={regFormchange} autoComplete="current-password" required />
               </FormControl>
               </>
             }
             {selectrolle==='haendler' &&
              <><><p className=''>Ihre Impressum Daten:</p>
              <FormControl className="my-2" fullWidth required>
                      <InputLabel id="select-label">shopkategorie</InputLabel>
                      <Select name="katalog" label="shopkategorie" value={regForm.katalog} onChange={regFormchange} fullWidth>
                        {kataloge.map((x)=>{
                         return <MenuItem value={x.shopkategorieName} key={x.shopkategorieId}>{x.shopkategorieName}</MenuItem>
                        })}
                      </Select>
              </FormControl>
                <FormControl className="my-2" fullWidth required>
                  <TextField label="Ihr geschäftsname" variant="outlined" name='geschaeftsname' value={regForm.geschaeftsname} onChange={regFormchange} autoComplete="name" required />
                </FormControl>
              </>
                <div>
                <FormControl className=" my-2 as" required>
                  <TextField label="Email adresse" name='impEmail' value={regForm.impEmail} onChange={regFormchange} variant="outlined" autoComplete="email" required/>
                </FormControl> 
                <FormControl className=" my-2 as" required>
                  <TextField label="Straße/Nr" name='stasseNr' value={regForm.stasseNr} onChange={regFormchange} variant="outlined" required/>
                </FormControl> 
                <FormControl className="my-2 as" required>
                  <TextField label="Ortschaft" name='ortschaft' value={regForm.ortschaft} onChange={regFormchange} variant="outlined" required />
                </FormControl>
                <FormControl className=" my-2 as" required>
                  <TextField label="Postleitzahl" name='postleitzahl' value={regForm.postleitzahl} onChange={regFormchange} variant="outlined" required />
                </FormControl> 
                <FormControl className="my-2 as" required>
                  <TextField label="Land" name='land' value={regForm.land} onChange={regFormchange} variant="outlined" required />
                </FormControl>
                <FormControl className="my-2 as" required>
                  <TextField label="Tel" name='tel' value={regForm.tel} onChange={regFormchange} variant="outlined" autoComplete="tel" required />
                </FormControl>
                <FormControl className="my-2" fullWidth required>
                  <TextField label="Umsatzsteuer-ID" name='umsatzsteuerID' value={regForm.umsatzsteuerID} onChange={regFormchange} variant="outlined" required />
                </FormControl>
                </div></>
             }
             {regstatus===true && <Alert key='success' variant='success' style={{textAlign:'center'}}> die Registrierung war erfolgreich! </Alert>}
             {regfehler!=='' && <Alert key='danger' variant='danger' style={{textAlign:'center'}}> {regfehler} </Alert>}
             {selectrolle!=='' && <Button variant="primary" onClick={regClick}>Registrieren</Button>}
            </div>}
    </div>   
    );
}

export default Start;