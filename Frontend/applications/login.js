let loggedIn = false

const emailbox = document.getElementById("email")
const passwd = document.getElementById("password")
const submitbtn = document.getElementById("loginbtnsubmit")
const logoutbtn = document.getElementById("logout")

console.log(logoutbtn)
window.addEventListener("DOMContentLoaded", function(){
    logoutbtn.addEventListener("click", async function(e){
        e.preventDefault()
        await logout()
    })

})


submitbtn.addEventListener("click", async (e) =>{
    e.preventDefault()
    let txtemail = emailbox.value
    let txtpass = passwd.value
    await login(txtemail,txtpass)
})

async function logout(){
    let url = "http://127.0.0.1:5000/logout"

    try{
        let response = await fetch(url, {method: "POST"})
        let data = await response.json()

        print(data)

        if (data.Success == true){
            alert("You have been logged out, thank you")
        }
    }
    catch (error){
        console.log(error)
    }

}


async function login(email, passwd){
    let url = "http://127.0.0.1:5000/login"

    const jsonOBJ = 
    {
    email: email, 
    password: passwd
    }

    console.log(jsonOBJ)

    try{
        response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers:{"Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    'Access-Control-Allow-Headers': "*",
                    'Access-Control-Allow-Methods': "*"

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
    
            localStorage.setItem("IDnum", data.userID)
            let userID = data.UserID
            
            return userID
        }

    } catch(error){console.log(error)}
}