import subprocess
import time
import sys
import os

def run_project():
    # Esperar um pouco para iniciar
    time.sleep(2)

    # Rodar frontend
    frontend_process = subprocess.Popen(
        ["python", "-m", "http.server", "3000", "--bind", "localhost"],
        cwd=os.path.join(os.getcwd(), "frontend"),
        shell=True
    )
    
    print("Projeto rodando!")
    print("Pressione Ctrl+C para parar.")
    
    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nParando processos...")
        frontend_process.terminate()

if __name__ == "__main__":
    run_project()