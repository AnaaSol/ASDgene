import psycopg2
from flask import Flask, jsonify, render_template, request
import json
import itertools

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

@app.route('/genes')
def gene_view():
    return render_template('genomic.html')

@app.route('/get_genes')
def get_genes():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, simbolo FROM genes.gen WHERE secuencia <> 'NULL';")
    genes = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify({"genes": [{"id": gene[0], "symbol": gene[1]} for gene in genes]})

@app.route('/get_gene_data/<int:gene_id>', methods=['GET'])
def get_gene_data(gene_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT secuencia FROM genes.gen WHERE id = %s", (gene_id,))
    result = cur.fetchone()

    sequence = result[0]

    total_length = len(sequence)
    
    percent_a = (sequence.count('A') / total_length) * 100
    percent_t = (sequence.count('T') / total_length) * 100
    percent_c = (sequence.count('C') / total_length) * 100
    percent_g = (sequence.count('G') / total_length) * 100
    percent_cg = percent_c + percent_g

    # Generación de todas las combinaciones posibles de 8-mers
    bases = ['A', 'T', 'C', 'G']
    combinaciones_8mers = [''.join(p) for p in itertools.product(bases, repeat=8)]
    
    # Inicializar un diccionario con todas las combinaciones de 8-mers con frecuencia 0
    frecuencias_8mers = {mer: 0 for mer in combinaciones_8mers}
    
    # Contar las ocurrencias de cada 8-mer en la secuencia
    for i in range(len(sequence) - 7):
        mer = sequence[i:i+8]
        if mer in frecuencias_8mers:
            frecuencias_8mers[mer] += 1

    # Normalizar las frecuencias para escalarlas de 0 a 100
    max_count = max(frecuencias_8mers.values(), default=1)  # default=1 para evitar división por cero si no hay 8-mers
    scaled_mers = [(frecuencias_8mers[mer] / max_count) * 100 for mer in combinaciones_8mers]

    cur.close()
    conn.close()

    return jsonify({
        "sequence": sequence,
        "percent_a": percent_a,
        "percent_t": percent_t,
        "percent_c": percent_c,
        "percent_g": percent_g,
        "percent_cg": percent_cg,
        "mers": scaled_mers
    })


if __name__ == "__main__":
    app.run(debug=True)
