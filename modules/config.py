import os 
import psycopg2
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap
from flask_login import LoginManager

BASE_DIR =  os.path.abspath(os.path.dirname(__file__))
DB_URI = "postgresql+psycopg2://{username}:{password}@{hostname}/{databasename}".format(username="postgres", password="zxnm123*", hostname="www.lrm.com.ar:5441", databasename="manga")

app = Flask(__name__)
DB_HOST = 'www.lrm.com.ar'
DB_PORT = '5441'
DB_NAME = 'manga'
DB_USER = 'postgres'
DB_PASS = 'zxnm123*'

def get_db_connection():
    """Función para obtener una conexión a la base de datos"""
    return psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS
    )

