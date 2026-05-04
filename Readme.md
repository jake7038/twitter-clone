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

## Endpoints da API

### Autenticação
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register/` | Cadastro de usuário | ❌ |
| POST | `/api/auth/login/` | Login (retorna access + refresh token) | ❌ |
| POST | `/api/auth/refresh/` | Renovar token de acesso | ❌ |

### Usuários
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/users/me/` | Perfil do usuário logado | ✅ |
| PATCH | `/api/users/me/` | Atualizar perfil (nome, bio, foto, senha) | ✅ |
| GET | `/api/users/search/?q=<query>` | Buscar usuários | ✅ |
| GET | `/api/users/<username>/` | Perfil público de um usuário | ✅ |
| POST | `/api/users/<username>/follow/` | Seguir/deixar de seguir | ✅ |
| GET | `/api/users/<username>/followers/` | Lista de seguidores | ✅ |
| GET | `/api/users/<username>/following/` | Lista de seguidos | ✅ |
| GET | `/api/users/<username>/posts/` | Posts de um usuário | ✅ |

### Posts
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/posts/feed/` | Feed de posts dos seguidos | ✅ |
| GET | `/api/posts/` | Posts do usuário logado | ✅ |
| POST | `/api/posts/` | Criar post (máx. 280 chars) | ✅ |
| GET | `/api/posts/<id>/` | Detalhes de um post | ✅ |
| PATCH | `/api/posts/<id>/` | Editar post (somente dono) | ✅ |
| DELETE | `/api/posts/<id>/` | Deletar post (somente dono) | ✅ |
| POST | `/api/posts/<id>/like/` | Curtir / descurtir post | ✅ |

### Comentários
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/posts/<id>/comments/` | Listar comentários | ✅ |
| POST | `/api/posts/<id>/comments/` | Criar comentário | ✅ |
| DELETE | `/api/posts/<id>/comments/<cid>/` | Deletar comentário (somente dono) | ✅ |

## Autenticação (JWT Bearer)

Enviar em todas as rotas protegidas:
```
Authorization: Bearer <access_token>
```

## Exemplo de fluxo
```bash
# 1. Cadastrar
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","email":"joao@email.com","password":"senha123","password2":"senha123"}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"joao","password":"senha123"}'
# → retorna {"access": "...", "refresh": "..."}

# 3. Criar post
curl -X POST http://localhost:8000/api/posts/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Olá mundo! Meu primeiro post."}'
```

## Deploy (produção)
1. Definir variáveis de ambiente:
   - `SECRET_KEY` — chave secreta única
   - `DEBUG=False`
   - `DATABASE_URL` — string de conexão PostgreSQL
2. Executar `python manage.py collectstatic`
3. Usar Gunicorn: `gunicorn twitterclone.wsgi:application`

## Admin Django
Acesse `http://localhost:8000/admin/` com o superusuário criado.