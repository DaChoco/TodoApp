



window.addEventListener("DOMContentLoaded", function(){
    const emailbox = document.getElementById("email")
    const fname = document.getElementById("fname")
    const lname = document.getElementById("lname")
    const passwd1 = document.getElementById("password1")
    const passwd2 = document.getElementById("password2")
    const submitbtn = document.getElementById("loginbtnsubmit")
    const logoutbtn = document.getElementById("logout")

    logoutbtn.addEventListener("click", async function(){
        await logout()
    })

    submitbtn.addEventListener("click", async function(e){
        e.preventDefault()
        console.log(fname)
        let txtname = fname.value
        let txtsurname = lname.value
        let txtmail = emailbox.value
        let txtpasswd1 = passwd1.value
        let txtpasswd2 = passwd2.value
    
        console.log(txtname)

        await register(txtname, txtsurname, txtmail, txtpasswd1, txtpasswd2)
     
    })

})

async function logout(){
    let url = "http://127.0.0.1:5000/logout"

    try{
        let response = await fetch(url, {method: "POST"})
        let data = await response.json()

        

        if (data.Success == true){
            alert("You have been logged out, thank you")
        }
    }
    catch (error){
        console.log(error)
    }

}

async function register(fname, lname, email, passwd1, passwd2){
    let url = 'http://127.0.0.1:5000/register'

    const jsonOBJ = {
        firstname: fname,
        lastname: lname,
        mail: email,
        passwordfirst: passwd1,
        passwordsecond: passwd2
    }

    console.log(fname)
    try{
        let response = await fetch(url, {
            method: 'POST',
            credentials: "include",
            body: JSON.stringify(jsonOBJ),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                'Access-Control-Allow-Headers': "*",
                'Access-Control-Allow-Methods': "*"
                    }
        })

        if (!response.ok) {
            throw new Error(`Recieved an HTTP error. Status: ${response.status}`);
        }
        let data = await response.json()

        console.log(data)

        if (data.Success == true){
            alert(data.Message)
            window.location.replace('http://127.0.0.1:3000/Frontend/index.html')
        }
        else{
            console.log(data.Message)
        }

    } catch (error){
        console.log("We have encountered an unexpected error")
    }

}