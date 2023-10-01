import React, { useState, useEffect } from 'react';
import { Form, Button, Row } from 'react-bootstrap';
import fetchapi from '../../module/fetchapi';
import ProduktHM from '../ProduktHM';
import Alert from 'react-bootstrap/Alert';
import Spinner from '../Spiner';
import {FormControl, TextField } from '@mui/material'



function SortimentH() {
  const [catalogues, setCatalogues] = useState([]);
  const [xx, setxx] = useState(0)

  const [products, setProducts] = useState([]);
  const [produkthinzufügenbuttom, setprodukthinzufügenbuttom] = useState(false)
  const [addProduct, setAddProduct] = useState({P_Name: '',Stückzahl: '',Preis: '',Beschreibung: '',Umsatzsteuer: '',Material: '',Marke: '',Kategoriename:'', Bild:''});


  const [searchTerm, setSearchTerm] = useState('');
  const [spiner, setspiner] = useState(false);

  const [Kbearbeitungclick, setKbearbeitungclick] = useState(false)
  const [neueK, setneueK] = useState('')
  const [fehlerK, setfehlerK] = useState('')
  const [okK, setok] = useState('')

  const [fehlerph, setfehlerph] = useState('')
  const [okph, setokph] = useState('')

  const [fehlerKb, setfehlerKb] = useState('')
  const [okb, setokb] = useState('')

  const [gesuchteprudukte, setgesuchtprudukte] = useState([])
  const [gesuchteanzeigen, setgesuchteanzigen] = useState(false)

  const [fehleraa, setfehleraa] = useState('')
  const [okaa, setokaa] = useState('')


  const handleChangeadd_P = event => {

    const target = event.target;
    if(target.type === 'file'){
        const file = target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function() {
            const base64Image = reader.result;
            setAddProduct({...addProduct, Bild:base64Image});
        };
    }else{
        const value = target.value;
        const name = target.name;
        setAddProduct({ ...addProduct, [name]: value });
    }
  }

  const handleSubmitaddProduct = event => {
    event.preventDefault();
    console.log(addProduct)
    let input={
      "first": "mitarbeiter",
      "second": "produktAnlegen",
      data:addProduct
    }
    setspiner(true)
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          console.log(res)
          setokph(res.data.msg)
        }else{
          setfehlerph(res.data.msg)
        }
    }else{
        setfehlerph('Ein Fehler ist aufgetreten!')
    }
    setspiner(false)
    })
  }
 


  function K_Anzeigen(){
    let input={
      "first": "mitarbeiter",
      "second": "produktkategorieneinsehen"  
    }
    setspiner(true)
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      setCatalogues(res.data.data)
      setspiner(false)
    })
  }

  useEffect(()=>{
    K_Anzeigen()
  },[])

  function handleCatalogueEdit(catalogueId) {
    setxx(0)
    setfehlerK('')
    setfehelrpp('')
    setokpp('')
    setfehlerKb('')
    setfehlerK('')
    setok('')
    setprodukthinzufügenbuttom(false)
    console.log(catalogueId)
    let input={
      "first": "mitarbeiter",
      "second": "produkteeinsehen",
      p_KategorieID:catalogueId
    }
    setspiner(true)
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      console.log(res.data.data)
      setProducts(res.data.data)
      setspiner(false)
    })
  }

  function handleProductAdd() {
    setprodukthinzufügenbuttom((prev)=>{
      return !prev;
    })
  }

  const [fehelrpp, setfehelrpp] = useState('');
  const [okpp, setokpp] = useState('');

  const feher = (data) => {
    console.log(data)
    setfehleraa(data)
  };

  const ok = (data) => {
    console.log(data)
    setokaa(data)
  };

  function handleProductsuche(){
    setxx(1)
    setfehlerK('')
    setok('')
    setgesuchteanzigen(false)
    console.log(searchTerm)
    const input={
      "first": "mitarbeiter",
      "second": "produktsuche",
       'suchfeld': searchTerm
    }
    fetchapi('POST',input, '/mitarbeiter-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          setgesuchtprudukte(res.data.data)
          if(res.data.data.length>= 1){
            setgesuchteanzigen(true)
            setokpp(res.data.msg)
          }
        }else{
          setfehelrpp(res.data.msg)
        }
      }else{
        setfehelrpp('Einfehelr ist aufgetreten !!')
      }
    })
  }

  function handleSearchChange(event) {
    setfehlerK('')
    setok('')
    setfehelrpp('')
    setokpp('')
    setSearchTerm(event.target.value);
  }

  function katalogieanlegen(){
    let input ={
      first: 'sortiment',
      second: 'Produktkategorieanlegen',
      name: neueK
    }
    setspiner(true)
    fetchapi('POST',input, '/haendler-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          setspiner(false)
          setfehlerK('')
          setok(res.data.msg)
          // hier muss nochmal den ganzen katalogen aus DB gefetcht werden.
        }else{
          setspiner(false)
          setok('')
          setfehlerK(res.data.msg)
        }
      }else{
        setspiner(false)
        setfehlerK('Einfehler ist aufgetreten!')
      }
      setneueK('')
      K_Anzeigen()
    })
  }

  function kbuttomclick(){
    setKbearbeitungclick((prev)=>{
      return !prev;
    })
  }


  function kataloglöschen(x){
    let input={
      first: 'sortiment',
      second: 'Produktkategorieloeschen',
      name: x
    }
    setspiner(true)
    fetchapi('POST',input, '/haendler-functions').then((res)=>{
      if(res.status){
        if(res.data.status){
          setspiner(false)
          setfehlerKb('')
          setokb(res.data.msg)
          // hier muss nochmal den ganzen katalogen aus DB gefetcht werden.
        }else{
          setspiner(false)
          setokb('')
          setfehlerKb(res.data.msg)
        }
      }else{
        setspiner(false)
        setfehlerKb('Einfehler ist aufgetreten!')
      }
      K_Anzeigen()
    })
  }
   console.log(gesuchteprudukte)
  return (
          <div className="container-fluid">
            {spiner && <Spinner />}
            <div className="row">
            <div className="col-md-4">
            {/* Left column */}
            {!Kbearbeitungclick && <div><Button variant="primary" style={{marginBottom:'10px'}} onClick={kbuttomclick}>Kategorie bearbeiten</Button>
            <ul className='listkataloge'>
              {catalogues.map(catalogue => (
                <li key={catalogue.P_KategorieID} onClick={() => handleCatalogueEdit(catalogue.P_KategorieID)}>{catalogue.P_Kategoriename}</li>
              ))}
            </ul> </div>}
            {Kbearbeitungclick && <div>
              <Button variant="primary" style={{marginBottom:'10px'}} onClick={kbuttomclick}>Zurück</Button>
              {okb && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okb}</Alert>}
              {fehlerKb && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehlerKb}</Alert>}
              <ul style={{ listStyle: 'none' }}>
                {catalogues.map((catalogue) => (
                  <li key={catalogue.P_KategorieID} style={{display:'flex', justifyContent:'space-between', alignItems:'center', fontWeight:500}}>
                    {catalogue.P_Kategoriename}
                    <Button variant="danger" onClick={()=>{kataloglöschen(catalogue.P_Kategoriename)}}>Löschen</Button>
                  </li>
                ))}
              </ul>
              </div>}
        <div className='neuesKategorie'>
            <p style={{fontWeight:500, marginTop:'2rem', marginBottom:'0'}}>Wollen Sie eine neue Kategorie hinzufügen?</p>
            <input type="text" placeholder="Neue Kategorie" value={neueK} onChange={(event)=>{setneueK(event.target.value)
            setok('')
            setfehlerK('')}} className="form-control" />
            <button type="button" className="btn btn-primary" onClick={katalogieanlegen}>Anlegen</button>
            {okK && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okK}</Alert>}
            {fehlerK && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehlerK}</Alert>}    
        </div>
      </div>
        <div className="col-md-8">
          {/* Right column */}
          <div className="row">
            <div className="col-md-12" style={{display:'flex', flexDirection:'column'}}>
            {okaa !=='' && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okaa}</Alert>}
            {fehleraa !=='' && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehleraa}</Alert>}
             {fehelrpp !== "" && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehelrpp}</Alert>}
             {okpp && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px', marginTop:'2rem'}}>{okpp}</Alert>}
             <FormControl className="my-2" fullWidth>
                     <TextField label="Produkt ...." type="text" variant="outlined" name='passwort' value={searchTerm} onChange={handleSearchChange} />
                  </FormControl>
                  <Button variant="primary" onClick={handleProductsuche}>Suchen</Button>
            </div>
            <div className="col-md-12" style={{ textAlign: 'center' }}>
                  <Button variant="success" onClick={handleProductAdd} style={{marginTop:'5px'}}>{!produkthinzufügenbuttom ? 'Produkt hinzufügen' : 'Zurück'}</Button>
            </div>
           </div>


           {xx === 1 && <><div className="row" style={{ marginTop: '30px', justifyContent: 'center' }}>
              {gesuchteanzeigen && <h4>Ihre Suche ergab folgendes: </h4>}
              {gesuchteanzeigen &&
                gesuchteprudukte.map((x) => {
                  return <ProduktHM key={x.ProduktID} id={x.ProduktID} menge={x.Stückzahl} name={x.P_Name} preis={x.Preis} b={x.Beschreibung} bild={x.Bild} fehler={feher} ok={ok}/>;
                })   
              }
              </div></>}


           {produkthinzufügenbuttom ?  <div className='row' style={{ marginTop: '30px' }}>
           {okph && <Alert key='success' variant='success' style={{textAlign:'center', padding:'5px'}}>{okph}</Alert>}
              {fehlerph && <Alert key='danger' variant='danger' style={{textAlign:'center', padding:'5px'}}>{fehlerph}</Alert>}
           <Form onSubmit={handleSubmitaddProduct}>
           <Row style={{marginTop:'10px'}}>
      <Form.Group className="col-6">
        <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="P_Name" value={addProduct.P_Name}onChange={handleChangeadd_P}
        />
      </Form.Group>
      <Form.Group className="col-6">
        <Form.Label>Menge</Form.Label>
        <Form.Control type="number" name="Stückzahl" value={addProduct.Stückzahl} onChange={handleChangeadd_P}
        />
      </Form.Group>
      </Row>
      <Row style={{marginTop:'15px'}}>
      <Form.Group className="col-6">
        <Form.Label>Preis</Form.Label>
        <Form.Control type="number" name="Preis" value={addProduct.Preis} onChange={handleChangeadd_P}
        />
      </Form.Group>
      <Form.Group className="col-6">
        <Form.Label>Steuer</Form.Label>
        <Form.Control type="number" name="Umsatzsteuer" value={addProduct.Umsatzsteuer} onChange={handleChangeadd_P}
        />
      </Form.Group>
      </Row>
      <Form.Group style={{marginTop:'15px'}}>
        <Form.Label>Beschreibung</Form.Label>
        <Form.Control type="text" name="Beschreibung" value={addProduct.Beschreibung} onChange={handleChangeadd_P}
        />
      </Form.Group>
      <Row style={{marginTop:'15px'}}>
      <Form.Group className="col-6">
        <Form.Label>Material</Form.Label>
        <Form.Control type="text" name="Material" value={addProduct.Material} onChange={handleChangeadd_P}
        />
      </Form.Group>
      <Form.Group className="col-6">
        <Form.Label>Marke</Form.Label>
        <Form.Control type="text" name="Marke" value={addProduct.Marke} onChange={handleChangeadd_P}
        />
      </Form.Group>
      </Row>
      <Row style={{marginTop:'15px'}}>
      <Form.Group className="col-6">
        <Form.Label>Kategoriename</Form.Label>
        <Form.Control type="text" name="Kategoriename" value={addProduct.Kategoriename} onChange={handleChangeadd_P}
        />
      </Form.Group>
      <Form.Group className="col-6">
        <Form.Label>Produktbild</Form.Label>
        <Form.Control type="file" name="P_Bild" onChange={handleChangeadd_P}
        />
      </Form.Group>
      </Row>
      <Button variant="primary" type="submit">
        Speichern
      </Button>
    </Form>
          </div> : xx ===0 && <div className="row" style={{ marginTop: '30px', justifyContent: 'center' }}>
              {products.map((x) => {
                return <ProduktHM key={x.ProduktID} id={x.ProduktID}  menge={x.Stückzahl} name={x.P_Name} preis={x.Preis} b={x.Beschreibung} bild={x.Bild} fehler={feher} ok={ok}/>;
              })}
            </div>}
        </div>
      </div>
    </div>
  )
}

export default SortimentH