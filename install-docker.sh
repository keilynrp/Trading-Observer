#!/bin/bash

# Exit on error
set -e

echo "🐳 Starting Docker Installation for WSL (Ubuntu)..."

# 1. Update package index
echo "📦 Updating package index..."
sudo apt-get update

# 2. Install prerequisites
echo "🛠️ Installing prerequisites..."
sudo apt-get install -y ca-certificates curl gnupg

# 3. Add Docker's official GPG key
echo "🔑 Adding Docker GPG key..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Set up the repository
echo "🗄️ Setting up Docker repository..."
echo \
  "deb [arch=\"$(dpkg --print-architecture)\" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine
echo "⬇️ Installing Docker Engine..."
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Configure User Config
echo "👤 Adding ($USER) to 'docker' group..."
sudo usermod -aG docker $USER

# 7. Use update-alternatives to ensure iptables compatibility (common WSL issue)
echo "🔥 Configuring iptables for WSL compatibility..."
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy

# 8. Start Docker Service
echo "🚀 Starting Docker service..."
sudo service docker start

echo "✅ Installation Complete!"
echo "⚠️  IMPORTANT: You must start Docker manually each time you open WSL (unless you configure your .bashrc)."
echo "👉 Run: sudo service docker start"
echo "👉 You may need to close and reopen this terminal for group membership to take effect."
