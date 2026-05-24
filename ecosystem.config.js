module.exports = {
  apps: [
    {
      name: "iam-backend",
      cwd: "./backend",
      script: "cmd.exe",
      args: "/c gradlew.bat bootRun",
      env: {
        JAVA_HOME: process.env.JAVA_HOME || "D:\\dev\\jdk\\zulu25.34.17-ca-jdk25.0.3-win_x64",
      },
    },
    {
      name: "order-backend",
      cwd: "../simple-order-service",
      script: "cmd.exe",
      args: "/c gradlew.bat bootRun",
      env: {
        JAVA_HOME: process.env.JAVA_HOME || "D:\\dev\\jdk\\zulu25.34.17-ca-jdk25.0.3-win_x64",
      },
    },
    {
      name: "iam-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "run dev -- -p 3200",
    },
    {
      name: "iam-db",
      script: "cmd.exe",
      args: "/c docker compose up -d",
      autorestart: false,
      max_restarts: 2,
    },
  ],
}
