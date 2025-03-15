from flask import Flask, jsonify, request, session
from flask_cors import CORS, cross_origin
from flask_session import Session
import pymysql
import pymysql.cursors
from dbinfo import hostname, passwdname, databasename, username
from datetime import timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:3000"}}, supports_credentials=True)

app.secret_key = "abcd-1234Maile-IStheGreatestOAT"

app.permanent_session_lifetime = timedelta(days=1)
app.config["SESSION_TYPE"] = "filesystem"  # Store sessions in files
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_COOKIE_SECURE"] = True  # Required for cross-site cookies
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
Session(app)

conn = pymysql.connect(host=hostname, user=username, password=passwdname, database=databasename, port=3306, cursorclass=pymysql.cursors.DictCursor)

#all my stuff gets returned as a dict

def extractUsers(): 
    cursor = conn.cursor()
    userID = session['userID']
    try:
        if not userID:
            print("You are currently not logged in, make sure to log in.")
            return jsonify({"Message": "You are currently not logged in, make sure to log in."})
        else:
            cursor.execute("SELECT userID, uFirstName, uLastName FROM tblUsers WHERE userID = %s", (userID,))
            userDisplay = cursor.fetchall()
            print(userDisplay)
            output = jsonify(userDisplay)  
            return output
    except pymysql.Error as e:
        print("Skill issue")
        return jsonify({"Message": f"An error has occured: {e}"})

def extractTasks(userID):
    cursor = conn.cursor()
    ID = userID
    print(ID)
    try:
        cursor.execute("SELECT * FROM tbltodo WHERE UserID = %s", (userID,))
        taskDisplay = cursor.fetchall()
        return jsonify(taskDisplay)
    except pymysql.Error as e:
        return jsonify({"Message": f"An error has occured: {e}"}), 404
    
def sendTasks(content, category, userId): #new todo in the list for a user
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
    
def registering(fname, lname, email, password1:str, password2: str):
    cursor = conn.cursor()

    if len(password1) < 6:
        return jsonify({"Message": "This password is too short. It must be at least 6 characters. Try again", "Success": False})
    elif password1 != password2:
      return jsonify({"Message": "The following passwords must match", "Success": False})  
    elif password1.isalpha() == True:
        return jsonify({"Message": "This password needs at least one number within it", "Success": False})
    else:
        try:
            sql_params = (fname, lname, email, password1)
            cursor.execute("INSERT INTO tblUsers (uFirstName, uLastName, uEmail, uPassword) VALUES (%s, %s, %s, %s)", sql_params)
            conn.commit()
            cursor.execute("SELECT userID FROM tblUsers WHERE uEmail = %s ", (email,))
            newUserID = cursor.fetchone()
            session["userID"] = newUserID["userID"] #adding to the session
            print(newUserID)
            return jsonify({"Message": "Congratulations, you have been registered", "Success": True})
        except pymysql.DatabaseError as e:
            return jsonify({"Message": str(e), "Success": False})
        except pymysql.Error as e:
            return jsonify({"Message": str(e), "Success": False})
        
def loggingIn(email, passwd):
    cursor = conn.cursor()
    try:
        SQLstring = "SELECT * FROM tblUsers WHERE uEmail = %s AND uPassword = %s"
        cursor.execute(SQLstring, (email, passwd))
        userDetail = cursor.fetchone()

        if not userDetail: 
            return jsonify({"LoginStatus": "Failed",
                            "Message": "This user does not exist on the system, they must register",
                            "userID": "NONE",
                            "LoggedIn": False}
                            )
                    
        else:
            session.permanent = True
            session["userID"] = userDetail["userID"]
            print(session)

            return jsonify({"LoginStatus": "Succeeded",
                             "Message": f"Welcome back {userDetail["uFirstName"]}",
                             "userID": session["userID"],
                             "LoggedIn": True})
    except pymysql.Error as e:
        return jsonify({"Message": f"An error has occured: {e}"}) 
    finally:
        cursor.close()

@app.route("/login", methods=['Post'])
@cross_origin(supports_credentials=True)
def login():
    data = request.get_json()
    userEmail = data["email"]
    userPass = data["password"]

    if not userEmail:
        print("No email")
        return jsonify({"Message": "Missing Email!"})
        
    elif not userPass:
        print("No password")
        return jsonify({"Message": "Missing Password!"})
    else:
        return loggingIn(userEmail, userPass)
    
@app.route("/register", methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    data = request.get_json()
    print(data)
    fname = data['firstname']
    lname = data['lastname']
    email = data['mail']
    password1 = data['passwordfirst']
    password2 = data['passwordsecond']

    print(password1)
    
    if not email:
        return jsonify({"Message": "You need to type an email"})
    elif not fname:
        return jsonify({"Message": "You need to type an email"})
    elif not password1:
        return jsonify({"Message": "You need to type an password"})
    else:
        return registering(fname, lname, email, password1, password2)

#todo display and output related commands
@app.route("/delete/<todoid>", methods=['DELETE'])
def deletetodo(todoid):
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM tbltodo WHERE id = %s ", todoid)
        conn.commit()
        return jsonify({"Success": True, "Message": "It works"})
    except pymysql.DatabaseError as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    except pymysql.Error as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    finally:
        cursor.close()

@app.route("/update/<todoid>", methods=['PUT'])
@cross_origin(supports_credentials=True)
def updatetodo(todoid):

    cursor = conn.cursor()
    query = request.args.get("ed", "")
    try:
        cursor.execute("UPDATE tblTodo SET content = %s WHERE id = %s ", (query,todoid))
        conn.commit()
        return jsonify({"Success": True, "Message": "This database has been updated, thank you"})
    except pymysql.DatabaseError as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    except pymysql.Error as e:
        conn.rollback()
        return jsonify({"Success": False, "Message": f"A database error has occured {e}"})
    finally:
        cursor.close()

@app.route("/logout", methods=["POST"])
@cross_origin(supports_credentials=True)
def logout():
    session.clear()
    return jsonify({"Message": "Logout successful!", "Success": True})

@app.route("/getuser", methods=['POST'])
@cross_origin(supports_credentials=True)
def users():
    print(session)
    try:
        return extractUsers()
    except KeyError:
        print("This session appears to not exist")
        return jsonify({"Message": "No session"})

@app.route("/gettasks", methods=['POST'])
@cross_origin(supports_credentials=True)
def tasks():
    print(session["userID"])
    return extractTasks(session["userID"])

@app.route("/sendtasks", methods=["POST"])
@cross_origin(supports_credentials=True)
def newTodo():
    queryContent = request.args.get("con", "")
    queryCategory = request.args.get("cat", "")
    print(session)


    if not queryCategory:
        return jsonify({"Message": "Missing category, please select at least one"})
    elif not queryContent:
        return jsonify({"Message": "Missing todo activity, please type out one"})
    else:
        return sendTasks(queryContent, queryCategory, session["userID"]) #Sends the new record of todo to the database


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="127.0.0.1")

conn.close()