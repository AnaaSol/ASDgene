import psycopg2
from flask import Flask, jsonify, render_template, request
import json

app = Flask(__name__)

# Configuración de conexión a la base de datos PostgreSQL
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'postgres'
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

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/get_data', methods=['POST'])
def get_data():
    data_type = request.json.get('data_type')
    conn = get_db_connection()
    cur = conn.cursor()

    if data_type == 'sfari':
        cur.execute("SELECT puntaje_sfari_id, COUNT(*) FROM genes.gen GROUP BY puntaje_sfari_id")
        labels = ['1', '2', '3', 'S']
    elif data_type == 'eagle':
        cur.execute("SELECT puntaje_eagle_id, COUNT(*) FROM genes.gen GROUP BY puntaje_eagle_id")
    elif data_type == 'clasificacion':
        cur.execute("SELECT c.nombre_categoria, COUNT(*) FROM genes.gen_categorizado gc JOIN genes.categoria_genetica c ON gc.categoria_id = c.id GROUP BY c.nombre_categoria")
    elif data_type == 'cromosoma':
        cur.execute("SELECT cromosoma, COUNT(*) FROM genes.gen GROUP BY cromosoma ORDER BY CASE WHEN cromosoma ~ '^[0-9]+$' THEN lpad(cromosoma, 2, '0') WHEN cromosoma = 'X' THEN '98' WHEN cromosoma = 'Y' THEN '99' ELSE cromosoma END ASC;")
    else:
        return jsonify({"error": "Tipo de datos no válido"}), 400

    data = cur.fetchall()
    cur.close()
    conn.close()

    response_data = {"labels": labels if data_type == 'sfari' else [item[0] for item in data], "counts": [item[1] for item in data]}
    return jsonify(response_data)

if __name__ == "__main__":
    app.run(debug=True)
