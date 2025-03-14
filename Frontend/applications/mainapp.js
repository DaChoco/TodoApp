
const maxRetries = 3 //this is meant for the occasional client/network errors

//Main javascript work? Complete

window.addEventListener("DOMContentLoaded", async function(){
    const lightdark = this.document.querySelector(".fa-sun")
    const body = this.document.querySelector("body")

    lightdark.addEventListener("click", function(){
        body.classList.toggle("dark-mode")
    })
    const logoutbtn = this.document.getElementById("logout")
    const todobox = document.getElementById("todocont")
    const addbar = document.getElementById("additem")
    const addbtn = document.getElementById("addbtn")
    const {current_userID, current_uuid, current_fname} = await getUser()
    let arrayIDs = await fetchTodos(current_userID)
    const deletebtns = document.querySelectorAll(".fa-trash")
    const deleterowcontent = document.querySelectorAll(".todo-item")
    const maincontent = this.document.querySelectorAll(".todotxt")
    const checkboxes = document.querySelectorAll(".chkchk")
    const userintro = this.document.getElementById("userintro")

    if (!current_userID){
        this.alert("You are not currently signed in. You will need to sign in")
    }
    
    userintro.textContent = `${current_fname}'s TODO APP`

    logoutbtn.addEventListener("click", async function(){
        await logout()
    })

    deletebtns.forEach((del,index) => {
        del.addEventListener('click', async function(){
            arrayIDs = await deleteTodo(arrayIDs[index])
            console.log(deleterowcontent[index])
            deleterowcontent[index].remove()
        }) 
    })

    checkboxes.forEach((chk, index) =>{
        chk.addEventListener("click", function(){
            console.log("checked")
            console.log(maincontent[index])

            if (chk.checked == true){
                maincontent[index].style.textDecoration = "line-through"
                maincontent[index].style.color = '#bebdbd'
            }
            else if (chk.checked == false){
                maincontent[index].style.textDecoration = "none"
                maincontent[index].style.color = '#2e2d29'

            }
            

            localStorage.setItem("checkliststate", chk.checked)
            
        })
    })

    maincontent.forEach((txt, index) =>{
        txt.addEventListener("keypress", async function(event){
            if (event.key == "Enter"){
                console.log("Shine on")
                document.querySelectorAll('.todotxt br').forEach(br => br.remove())
                txt.blur();
                newItem = txt.textContent
                await updateTodo(newItem, arrayIDs[index])
                
            }
        })
    })

    addbtn.addEventListener("click", async function(){
        const categ = document.getElementById("todocat")
        let choice = categ.options[categ.selectedIndex].value
        await newTodo(addbar.value, choice, current_userID)
        arrayIDs = await fetchTodos(current_userID)
        addbar.value = ""
    
    })

    async function deleteTodo(todoID){
        let url = `http://127.0.0.1:5000/delete/${todoID}`
        let arrayIDs = []
    
        try{
            let response = await fetch(url, {method: "DELETE"})
            let data = await response.json()
            console.log(data)
    
            if (data.Success == false){
                alert("Todo deletion has failed due to the following: ", data.Message)
            }
            else if (data.Success == true)
                alert("Todo deleted successfully")
                arrayIDs = await fetchTodos(current_userID)
                return arrayIDs
        }
        catch (error){console.log("Error deleting the todo: ", error)}
    
    }

    async function getUser(){
        try{
            let response = await fetch('http://127.0.0.1:5000/getuser', {method: 'POST', credentials: "include"})
            let data = await response.json()
            console.log(data[0])
    
            const current_userID = data[0].userID;
            const current_uuid = data[0].id;
            const current_fname = data[0].uFirstName
            console.log(current_fname)
    
            return {current_userID, current_uuid, current_fname};
        }
        catch (error){console.log("Error: ", error)}
        
        
    }
    
    async function fetchTodos(){
        let url = `http://127.0.0.1:5000/gettasks`
    
        try{
            let response = await fetch(url, {method: "POST", credentials: "include"})
            let data = await response.json()
            console.log(data)
            let addingTodo = ""
            todobox.innerHTML = ""
    
            let fetchingContent = []
            for (let i = 0; i<data.length; i++){
                fetchingContent.push( `
                    <div class="todo-item">
                        <input type="checkbox" value="checked" class="chkchk"></input>
                        <div class="list-nums"><span>${i+1}</span></div>
                        <div class="todo-content">
                            <span contenteditable="True" class="todotxt">${data[i].content}</span>
                            <span>| ${data[i].category}</span>
                        </div>
                    <i class="fa-solid fa-trash delete-icon"></i>
                    
                    </div>`)
                addingTodo
        
            }
            todobox.insertAdjacentHTML("beforeend", fetchingContent.join(""))
    
            let arrayID = []
    
            for (let i = 0; i<data.length;i++){
                arrayID[i] = data[i].id
            }
            return arrayID
    
        }
        catch (error){console.log("Error: ", error)}
    }

    async function logout(){
        let url = "http://127.0.0.1:5000/logout"

        try{
            let response = await fetch(url, {method: "POST", credentials: "include"})
            let data = response.json()

            if (data.Success === true){
                alert("You have been logged out, thank you")
            }
        }
        catch (error){
            console.log(error)
        }

    }
    
    async function newTodo(content, category){
        let backendurl = `http://127.0.0.1:5000/sendtasks`
    
        let completeurl = `${backendurl}?con=${encodeURIComponent(content)}&cat=${encodeURIComponent(category)}`
        try{
            let response = await fetch(completeurl,{method: "POST", credentials: "include"})
            let data = await response.json()
            console.log(data)
            return JSON.stringify(data)
        }
        catch (error){
            console.log(`An error has occured: ${error}`)
        }
        
    
    }

    async function updateTodo(newContent, ID){
        let backendurl = `http://127.0.0.1:5000/update/${ID}`

        let completeurl = `${backendurl}?ed=${encodeURIComponent(newContent)}`

        try{
            let response = await fetch(completeurl, {method: 'PUT'})
            let data = await response.json()
            console.log(data)

            if (data.success = true){
                alert("Todo has been updated")
            }
            else{
                alert(f`Todo has failed to update due to the following error: ${e}`)
            }
        }
        catch (error){
            console.log(error)
        }

    }

   
}, {once: true})




