# Guia de Deploy - SmartSale

## Deployment em Produção

### Pré-requisitos
- Servidor Linux (Ubuntu 20.04+ recomendado)
- Node.js 18+ instalado
- MySQL 8+ instalado
- Nginx instalado (como reverse proxy)
- SSL Certificate (Let's Encrypt)
- Domain name

## 1. Preparação do Servidor

### Atualizar Sistema
```bash
sudo apt update
sudo apt upgrade -y
```

### Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar MySQL
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Instalar PM2 (Process Manager)
```bash
sudo npm install -g pm2
pm2 startup
pm2 save
```

## 2. Setup do Backend

### Clonar repositório
```bash
cd /home/ubuntu
git clone https://github.com/seu-usuario/smartsale.git
cd smartsale/backend
```

### Instalar dependências
```bash
npm install --production
```

### Build TypeScript
```bash
npm run build
```

### Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com configurações de produção
nano .env
```

Configurações importantes para produção:
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_NAME=smartsale_prod
JWT_SECRET=sua_chave_secreta_muito_segura
SESSION_SECRET=sua_sessao_secreta
FRONTEND_URL=https://seu-dominio.com
STRIPE_SECRET_KEY=sua_chave_stripe_prod
```

### Importar database
```bash
mysql -u root -p smartsale_prod < database.sql
```

### Iniciar com PM2
```bash
pm2 start dist/index.js --name "smartsale-api" --env production
pm2 save
```

## 3. Setup do Frontend

### Clonar e instalar
```bash
cd /home/ubuntu/smartsale/frontend
npm install --production
```

### Build Next.js
```bash
npm run build
```

### Configurar variáveis de ambiente
```bash
cp .env.example .env.production.local
nano .env.production.local
```

Configurações para produção:
```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu_client_id_prod
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=sua_chave_pub_prod
```

### Iniciar com PM2
```bash
pm2 start "npm start" --name "smartsale-web" --cwd /home/ubuntu/smartsale/frontend
pm2 save
```

## 4. Configurar Nginx como Reverse Proxy

### Criar configuração para API
```bash
sudo nano /etc/nginx/sites-available/smartsale-api
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Criar configuração para Frontend
```bash
sudo nano /etc/nginx/sites-available/smartsale-web
```

Conteúdo:
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache estático
    location /_next/static/ {
        proxy_cache_valid 200 1d;
        proxy_pass http://localhost:3000;
    }
}
```

### Habilitar sites
```bash
sudo ln -s /etc/nginx/sites-available/smartsale-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/smartsale-web /etc/nginx/sites-enabled/
```

### Remover default site
```bash
sudo rm /etc/nginx/sites-enabled/default
```

### Testar e recarregar Nginx
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL com Let's Encrypt

### Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Gerar certificados
```bash
sudo certbot certonly --nginx -d seu-dominio.com -d www.seu-dominio.com
sudo certbot certonly --nginx -d api.seu-dominio.com
```

### Configurar renovação automática
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Atualizar Nginx para HTTPS
```bash
sudo nano /etc/nginx/sites-available/smartsale-web
```

Adicione:
```nginx
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # ... resto da configuração ...
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

### Repetir para API
```bash
sudo nano /etc/nginx/sites-available/smartsale-api
```

## 6. Monitoramento e Manutenção

### Verificar status das aplicações
```bash
pm2 status
pm2 logs smartsale-api
pm2 logs smartsale-web
```

### Backup do banco de dados
```bash
mysqldump -u root -p smartsale_prod > backup-$(date +%Y%m%d).sql
```

Configurar backup automático:
```bash
sudo crontab -e
```

Adicione:
```cron
# Backup diário às 2AM
0 2 * * * mysqldump -u root -p smartsale_prod > /backups/smartsale-$(date +\%Y\%m\%d).sql
```

### Monitoramento de performance
```bash
pm2 plus  # Dashboard web do PM2
pm2 monitoring
```

## 7. Updates e Manutenção

### Atualizar código
```bash
cd /home/ubuntu/smartsale
git pull origin main

# Backend
cd backend
npm install --production
npm run build
pm2 restart smartsale-api

# Frontend
cd ../frontend
npm install --production
npm run build
pm2 restart smartsale-web
```

### Verificar logs de erros
```bash
pm2 logs smartsale-api
pm2 logs smartsale-web
```

## 8. Variaáveis de Ambiente em Produção

### Backend
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=smartsale_prod_user
DB_PASSWORD=senha_muito_segura
DB_NAME=smartsale_prod

JWT_SECRET=chave_jwt_produção_super_secreta
JWT_EXPIRE=7d
SESSION_SECRET=sessão_secreta_produção

GOOGLE_CLIENT_ID=id_prod
GOOGLE_CLIENT_SECRET=secret_prod
FACEBOOK_APP_ID=id_prod
FACEBOOK_APP_SECRET=secret_prod

EMAIL_SERVICE=gmail
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_app_password

STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

AMAZON_API_KEY=sua_chave
MERCADO_LIVRE_API_KEY=sua_chave
SHOPEE_API_KEY=sua_chave

FRONTEND_URL=https://seu-dominio.com
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=id_prod
NEXT_PUBLIC_FACEBOOK_APP_ID=id_prod
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 9. Checklist de Deploy

- [ ] Servidor preparado e seguro
- [ ] Node.js e npm instalados
- [ ] MySQL instalado e configurado
- [ ] Nginx instalado
- [ ] Backend deployado e testado
- [ ] Frontend deployado e testado
- [ ] SSL certificados configurados
- [ ] Variáveis de ambiente configuradas
- [ ] Backup de banco de dados funcionando
- [ ] Monitoramento ativo
- [ ] Health checks em lugar
- [ ] Logs configurados
- [ ] Email de alertas funcionando

## 10. Troubleshooting

### Porta já em uso
```bash
lsof -i :3001
kill -9 <PID>
```

### Nginx não responde
```bash
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t  # Verificar sintaxe
```

### Banco de dados não conecta
```bash
mysql -u root -p -e "SELECT VERSION();"
```

### PM2 não inicia
```bash
pm2 delete all
pm2 start app.js
pm2 save
pm2 startup
```

---

Para dúvidas, consulte:
- [README.md](README.md)
- [SETUP.md](SETUP.md)
- [API_DOCS.md](API_DOCS.md)
