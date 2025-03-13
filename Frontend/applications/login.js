export {userID as uID, loggedIn}
let loggedIn = false

const emailbox = document.getElementById("email")
const passwd = document.getElementById("password")
const submitbtn = document.getElementById("loginbtnsubmit")




submitbtn.addEventListener("click", async (e) =>{
    e.preventDefault()
    let txtemail = emailbox.value
    let txtpass = passwd.value
    await login(txtemail,txtpass)


})


async function login(email, passwd){
    let url = "http://127.0.0.1:5000/login"

    const jsonOBJ = 
    {
    email: email, 
    password: passwd}

    console.log(jsonOBJ)

    try{
        response = await fetch(url, {
            method: "POST",
            headers:{"Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(jsonOBJ)})
        if (!response.ok) {
            throw new Error(`Recieved an HTTP error. Status: ${response.status}`);
        }

        let data = await response.json()

        if (data.LoginStatus =="Failed"){
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