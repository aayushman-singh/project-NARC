from flask import Flask, jsonify
import subprocess

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({"message": "Welcome to the Flask API running on port 3007!"})

@app.route('/status')
def status():
    return jsonify({"status": "API is running", "port": 3007})

@app.route('/script')
def run_script():
    try:
        result = subprocess.run(['python', 'script.py'], capture_output=True, text=True, check=True)
        return jsonify({"output": result.stdout})
    except subprocess.CalledProcessError as e:
        return jsonify({"error": e.stderr}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3007)
