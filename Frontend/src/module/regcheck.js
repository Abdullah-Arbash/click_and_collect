import EmailValidator from 'email-validator';

const regcheck =(x)=>{
    const outpot = {
        status:true,
        fehler: '',
    }
  if(x.rolle==='kunde'){
    if(x.name==='' || x.vorname ==='' || x.email ==='' ||x.passwort===''){
        outpot.status=false
        outpot.fehler='eingaben'
        return outpot;
    }
    else{
        if(!EmailValidator.validate(x.email)){
        outpot.status=false
        outpot.fehler='email'
        return outpot;
        }else{
        outpot.status=true
        return outpot;
        }
    }
  }else{
    if(x.name==='' || x.vorname ==='' || x.email ==='' ||x.passwort===''||x.geschaeftsname===''||x.stasseNr===''||x.ortschaft===''||x.postleitzahl===''||x.land===''||x.tel===''||x.umsatzsteuerID===''||x.impEmail===''){
        outpot.status=false
        outpot.fehler='eingaben'
        return outpot;
    }else{
        if(!EmailValidator.validate(x.email)){
        outpot.status=false
        outpot.fehler='email'
        return outpot;
        }else{
        outpot.status=true
        return outpot;
        }
        
    }
  }  
}

export default regcheck;