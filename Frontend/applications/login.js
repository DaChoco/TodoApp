const loggedIn = false
async function login(email, passwd){
    let url = "http://127.0.0.1:5000/login"

    const jsonOBJ = 
    {
    email: email, 
    password: passwd}

    try{
        response = await fetch(url, {
            method: "POST",
            headers:{"Content-Type": "application/json"},
            body: JSON.stringify(jsonOBJ)})
        if (!response.ok) {
            throw new Error(`Recieved an HTTP error. Status: ${response.status}`);
        }

        let data = await response.json()

        if (data.LoginStatus ==="Failed"){
            alert(data.Message)
        }
        else{
            alert(data.Message)
            loggedIn = data.LoggedIn
    
            localStorage.setItem("IDnum", data.UserID)
            let userID = data.UserID
            return userID
        }

    } catch(error){console.log(error)}
}