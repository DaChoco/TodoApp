from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
import pymysql.cursors
from dbinfo import hostname, passwdname, databasename, username

app = Flask(__name__)
CORS(app)

conn = pymysql.connect(host=hostname, user=username, password=passwdname, database=databasename, port=3300, cursorclass=pymysql.cursors.DictCursor)

#all my stuff gets returned as a dict

def extractUsers():
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT userID, uFirstName, uLastName FROM tblUsers WHERE userID = %s", (1,))
        userDisplay = cursor.fetchall()
        output = jsonify(userDisplay)   
        return output
    except pymysql.Error as e:
        print("Skill issue")
        return jsonify({"Message": f"An error has occured: {e}"})

def extractTasks(userID):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM tbltodo WHERE UserID = %s", (userID,))
        taskDisplay = cursor.fetchall()
        return jsonify(taskDisplay)
    except pymysql.Error as e:
        return jsonify({"Message": f"An error has occured: {e}"}), 404
    
def sendTasks(content, category, userId):
    cursor = conn.cursor()
    try:
        SQLString = "INSERT INTO tblTodo (content, dateCreated, category, userID) VALUES (%s, current_timestamp(), %s, %s)"

        SQL_Params = (content, category, userId)
        cursor.execute(SQLString, SQL_Params)
        conn.commit()
        cursor.execute("SELECT * FROM tblTodo")

        tblTodoOutput = cursor.fetchall()
        cursor.close()
        output =  jsonify(tblTodoOutput)

        return output
        
    except pymysql.DatabaseError as e:
        response_msg = {"Message": f"A database error has occured {e}"}
        response_msg = jsonify(response_msg)

        conn.rollback()
        return response_msg
    except pymysql.Error as e:
        response_msg = {"Message": f"An unexpected error has occured {e}"}
        conn.rollback()
        return jsonify(response_msg)
 
def loggingIn(email, passwd):
    cursor = conn.cursor()
    try:
        SQLstring = "SELECT * FROM tblUsers WHERE uEmail = %s AND uPassword = %s"
        cursor.execute(SQLstring, (email, passwd))
        userDetail = cursor.fetchone()

        if not userDetail: 
            return jsonify({"LoginStatus": "Failed",
                            "Message": "This user does not exist on the system, they must register",
                            "UserID": str(userDetail[0]),
                            "LoggedIn": "False"}
                            )
                    
        else:
            return jsonify({"LoginStatus": "Succeeded",
                             "Message": f"Welcome back {userDetail[0]}",
                             "LoggedIn": "True"})
    except pymysql.Error as e:
        return jsonify({"Message": f"An error has occured: {e}"}) 

@app.route("/getuser", methods=['POST'])
def users():
    return extractUsers()

@app.route("/gettasks/<ID>", methods=['GET'])
def tasks(ID):
    return extractTasks(ID)

@app.route("/sendtasks", methods=["GET"])
def newTodo():
    queryContent = request.args.get("con", "")
    queryCategory = request.args.get("cat", "")


    if not queryCategory:
        return jsonify({"Message": "Missing category, please select at least one"})
    elif not queryContent:
        return jsonify({"Message": "Missing todo activity, please type out one"})
    else:
        return sendTasks(queryContent, queryCategory, 1) #Sends the new record of todo to the database

@app.route("/login", methods=['Post'])
def login():
    data = request.get_json()
    userEmail = data.email
    userPass = data.password

    return loggingIn(userEmail, userPass)

@app.route("/delete/<todoid>", methods=['DELETE'])
def deletetodo(todoid):
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tbltodo WHERE id = %s ", todoid)
        currentTodos = cursor.fetchall()
        return jsonify(currentTodos)
    except pymysql.DatabaseError as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    except pymysql.Error as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    finally:
        cursor.close()
@app.route("/update/<todoid>", methods=['PUT'])
def updatetodo(todoid):
    cursor = conn.cursor()
    query = request.args.get("ed", "")
    try:
        cursor.execute("UPDATE tblTodo SET content = %s WHERE id = %s ", (query,todoid))
        return jsonify({"Success": True, "Message": "This database has been updated, thank you"})
    except pymysql.DatabaseError as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    except pymysql.Error as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    finally:
        cursor.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)

conn.close()