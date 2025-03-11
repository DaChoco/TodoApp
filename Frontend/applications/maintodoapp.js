const todobox = document.getElementById("todocont")
const addbar = document.getElementById("additem")
const addbtn = document.getElementById("addbtn")

//Main javascript work? Complete

window.addEventListener("load", async function(){
    const {current_userID, current_uuid} = await getUser()
    let arrayIDs = await fetchTodos(current_userID)
    const deletebtns = document.querySelectorAll(".fa-trash")
    const deleterowcontent = document.querySelectorAll(".todo-item")
    const maincontent = this.document.querySelectorAll(".todotxt")
    const checkboxes = document.querySelectorAll(".chkchk")
    

    deletebtns.forEach((del,index) => {
        del.addEventListener('click', async function(){
            await deleteTodo(arrayIDs[index])
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

    addbtn.addEventListener("click", async function(){
        const categ = document.getElementById("todocat")
        let choice = categ.options[categ.selectedIndex].value
        await newTodo(addbar.value, choice)
        arrayIDs = await fetchTodos(current_userID)
        addbar.value = ""
    
    })

    async function deleteTodo(todoID){
        let url = `http://127.0.0.1:5000/delete/${todoID}`
    
        try{
            let response = await fetch(url, {method: "DELETE"})
            let data = await response.json()
    
            if (data.success == false){
                alert("Todo deletion has failed")
            }
            else if (data.success == true)
                alert("Todo deleted successfully")
                arrayIDs = await fetchTodos(current_userID)
        }
        catch (error){console.log("Error deleting the todo: ", error)}
    
    }

    async function getUser(){
        try{
            let response = await fetch('http://127.0.0.1:5000/getuser', {method: 'POST'})
            let data = await response.json()
            console.log(data[0].userID)
    
             const current_userID = data[0].userID;
            const current_uuid = data[0].id;
    
            return {current_userID, current_uuid};
        }
        catch (error){console.log("Error: ", error)}
        
        
    }
    
    async function fetchTodos(ID){
        let url = `http://127.0.0.1:5000/gettasks/${ID}`
    
        try{
            let response = await fetch(url)
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
    
    
    
    async function newTodo(content, category){
        let backendurl = 'http://127.0.0.1:5000/sendtasks'
    
        let completeurl = `${backendurl}?con=${encodeURIComponent(content)}&cat=${encodeURIComponent(category)}`
        try{
            let response = await fetch(completeurl)
            let data = await response.json()
            console.log(data)
            return JSON.stringify(data)
        }
        catch (error){
            console.log(`An error has occured: ${error}`)
        }
        
    
    }

   
})



