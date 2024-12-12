from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
from typing import Dict, Any
import logging
import traceback

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Define base path for scripts
SCRIPT_BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../', 'frontend', 'pdf_conv'))

def validate_script_path(script_path: str) -> bool:
    """
    Validate that the script path is within the allowed directory
    """
    real_path = os.path.realpath(script_path)
    return os.path.commonpath([real_path, SCRIPT_BASE_PATH]) == SCRIPT_BASE_PATH

def run_script(script_name: str, username: str) -> Dict[str, Any]:
    """
    Run a Python script with the given username parameter
    """
    try:
        # Construct and validate script path
        script_path = os.path.join(SCRIPT_BASE_PATH, f'{script_name}.py')
        
        if not validate_script_path(script_path):
            logger.error(f"Invalid script path attempted: {script_path}")
            return {
                'success': False,
                'error': 'Invalid script path'
            }

        if not os.path.exists(script_path):
            logger.error(f"Script not found: {script_path}")
            return {
                'success': False,
                'error': f'Script {script_name} not found in {SCRIPT_BASE_PATH}'
            }

        logger.info(f"Executing script: {script_path} with username: {username}")

        # Run the script with the username parameter
        result = subprocess.run(
            ['python', script_path, username],
            capture_output=True,
            text=True,
            check=True,
            cwd=SCRIPT_BASE_PATH  # Set working directory to script location
        )

        return {
            'success': True,
            'output': result.stdout,
            'script': script_name,
            'username': username
        }

    except subprocess.CalledProcessError as e:
        logger.error(f"Script execution error: {e.stderr}")
        return {
            'success': False,
            'error': e.stderr,
            'script': script_name,
            'username': username
        }
    except Exception as e:
        logger.error(f"Unexpected error: {traceback.format_exc()}")
        return {
            'success': False,
            'error': str(e),
            'script': script_name,
            'username': username
        }

@app.route('/run/<script_name>', methods=['POST'])
def execute_script(script_name: str):
    """
    Endpoint to run a specific script with a username
    """
    try:
        data = request.get_json()
        if not data or 'username' not in data:
            return jsonify({
                'success': False,
                'error': 'Username is required'
            }), 400

        username = data['username']
        logger.info(f"Executing script {script_name} for username {username}")
        
        result = run_script(script_name, username)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500

    except Exception as e:
        logger.error(f"API error: {traceback.format_exc()}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'script-runner',
        'script_path': SCRIPT_BASE_PATH
    })

if __name__ == '__main__':
    # Verify scripts directory exists
    if not os.path.exists(SCRIPT_BASE_PATH):
        logger.error(f"Scripts directory not found: {SCRIPT_BASE_PATH}")
        os.makedirs(SCRIPT_BASE_PATH, exist_ok=True)
        logger.info(f"Created scripts directory: {SCRIPT_BASE_PATH}")
    
    logger.info(f"Using scripts directory: {SCRIPT_BASE_PATH}")
    logger.info("Starting Flask server on port 5003")
    app.run(host='0.0.0.0', port=5003, debug=False)