# Test Node App

A minimal Express app made for testing deployment to a Linux server. It has no
database or build step — just install and run — so you can focus on the
deployment mechanics (transferring files, process management, reverse proxy,
etc.) rather than the app itself.

## Endpoints

- `GET /` — static HTML page (serves from `public/`)
- `GET /health` — health check, returns `{"status":"ok"}`
- `GET /api/info` — server info (hostname, Node version, uptime, env)
- `POST /api/echo` — echoes back whatever JSON body you send

## 1. Run locally first

```bash
npm install
npm start
# visit http://localhost:3000
```

## 2. Get the code onto the server

Pick one:

**scp** (simplest, no git needed):
```bash
scp -r test-node-app your_user@your_server_ip:/opt/test-node-app
```

**git** (if you push this to a repo):
```bash
ssh your_user@your_server_ip
git clone <your-repo-url> /opt/test-node-app
```

## 3. Install Node and dependencies on the server

```bash
ssh your_user@your_server_ip

# Install Node (Ubuntu/Debian example, adjust version as needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

cd /opt/test-node-app
npm install --omit=dev
```

## 4. Run it

**Quick test (foreground):**
```bash
PORT=3000 npm start
```

**Keep it running after you disconnect — pick ONE:**

### Option A: systemd (recommended for a real server)
A ready-made unit file is included: `test-node-app.service`.

```bash
sudo cp test-node-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now test-node-app
sudo systemctl status test-node-app
journalctl -u test-node-app -f   # tail logs
```
Edit the `User`, `WorkingDirectory`, and `PORT` in the unit file first to
match your setup.

### Option B: pm2 (simpler, popular for Node apps)
```bash
sudo npm install -g pm2
cd /opt/test-node-app
pm2 start server.js --name test-node-app
pm2 save
pm2 startup   # follow the printed instructions to survive reboots
```

## 5. Open the port / put it behind a reverse proxy

Quick test — open the port directly in your firewall:
```bash
sudo ufw allow 3000/tcp
```
Then visit `http://your_server_ip:3000`.

For anything beyond a quick test, put Nginx in front instead of exposing the
Node port directly:

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 6. Verify

```bash
curl http://localhost:3000/health
curl http://your_server_ip/health   # if using Nginx on port 80
```

You should get `{"status":"ok"}` in both cases.
