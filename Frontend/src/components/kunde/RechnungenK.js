import React, { useContext, useEffect, useState } from "react";
import fetchapi from "../../module/fetchapi";
import { Badge, Button, Card, Form, Table } from "react-bootstrap";
import '../../css/kunde.css';
import ProduktK from "./ProduktK";
import Offnungzeiten from "../Offnungzeiten";
import { sectionContact } from "../../Contect";
import Section from "../Section";
import { BsCheckSquare, BsCheckSquareFill, BsDownload } from "react-icons/bs";
import jsPDF from "jspdf";

function RechnungenK (props) {

    const [gerendert, setgerendert] = useState('rechnung');

    const [rechnungsdaten, setrechnungsdaten] = useState([]);
    const [profildaten, setprofildaten] = useState({name:'', vorname:''});
    const [fehler, setfehler] = useState('');
    const [spiner, setspiner] = useState(false);
    const [abholscheindrop, setabholscheindrop] = useState(false);
    const [a, seta] = useState(1);
    const [s, sets] = useState(1);
    const [auftragid, setauftragid] = useState(null);
    const [shopid, setshopid] = useState(null)
    const {section, setsection} = useContext(sectionContact);

    //Rechnungsdetails
    const [produkte, setprodukte] = useState([]);
    const [opentime, setopentime] = useState([]);
    const [bestellinfos, setbestellinfos] = useState({Abholnummer:'', Datum:'', Tag:'', Slot:'', Gesamtkosten:'', MitarbeiterName:'', MitarbeiterVorName:''});
    const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}});

    // Bild
    const imgStyle = {
        width: '100%',
        marginTop:'10px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px 10px 0px 0px'
      };

    // Name, Vorname des Kunden
    function Kundenname(){
        console.log('Name, Vorname ausgeben')
        setspiner(true)
        fetchapi('POST', {}, '/view-profile').then((res) =>{
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

    useEffect(()=>{
        Kundenname()
    },[])

    // Rechnungen
    function rechnungenAnzeigen() {
        let input = {
            "first": "auftrag",
            "second": "rechnungenEinsehen"
        }
        console.log('Rechnungen ausgegeben.')
        fetchapi('POST', input, '/kunde-functions').then((res)=>{
            setrechnungsdaten(res.data.data)
             console.log(res.data.data)
        })
   }
   

   useEffect(()=>{
        rechnungenAnzeigen()
   },[])


   // Rechnungsdetails
   function abholscheinclick(a,s){setabholscheindrop((prev) => {return !prev})
   console.log(a)
   console.log(s)
   setauftragid(a)
   setshopid(s) 
   abholscheinAnzeigen()
   shopdetailsanzeigen()
   Bestellinfos()
   setgerendert('rechnungsdetails')
   seta((prev)=>{return prev+1})
   sets((prev)=>{return prev+1})
}

function rdz(){
    setgerendert('rechnung')
}

// Produkte
function abholscheinAnzeigen(){
console.log("Abholscheindetails ausgeben...")

let input = {
   "first": "auftrag",
   "second": "rechnungEinsehen",
   "auftragID": auftragid
}
fetchapi('POST', input, '/kunde-functions').then((res) =>{
   console.log(res.data.data)
   setprodukte(res.data.data)       
})
}

useEffect(()=>{
if(a>1){
   console.log('Abholscheindetails ausgegeben.')
   abholscheinAnzeigen()
}
},[a])

// Shopdetails
function shopdetailsanzeigen(){
console.log('Shopdetails ausgeben...')
let input = {
   "first": "shops",
   "second": "shopNachShopID",
   "shopID": shopid
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
    if(s>1){
        console.log('Shopdetails ausgegeben.')
        shopdetailsanzeigen()
    }
},[s])

// Bestellinfos
function Bestellinfos(){
console.log('Bestellinfos ausgeben...')
setspiner(true)
let input = {
   "first": "auftrag",
   "second": "rechnungEinsehen",
   "auftragID": auftragid
}
fetchapi('POST', input, '/kunde-functions').then((res) =>{
   if(res.status){
       if(res.data.status){
         setspiner(false)
         setfehler('')
         console.log(res)
         console.log(res.data.details)
         setbestellinfos(res.data.details)
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

useEffect(()=>{
if(a>1){
   console.log('Bestellinfos ausgegeben.')
   Bestellinfos()
}
},[a])

function downloadclick (){
    const pdf = new jsPDF();

    pdf.autoTable({
        head: [['Abholnummer', 'Datum', 'Tag', 'Slot', 'Gesamtkosten']],
        body: [[`${bestellinfos.Abholnummer}`,`${bestellinfos.Datum}`,`${bestellinfos.Tag}`,`${bestellinfos.Slot}`,`${bestellinfos.Gesamtkosten}`]],
    });

    pdf.save(`${profildaten.vorname}, ${profildaten.name}`);
}

    return (
        <div>
        {gerendert === 'rechnung' &&
        <div className="kundenname">
        <Card className='rechnungCard' >
        <div className="rechnungen">
        <h4>
        Rechnungen: <Badge bg="secondary"></Badge>
        </h4>
        <h4 className='data'><span className='data-wert'>{profildaten.vorname}, {profildaten.name}</span></h4>
        {rechnungsdaten.map((item) => {
            return <Table striped bordered hover key={item.Abholnummer}>
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Shop</th>
                </tr>
            </thead>
            <tbody onClick={()=>{abholscheinclick(item.Abholnummer, item.ShopID)}} style={{cursor: 'pointer'}}>
                <tr>
                    <td>{item.Datum}</td>
                    <td>{item.Shop}</td>
                </tr>
            </tbody>
        </Table>;
        })}
        </div>
        </Card>
        <Button variant="info" onClick={props.rz}>zurück</Button>
        </div>
        }
        {gerendert === 'rechnungsdetails' &&              
            <div className="abholscheindetails">
            <Card className='rechnung'>
            <div className="rechnungInhalt">
            <div className="leftside">
            <div className="kundenname">
                <p className='data'><span className='data-wert'>{profildaten.vorname}, {profildaten.name}</span></p>
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
                            <td>{bestellinfos.Abholnummer}</td>
                            <td>{bestellinfos.Datum}</td>
                            <td>{bestellinfos.Tag}</td>
                            <td>{bestellinfos.Slot}</td>
                            <td>€ {bestellinfos.Gesamtkosten}</td>
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
                    <p>Bearbeiter: {bestellinfos.MitarbeiterVorName} {bestellinfos.MitarbeiterName}</p>
                    <div className="checksquare">
                    <BsCheckSquareFill style={{color:'green', fontSize:'21px', marginRight: '0.5rem'}}></BsCheckSquareFill> 
                    <p>Bezahlung abgeschlossen</p>
                </div>
                <div className="download"><BsDownload style={{color:'black', fontSize:'26px', marginRight: '0.5rem', cursor:'pointer'}} onClick={downloadclick}></BsDownload></div>
                </div>
                <Card className='impressum'>
                <div className="container-fluid">
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
            </div>
            </Card>

            <Button variant='info' onClick={rdz}>zurück</Button>
        </div>
        }
        </div>
        )
}

export default RechnungenK;