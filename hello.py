from flask import Flask
from flask import render_template
from dotenv import load_dotenv
import os



app = Flask(__name__)

@app.route("/")
def hello_world():
    
    load_dotenv(".env")
    k = os.environ.get("MAPS_KEY")
    return render_template("index.html", dik=k)

