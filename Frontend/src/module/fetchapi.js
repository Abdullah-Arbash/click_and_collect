const fetchapi = async (methode ,inpot, api)=>{
    const output={
      status:true,
      msg:'',
      data:{}
    }
    const optional={
      method: methode,
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Token': window.localStorage.getItem("session_token") ?? ""
      },
      credentials: "same-origin",
      body:JSON.stringify(inpot)
    }


  try{
    const response = await fetch(`http://localhost:5000${api}`, optional)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Save token to localStorage
    const newToken = response.headers.get("X-New-Session-Token")
    if ( newToken ) {
      localStorage.setItem("session_token", newToken);
      console.log("New Token Stored.")
    }
    output.status=true;
    output.data=data;
    return output;
  }
  catch(err){
    output.status=false;
    output.msg=err;
    return output
  }
}

export default fetchapi;


/*async function getResponse() {
	const response = await fetch(
		'https://carbonfootprint1.p.rapidapi.com/CarbonFootprintFromCarTravel?distance=100&vehicle=SmallDieselCar',
		{
			method: 'GET',
			headers: {
				'x-rapidapi-host': 'carbonfootprint1.p.rapidapi.com',
				'x-rapidapi-key': 'your_api_key'
			}
		}
	);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const data = await response.json();
} */

/*
 .then(handleErrors)
        .then((response) => response.json())
        .catch((err)=>{
          output.status=false;
          output.msg='Ein fehler ist aufgetreten, bitte versuchen Sie später';
        })
        .then((data) =>{
          output.status=true;
          output.data=data;
        })
        return output;
*/