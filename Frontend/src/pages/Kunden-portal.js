import React, { useState } from 'react';
import {rolleContact, sectionContact} from '../Contect';
import { useContext } from 'react';
import NavK from '../components/kunde/NavK';
import fetchapi from '../module/fetchapi';
import { useEffect } from 'react';
import { Card } from "react-bootstrap";
import Spiner from '../components/Spiner';
import Section from '../components/Section';
import InputGroup from 'react-bootstrap/InputGroup';
import { FormControl,Form, Badge} from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Warenkorb from '../components/kunde/Warenkorb';
import Wunschliste from '../components/kunde/Wunschliste';
import AbholscheineK from '../components/kunde/AbholscheineK';
import RechnungenK from '../components/kunde/RechnungenK';
import KundeShops from '../components/kunde/KundeShops';
import TerminK from '../components/kunde/TerminK';
import { useNavigate } from "react-router-dom";
import ProduktK from '../components/kunde/ProduktK';
import { AiFillMinusCircle, AiFillPlusCircle } from 'react-icons/ai';
import '../css/kunde.css';
import { Row } from 'react-bootstrap';
import Offnungzeiten from '../components/Offnungzeiten';


function KundenPortal() {

     const [gerendert, setgerendert] = useState('start');

     const {rolle} = useContext(rolleContact)
     const {section, setsection} = useContext(sectionContact)
     const [profildrop, setprofildrop] = useState(false)
     const [profilbearbeitetButton, setprofilbearbeitetButton] = useState(false)
     const [profildaten, setprofildaten] = useState({name:'', vorname:'', email:'', passwort:''})
     const [warenkorbdrop, setwarenkorbdrop] = useState(false)
     const [wunschlistedrop, setwunschlistedrop] = useState(false)
     const [abholscheinedrop, setabholscheinedrop] = useState(false)
     const [rechnungendrop, setrechnungendrop] = useState(false)
     const [fehler, setfehler] = useState('')
     const [perfect, setperfect] = useState(false)
     const [warning, setwarning] = useState(false)
     const [searchTerm, setSearchTerm] = useState('')
     const [spiner, setspiner] = useState(false)
     const [rechnungdrop, setrechnungdrop] = useState(false)
     const [abholscheindrop, setabholscheindrop] = useState(false)
     const navigate = useNavigate()
     const [success, setsuccess] = useState('');
     const [fail, setfail] = useState('');

     const[suche, setsuche] = useState(false)
    /* const [suchwort, setsuchwort] = useState({suchfeld:''});
     const [produktsuche, setproduktsuche] = useState('');
     const [shopsuche, setshopsuche] = useState(''); */

     // Suche
     const [PKNr, setPKNr] = useState(null);
     const [pnr, setpnr] = useState(null);
     const [pdetails, setpdetails] = useState([]);
     const [p_anzahl,setp_anzahl]= useState(1);

     
     
     

useEffect(()=>{
     if(profilbearbeitetButton){
          setwarning(true)
     }
     if(gerendert === 'profil'){
         setspiner(true)
         fetchapi('POST',{}, '/view-profile').then((res)=>{
             if(res.status){
                 if(res.data.status){
                   setspiner(false)
                   setfehler('')
                   console.log(res)
                   console.log(res.data.details)
                   setprofildaten(res.data.details)
                 }else{
                   setspiner(false)
                   setfehler(res.data.msg)
                 }
               }else{
                 setspiner(false)
                 setfehler('Ein Fehler ist aufgetreten!')
               }
         })
         
     }
},[profilbearbeitetButton, gerendert === 'profil'])
    
     function profilclick(){
          setgerendert('profil')
     }

     //Profil bearbeiten
     function profilbearbeitenclick(){
          setprofilbearbeitetButton(prev=>!prev)
              setperfect(false)
              setwarning(false)
              setfehler('')
     }
      
     function abschickenbutton(){
          setwarning(false)
               setspiner(true)
               fetchapi('POST', profildaten,'/change-profile' ).then((res)=>{
                    if(res.status){
                         if(res.data.status){
                         console.log(res.data)
                         setspiner(false)
                         setsuccess(res.data.msg)
                    } else {
                         setspiner(false)
                         setfail(res.data.msg)
                    }
                    }else{
                      setspiner(false)
                      setfehler('Ein Fehler ist aufgetreten!')
                    }   
               })
     } 

     function datachange(event){
          const x = event.target.name
              setprofildaten((prev)=>{return {...prev,[event.target.name]:event.target.value}   })
      }

     //Nav Funktionen
     function abholscheineclick(){
          setgerendert('abholschein')
     }

     function az(){
          setgerendert('start')
     }

     function rechnungenclick(){
          setgerendert('rechnung')
     }

     function rz(){
          setgerendert('start')
     }

     //Warenkorb
     function warenkorbclick(){ 
          setgerendert('warenkorb')
     }

     function wkz(){
          setgerendert('start')
     }

     //Wunschliste
     function wunschlisteclick(){
          setgerendert('wunschliste')
     }

     function wlz(){
          setgerendert('start')
     }

     function profilz(){
          setgerendert('start')
     }

     // Logout
     function logoutclick(){
          localStorage.clear();
          navigate("/start")
     }


    /* // Suche
     function kundesearch(event){
          console.log(event.target.value)
          setsuchwort((prev)=>{return {...prev,[event.target.name]:event.target.value}})
        }


     // Produktsuche
  function kundeProduktsuche(){
     console.log('Produktsuche')
     console.log(suchwort.suchfeld)
     let input = {
       "first": "produkt",
       "second": "suchfeld",
       "suchfeld": suchwort.suchfeld,
       "suchkategorie": "Produkte"
     }
     fetchapi('POST', input, '/kunde-functions').then((res) =>{
       console.log(res)
       setproduktsuche(res.data.data)
       console.log(res.data.data)
     })
   }
 
   useEffect(()=>{
     console.log('Produktsuche hat das Ergebnis ausgegeben.')
     kundeProduktsuche()  
   },[])
 
   // Shopsuche
   function kundeShopsuche(){
     console.log('Shopsuche')
     console.log(suchwort.suchfeld)
     let input = {
       "first": "produkt",
       "second": "suchfeld",
       "suchfeld": suchwort.suchfeld,
       "suchkategorie": "Shops"
     }
     fetchapi('POST', input, '/kunde-functions').then((res) =>{
       console.log(res)
       setshopsuche(res.data.data)
       console.log(res.data.data)
     })
   }
 
   useEffect(()=>{
     console.log('Shopsuche hat das Ergebnis ausgegeben.')
     kundeShopsuche()  
   },[]) */


   // Suche
   const [psuchdata, setpsuchdata] = useState();
   const [ssuchdata, setssuchdata] = useState([]);
   const [leer, setleer] = useState('');


   function suchenp(x){
     setpsuchdata(x)
     setgerendert('produktsuche')
   }

   function psz(){
     setgerendert('start')
   }

   function suchens(x){
     setssuchdata(x)
     setgerendert('shopsuche')
   }

   function keinergebnis(x){
     setleer(x)
     setgerendert('keinergebnis')
   }

   function kz(){
     setgerendert('start')
}

   function ssz(){
     setgerendert('start')
   }

   // Logoclick
   function logoclick(){
     setgerendert('start')
   }
   
   //Shortcut Produkt zur Wunschliste hinzufügen
   function wlclick(wl){
     console.log("Produkt hinzufügen, bitte warten...")
     console.log(wl)
     setPKNr(wl)

     let input = {
         "first": "produkt",
         "second": "produktInWunschliste",
         "produktID": PKNr
     }
     fetchapi('POST', input, "/kunde-functions"). then((res) =>{
         console.log(res.msg)
         if(res.data.msg == true) {
             console.log("Produkt der Wunschliste hinzugefügt.")
             setperfect(res.data.msg)
         } else {
             setfehler(res.data.msg)
         }
     })
 }

 //Shortcut Produkt zum Warenkorb hinzufügen
 function wkclick(wk){
     console.log("Produkt hinzufügen, bitte warten...")
     console.log(wk)
     setPKNr(wk)

     let input = {
         "first": "bestellung",
         "second": "produktInWarenkorb",
         "produktID": PKNr,
         "bestellmenge": p_anzahl
     }
     fetchapi('POST', input, "/kunde-functions"). then((res) =>{
         console.log(res.msg)
         if(res.data.status == true){
         console.log("Produkt dem Warenkorb hinzugefügt.")
         setperfect(res.data.msg)
     } else {
         setfehler(res.data.msg)
     }
     })
 }

 // Produktdetails
 function produktclick(pd){
     setgerendert('produktdetail')
     console.log(pd)
     setpnr(pd)
     produktdetailsAnzeigen()
 }

 function produktdetailsAnzeigen(){
     console.log("Produktdetails ausgeben...")

     let input = {
         "first": "produkt",
         "second":  "produktEinsehen",
         "produktID": pnr
     }
     fetchapi('POST', input, '/kunde-functions').then((res) =>{
          setpdetails(res.data.data)
          console.log(res.data.data)
     })
 }

 function minusclick(){
     setp_anzahl((prev=>{
        return prev-1
     }))
   }
 
   function plusclick(){
     setp_anzahl((prev=>{
        return prev+1
     }))
   }

 function pdz(){
     setgerendert('start')
}




// Shopsuche!!!!

    const [shopkategorieK, setshopkategoriek] = useState([]);
    const [shopkdrop, setshopkdrop] = useState(false);
    const [shopsk, setshopsk] = useState([]);
    const [skategorie, setskategorie] = useState('');
    const [shopdrop, setshopdrop] = useState(false);
    const [kNr, setkNr] = useState(null);
    const [shNr, setshNr] = useState(null);
    const [SNr, setSNr] = useState(null);
    const [shopnamedrop, setshopnamedrop] = useState(false);
    const [x, setx] = useState(1);
    const [y, sety] = useState(1);
    const [z, setz] = useState(1);
    const [m, setm] = useState(1);
    const [wk, setwk] = useState(1);
    const [wl, setwl] = useState(1);
    const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}});
    const [produktkategorie, setproduktkategorie] = useState([]);
    const [produktkategoriedrop, setproduktkategoriedrop] = useState(false);
    const [produkte, setprodukte] = useState([]);
    const [produktdrop, setproduktdrop] = useState(false);
    const [opentime, setopentime] = useState([]);

    // Bestellmenge
    const [bok, setbok] = useState('');
    const [bfehler, setbfehler] = useState('');

    
   //  const [spiner, setspiner] = useState(false);
    const style = {
        maxWidth: '200px',
        margin: '5px 5px 5px 5px', // top, right, bottom, left
      };
     

    // Produktdetails
    const imgStyle = {
        width: '100%',
        marginTop:'10px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0px 0px'
      };
    const [pd, setpd] = useState(1);

// Shopdetails
function shopclick (y) {
     setgerendert('shopdetails')
     console.log(y)
     setshNr(y)
     shopdetailsanzeigen()
     sety((prev)=>{return prev+1})
     }
 
     function shopdetailsanzeigen(){
         console.log('Shopdetails ausgegeben.')
         let input = {
             "first": "shops",
             "second": "shopNachShopID",
             "shopID": shNr
         }
         fetchapi('POST', input, '/kunde-functions').then((res) =>{
             if(res.status){
                 if(res.data.status){
                   setspiner(false)
                   setfehler('')
                   console.log(res)
                   console.log(res.data.details)
                   setopentime(res.data.data)
                   setshopdaten(res.data.details)
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
 
     useEffect(() =>{
         if(y>1){
             console.log('Shopdetails ausgegeben.')
         shopdetailsanzeigen()
         }
     },[y])
 
     function sdz(){
         setgerendert('start')
    }
     
      // Produktkategorien des Shops
      function shopnameclick (m){
         console.log(m)
         setSNr(m) 
         produktkategorienAnzeigen()
         setgerendert('produktkategorien')
         setm((prev)=>{return prev+1})
      }
 
      function produktkategorienAnzeigen(){
         console.log("Produktkategorien ausgegeben.")
         
         let input = {
             first: "shops",
             second: "produktkategorienNachShop",
             "shopID": SNr
         }
         fetchapi('POST', input, '/kunde-functions').then((res) =>{
             setproduktkategorie(res.data.data)
             console.log(res.data.data)
         })
     }
 
     useEffect(()=>{
         if(m>1){
             console.log('Produktkategorien ausgegeben.')
             produktkategorienAnzeigen()
         }
     },[m])
 
     function pkz(){
         setgerendert('shopdetails')
    }
 
      // Produkte des Shops
      function produktkategorieclick (z){
         console.log(z)
         setPKNr(z) 
         produkteAnzeigen()
         setgerendert('produkte')
         setz((prev)=>{return prev+1})
      }
 
      function produkteAnzeigen(){
         console.log("Produkte ausgegeben.")
         
         let input = {
             "first": "shops",
             "second": "produkteNachProduktkatogrie",
             "ProduktkategorieID": PKNr
         }
         fetchapi('POST', input, '/kunde-functions').then((res) =>{
             setprodukte(res.data.data)
             console.log(res.data.data)
         })
     }
 
     useEffect(()=>{
         if(z>1){
             console.log('Produkte ausgegeben.')
             produkteAnzeigen()
         }
     },[z])
 
     function pz(){
         setgerendert('produktkategorien')
    }
 
     // Produktdetails
     function produktclick(pd){
         setgerendert('produktdetails')
         console.log(pd)
         setpnr(pd)
         produktdetailsAnzeigen()
         setpd((prev)=>{return prev+1})
     }
 
     function produktdetailsAnzeigen(){
         console.log("Produktdetails ausgeben...")
 
         let input = {
             "first": "produkt",
             "second":  "produktEinsehen",
             "produktID": pnr
         }
         fetchapi('POST', input, '/kunde-functions').then((res) =>{
             setpdetails(res.data.data)
             console.log(res.data.data)
         })
     }
 
     useEffect(()=>{
         if(pd>1){
             console.log('Produktdetails ausgegeben.')
             produktdetailsAnzeigen()
         }
     },[pd])
 
     function minusclick(){
         setp_anzahl((prev=>{
            return prev-1
         }))
       }
     
       function plusclick(){
         setp_anzahl((prev=>{
            return prev+1
         }))
       }
 
     function pdz(){
         setgerendert('produkte')
    }
      
 
     //Shortcut Produkt zum Warenkorb hinzufügen
     function wkclick(wk){
         console.log("Produkt hinzufügen, bitte warten...")
         console.log(wk)
         setPKNr(wk)
         setwk((prev)=>{return prev+1})
 
         let input = {
             "first": "bestellung",
             "second": "produktInWarenkorb",
             "produktID": PKNr,
             "bestellmenge": p_anzahl
         }
         fetchapi('POST', input, "/kunde-functions"). then((res) =>{
             console.log(res.msg)
             if(res.data.status == true){
             console.log("Produkt dem Warenkorb hinzugefügt.")
             setperfect(res.data.msg)
         } else {
             setfehler(res.data.msg)
         }
         })
     }
 
     
     //Shortcut Produkt zur Wunschliste hinzufügen
     function wlclick(wl){
         console.log("Produkt hinzufügen, bitte warten...")
         console.log(wl)
         setPKNr(wl)
         setwl((prev)=>{return prev+1})
 
         let input = {
             "first": "produkt",
             "second": "produktInWunschliste",
             "produktID": PKNr
         }
         fetchapi('POST', input, "/kunde-functions"). then((res) =>{
             console.log(res.msg)
             if(res.data.msg == true) {
                 console.log("Produkt der Wunschliste hinzugefügt.")
                 setperfect(res.data.msg)
             } else {
                 setfehler(res.data.msg)
             }
         })
     }



    return ( 
          <div className='kunde'>
               <NavK profilclick={profilclick} psuche={suchenp} ssuche={suchens} keinergebnis={keinergebnis} logoclick={logoclick} abholscheineclick={abholscheineclick} rechnungenclick={rechnungenclick} rolle='Kunde' warenkorbklick={warenkorbclick} wunschlisteklick={wunschlisteclick} logoutclick={logoutclick}/>
               <div className='container'>
               {spiner && <Spiner/>}
               {gerendert === 'start' && 
               <div>
                    <KundeShops></KundeShops>
               </div>
               }
               {gerendert === 'profil' && 
               <div>
               <Card className='kundenProfil'>
               <div className='profilDaten'>
                    <h4>
                    Profil: <Badge bg="secondary"></Badge>
                    </h4>
                    {warning && <Alert key='warning' variant='warning' style={{textAlign:'center'}}>Ihre Daten werden erst gespeichert, wenn Sie auf "speichern" gedrückt haben!</Alert>}
                    {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                    {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>Ihre Daten wurden erfolgreich gespeichert.</Alert>}
                    <div className='buttons'>
                    {!profilbearbeitetButton && <Button variant="secondary" onClick={profilbearbeitenclick} style={{marginBottom:'3rem'}}>Bearbeiten</Button>}
                    {profilbearbeitetButton && <div><Button variant="primary" onClick={profilbearbeitenclick}  style={{marginBottom:'3rem',marginRight:'10px'}}>abbrechen</Button><Button variant="primary" onClick={abschickenbutton}  style={{marginBottom:'3rem'}}>speichern</Button></div>}
                    </div>  
                    <div className='profil'>
                    {!profilbearbeitetButton && <> <div className='links'>
                            <p className='data'>Name: <span className='data-wert'>{profildaten.name}</span></p>
                            <p className='data'>Vorname: <span className='data-wert'>{profildaten.vorname}</span></p>
                            <p className='data'>E-Mail Adresse: <span className='data-wert'>{profildaten.email}</span></p>
                            <p className='data'>Passwort: <br></br><span className='data-wert'>{profildaten.passwort}</span></p> 
                            <Button variant='info' onClick={profilz}>zurück</Button>
                        </div> </>}
                        {profilbearbeitetButton && <><div className='links'>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.name} onChange={datachange} name='name' placeholder='Name:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.vorname} onChange={datachange} name='vorname' placeholder='Vorname:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.passwort} type="password" onChange={datachange} name='passwort' placeholder='Neues Passwort:'/></InputGroup>
                        <InputGroup style={{marginBottom:'7px'}}><FormControl value={profildaten.neuespasswort} type="password" onChange={datachange} name='neuespasswort' placeholder='Passwort wiederholen:'/></InputGroup>
                        {fail && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fail}</Alert>}
                        {success && <Alert key='success' variant='success' style={{textAlign:'center'}}>{success}</Alert>}
                        </div>  
                         </>}  
                    </div>
                    </div>
                    </Card>
                </div>
               }
               {gerendert === 'warenkorb' &&
               <div>
                    <Warenkorb wkz={wkz}></Warenkorb>
               </div>
               }
               {gerendert === 'wunschliste' &&
               <div>
                    <Wunschliste wlz={wlz}></Wunschliste>
               </div>
               }
               {gerendert === 'abholschein' &&
               <div>
                    <AbholscheineK az={az}></AbholscheineK>
               </div>
               }
               {gerendert === 'rechnung' &&
               <div>
                    <RechnungenK rz={rz}></RechnungenK>
               </div>
               }
               {gerendert === 'keinergebnis' &&
                    <div>
                    <h5>{leer}</h5>
                    <Button variant='info' onClick={kz}>zurück</Button>
                    </div>
               }
               {gerendert === 'produktsuche' &&
               <div>
                    <h5>Suchergebnisse:</h5>
                         <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
                              {psuchdata.map((item)=>{
                                   return <ProduktK key={item.ProduktID} name={item.P_Name} preis={item.Preis} beschreibung={item.Beschreibung} bild={item.Bild} produktclick={()=>{produktclick(item.ProduktID)}} wkclick={()=>{wkclick(item.ProduktID)}} wlclick={()=>{wlclick(item.ProduktID)}}>              
                                   </ProduktK>
                              })}
                              {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
                              {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                         </div>
                         <Button variant='info' onClick={psz}>zurück</Button>
               </div>
               }
               {gerendert === 'shopsuche' &&
               <div>
                    <h5>Suchergebnisse: </h5>
                    <div className="shopsuche" style={{ cursor: 'pointer'}}>
                              {ssuchdata.map((item) => {
                                   return <Card className='shop'>
                                   <Card.Body>
                                   <Card.Title key={item.shopid} onClick={()=>{shopclick(item.shopid)}}>{item.shopname}</Card.Title>
                                   <Card.Text>{item.straße}</Card.Text>
                                   <Card.Text>{item.postleitzahl}</Card.Text>
                                   <Card.Text>{item.ortschaft}</Card.Text>
                                   <Card.Text>{item.land}</Card.Text>
                                   </Card.Body>
                                   </Card>
                              })}
                    </div>
                    <Button variant='info' onClick={ssz}>zurück</Button>
               </div>
               }
               {gerendert === 'produktdetail' &&
                    <div>
                    <Card className='produktdetailsCard'>
                        <div className='produktDetails'>
                    <h5>Produktdetails:</h5>
                    <p>{pdetails.ShopName}</p>
                    <div className='bild'>
                        <img variant="top" src={pdetails.Bild} alt='foto'/>
                    </div>
                    <div className='produktdetails'>
                        <h3>{pdetails.P_Name}</h3>
                        <h5>Preis: {pdetails.Preis}€</h5>
                        <p>Marke: {pdetails.Marke}</p>
                        <p>Material: {pdetails.Material}</p>
                        <p>Umsatzsteuer: {pdetails.Umsatzsteuer}%</p>
                        <p>Stückzahl: {pdetails.Stückzahl}</p>
                        <p>Beschreibung: {pdetails.Beschreibung}</p>
                    </div>
                    <div className='right-side'>
                    <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
                        <Card className='produktCard' >
                            <Card.Body>
                                <Card.Title>Preis: {pdetails.Preis}€</Card.Title>
                                <Card.Text>Menge: <div className='mengeAendern' style={{display:'flex',alignItems:'center', justifyContent:'center'}}>
                                <AiFillMinusCircle onClick={minusclick} style={{cursor:'pointer'}}></AiFillMinusCircle>
                                <h4 anzahl={p_anzahl}>{p_anzahl}</h4>
                                <AiFillPlusCircle onClick={plusclick} style={{cursor:'pointer'}}></AiFillPlusCircle> 
                                </div></Card.Text>
                                <Button className='warenkorbButton' variant='success' onClick={()=>{wkclick(pdetails.ProduktID)}}>In den Warenkorb</Button>
                                <Button variant='primary' onClick={()=>{wlclick(pdetails.ProduktID)}}>Auf die Wunschliste</Button>
                                {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
                                {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                            </Card.Body>
                        </Card>
                        </div>
                    </div>
                    </div>
                    </Card>
                    <Button className='zurückButton' variant='info' onClick={pdz}>Zurück</Button>
                </div>
               }


<div>
        {gerendert === 'shopdetails' &&
        <div>
            <Card className='shopdetail'>
            <div className="shopdetails">
            <p className="data">Shop-Name: <span className='data-wert-click' onClick={()=>{shopnameclick(shopdaten.ShopID)}} style={{cursor: 'pointer'}}>{shopdaten.shopname}</span></p>
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
            <Button variant='info' onClick={sdz}>zurück</Button>
        </div>
        }
        {gerendert === 'produktkategorien' &&
        <div>
            <Card className='produktkategorie'>
             <div className="produktkategorien" style={{style, cursor: 'pointer'}}>
            <h4>
            Produktkategorien: <Badge bg="secondary"></Badge>
            </h4>
            <p></p>
                <div className='produktkategorie-left-side'>
                {produktkategorie.map((item)=>{
                    return <Form key={item.P_KategorieID}>
                        <Row>
                            <Form.Group>
                                <Form.Label onClick={()=>{produktkategorieclick(item.P_KategorieID)}} style={{cursor: 'pointer'}}>{item.P_Kategoriename}</Form.Label>
                            </Form.Group>
                        </Row>
                    </Form>
                })}
                </div>
                <div className='produktkategorie-right-side'>
                    
                </div>
             </div> 
             </Card>
             <Button variant='info' onClick={pkz}>zurück</Button>
        </div>
        }
        {gerendert === 'produkte' &&
        <div>
            <Card className='produktAnzeige' >
            <div className='produktitem'>
            <h4>
            Produkte: <Badge bg="secondary"></Badge>
            </h4>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
            {produkte.map((item)=>{
                return <ProduktK key={item.ProduktID} name={item.P_Name} preis={item.Preis} beschreibung={item.Beschreibung} bild={item.Bild} produktclick={()=>{produktclick(item.ProduktID)}} wkclick={()=>{wkclick(item.ProduktID)}} wlclick={()=>{wlclick(item.ProduktID)}}>              
            </ProduktK>
            })}
            {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
            {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
            </div>
            </div>
            </Card>
            <Button variant='info' onClick={pz}>Zurück</Button>
        </div>
        }
        {gerendert === 'produktdetails' &&
        <div>
            <Card className='produktdetailsCard'>
                <div className='produktDetails'>
            <h5>Produktdetails:</h5>
            <p>{pdetails.ShopName}</p>
            <div className='bild'>
                <img variant="top" src={pdetails.Bild} alt='foto'/>
            </div>
            <div className='produktdetails'>
                <h3>{pdetails.P_Name}</h3>
                <h5>Preis: {pdetails.Preis}€</h5>
                <p>Marke: {pdetails.Marke}</p>
                <p>Material: {pdetails.Material}</p>
                <p>Umsatzsteuer: {pdetails.Umsatzsteuer}%</p>
                <p>Stückzahl: {pdetails.Stückzahl}</p>
                <p>Beschreibung: {pdetails.Beschreibung}</p>
            </div>
            <div className='right-side'>
            <div style={{display:'flex',alignItems:'center', justifyContent:'center',flexWrap: 'wrap'}}>
                <Card className='produktCard' >
                    <Card.Body>
                        <Card.Title>Preis: {pdetails.Preis}€</Card.Title>
                        <Card.Text>Menge: <div className='mengeAendern' style={{display:'flex',alignItems:'center', justifyContent:'center'}}>
                        <AiFillMinusCircle onClick={minusclick} style={{cursor:'pointer'}}></AiFillMinusCircle>
                        <h4>{p_anzahl}</h4>
                        <AiFillPlusCircle onClick={plusclick} style={{cursor:'pointer'}}></AiFillPlusCircle> 
                        </div></Card.Text>
                        <Button className='warenkorbButton' variant='success' onClick={()=>{wkclick(pdetails.ProduktID)}}>In den Warenkorb</Button>
                        <Button variant='primary' onClick={()=>{wlclick(pdetails.ProduktID)}}>Auf die Wunschliste</Button>
                        {perfect && <Alert key='success' variant='success' style={{textAlign:'center'}}>{perfect}</Alert>}
                        {fehler && <Alert key='danger' variant='danger' style={{textAlign:'center'}}>{fehler}</Alert>}
                    </Card.Body>
                </Card>
                </div>
            </div>
            </div>
            </Card>
            <Button className='zurückButton' variant='info' onClick={pdz}>Zurück</Button>
        </div>
        } </div>



                {section!== '' && <Section name={`${section}:`}> 
               </Section>}
          </div>
     </div>
     );
}

export default KundenPortal;
