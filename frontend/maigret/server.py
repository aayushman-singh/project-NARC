from flask import Flask, request, jsonify
import os
import subprocess
import re  # Import regex for URL extraction
import sys
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
project_root = os.path.dirname(os.path.abspath(__file__))
reports_dir = os.path.join(project_root, 'reports')

if not os.path.exists(reports_dir):
    os.makedirs(reports_dir)

def sanitize_filename(filename):
    return ''.join([c if c.isalnum() else '_' for c in filename]).lower()
@app.route('/api/search', methods=['POST'])
def search_user():
    data = request.get_json()
    username = data.get('username')
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400

    sanitized_username = sanitize_filename(username)
    json_file_path = os.path.join(reports_dir, f'report_{sanitized_username}.json')

    command = f'maigret {username} --json ndjson --timeout 7 --no-recursion --top-sites 20 --retries 0'

    # Determine the shell to use based on the OS
    if os.name == 'nt':  # Windows
        shell_command = ['cmd', '/c', command]
    else:  # Unix-based systems (Linux, macOS)
        shell_command = ['/bin/bash', '-c', command]

    try:
        maigret_process = subprocess.Popen(
            shell_command,
            cwd=project_root,
            shell=False,  # Ensure this is False since we specify the shell explicitly
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )

        output_data = []
        error_data = []

        # Read stdout and stderr streams
        for line in maigret_process.stdout:
            output_data.append(line.strip())
            print(f'Maigret Output: {line.strip()}')

        for line in maigret_process.stderr:
            error_data.append(line.strip())
            print(f'Error: {line.strip()}', file=sys.stderr)

        maigret_process.wait()

        if maigret_process.returncode == 0:
            # Extract URLs from output
            urls = []
            url_pattern = re.compile(r'(https?://\S+)')
            for line in output_data:
                found_urls = url_pattern.findall(line)
                urls.extend(found_urls)
            print("Extracted URLs:", urls)
            return jsonify({
                'message': 'Maigret finished successfully',
                'urls': urls
            }), 200
        else:
            return jsonify({
                'error': f'Maigret process exited with code {maigret_process.returncode}',
                'details': "\n".join(error_data)
            }), 500

    except FileNotFoundError:
        print("Maigret command not found. Ensure it is installed and in PATH.")
        return jsonify({'error': 'Maigret command not found. Ensure it is installed and in PATH.'}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = 5000
    print(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)  # Enable debug for better 
