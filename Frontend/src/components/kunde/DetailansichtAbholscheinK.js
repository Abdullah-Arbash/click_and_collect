import React, { useEffect, useState } from "react";
import { Card, Form, Table } from "react-bootstrap";
import fetchapi from "../../module/fetchapi";
import '../../css/abholschein.css'
import ProduktK from "./ProduktK";
import Offnungzeiten from "../Offnungzeiten";

function DetailansichtAbholschein (){

    const [profildaten, setprofildaten] = useState({name:'', vorname:''});
    const [fehler, setfehler] = useState('');
    const [spiner, setspiner] = useState(false);
    const [produkte, setprodukte] = useState([]);
    const [opentime, setopentime] = useState([]);
    const [bestellinfos, setbestellinfos] = useState({abholnummer:'', datum:'', tag:'', uhrzeit:'', gesamtkosten:''});
    const [shopdaten, setshopdaten] = useState({shopname:'', shopkategorie:'', shopemail:'', telefonnummer:'', oeffnungszeiten:{mo:{von:'',bis:''},di:{von:'',bis:''},mi:{von:'',bis:''},do:{von:'',bis:''},
    fr:{von:'', bis:''},sa:{von:'',bis:''},so:{von:'',bis:''}}, adresse:{straße:'', postleitzahl:'', ortschaft:'', land:''}});

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

    // Produkte
    function produkteAnzeigen(){
        console.log("Produkte ausgegeben.")
        
        let input = {
            "first": "auftrag",
            "second": "abholungEinsehen"
        }
        fetchapi('POST', input, '/kunde-functions').then((res) =>{
            setprodukte(res.data.data)
            console.log(res.data.data)
        })
    }

    useEffect(()=>{
            console.log('Produkte ausgegeben.')
            produkteAnzeigen()
    },[])

    // Shopdetails
    function shopdetailsanzeigen(){
        console.log('Shopdetails ausgegeben.')
        let input = {
            "first": "auftrag",
            "second": "abholungEinsehen"
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
        console.log('Shopdetails ausgegeben.')
        shopdetailsanzeigen()
    },[])

    // Bestellinfos
    function Bestellinfos(){
        console.log('bestellinfos ausgeben')
        setspiner(true)
        let input = {
            "first": "auftrag",
            "second": "abholungEinsehen"
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
        Bestellinfos()
    },[])


    return(
        <div className="container">
            <div className="leftside">
            <div className="kundenname">
                <p className='data'><span className='data-wert'>{profildaten.vorname}, {profildaten.name}</span></p>
            </div>
            <div className="bestellinfos">
                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                            <th>Abholnummer</th>
                            <th>Datum</th>
                            <th>Tag</th>
                            <th>Uhrzeit</th>
                            <th>Gesamtkosten</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{bestellinfos.abholnummer}</td>
                            <td>{bestellinfos.datum}</td>
                            <td>{bestellinfos.tag}</td>
                            <td>{bestellinfos.uhrzeit}</td>
                            <td>{bestellinfos.gesamtkosten}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
            <div className="produktinfos">
                {produkte.map((item)=>{
                    return <Card key={item.ProduktID}>
                        <img variant="top" src={item.bild} alt='foto' />
                        <Card.Body>
                            <Card.Title style={{fontWeight:800}}>{item.P_Name}</Card.Title>
                            <Card.Text style={{fontWeight:500}}>€{item.Preis}</Card.Text>
                            <Card.Text>{item.Bestellmenge}</Card.Text>    
                      </Card.Body>
                	</Card>
                })}
            </div>
            </div>
            <div className="rightside">
                <div className="bezahlinfos">
                    <p>Die Bezahlung findet vor Ort statt.</p>
                    <Form.Group className="mb-3" controlId="formBasicCheckbox">
                        <Form.Check type="checkbox" label="Bezahlung ausstehend"/>
                    </Form.Group>
                </div>
                <div className="impressum">
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
            </div>
        </div>
    )
}

export default DetailansichtAbholschein;