# TwitterClone — Back-end (Django REST)

## Tecnologias
- Python 3.12 + Django 4.2
- Django REST Framework + SimpleJWT
- SQLite (desenvolvimento) / PostgreSQL (produção)
- django-cors-headers + Pillow

## Instalação e execução local

```bash
# 1. Clonar o repositório
git clone <URL_DO_REPO>
cd twitterclone

# 2. Criar e ativar ambiente virtual
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Aplicar migrações
python manage.py migrate

# 5. (Opcional) Criar superusuário para o admin
python manage.py createsuperuser

# 6. Iniciar servidor
python manage.py runserver
```

A API estará disponível em `http://localhost:8000/api/`.


## Suporte ao Admin Django
Acesse `http://localhost:8000/admin/` com o superusuário criado.

# Para rodar o Front

Localização ./front-clone-twitter

#.env

VITE_API_URL = <sua url ou a url do meu servidor>

#como rodar?

```bash
cd ront-clone-twitter
npm run dev
```