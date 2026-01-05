import os
from dotenv import load_dotenv
from api.app import create_app

load_dotenv()

if __name__ == '__main__':
    app = create_app()
    
    port = int(os.getenv('FLASK_PORT', 8080))
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    print(f"""
    ╔═══════════════════════════════════════╗
    ║     StreamSwarm API Server            ║
    ║                                       ║
    ║  🚀 Running on http://{host}:{port}     ║
    ║  📊 Health: http://{host}:{port}/health║
    ║  📝 API Docs: /api/...                ║
    ╚═══════════════════════════════════════╝
    """)
    
    app.run(host=host, port=port, debug=debug)

