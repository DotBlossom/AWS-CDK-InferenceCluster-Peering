from flask import Flask
import subprocess

app = Flask(__name__)

@app.route("/")
def index():
    try:
        # nvidia-smi 명령어 실행
        result = subprocess.check_output(['nvidia-smi', '--query-gpu=driver_version', '--format=csv,noheader'], universal_newlines=True)
        cuda_version = result.strip()
    except FileNotFoundError:
        cuda_version = "CUDA not found"
    return f"CUDA Version: {cuda_version}"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
