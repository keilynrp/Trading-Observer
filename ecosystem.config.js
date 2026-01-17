module.exports = {
    apps: [
        {
            name: "trading-frontend",
            script: "./node_modules/next/dist/bin/next",
            args: "dev -p 3000",
            interpreter: "node",
            watch: false,
            autorestart: true,
            restart_delay: 5000,
            env: {
                NODE_ENV: "development",
            }
        },
        {
            name: "trading-backend",
            script: "./server/index.mjs",
            interpreter: "node",
            watch: false,
            autorestart: true,
            restart_delay: 5000,
            env: {
                NODE_ENV: "development",
                WS_PORT: 3001
            }
        }
    ]
};
