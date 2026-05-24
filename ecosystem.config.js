module.exports = {
  apps: [
    {
      name: "iam-backend",
      cwd: "./backend",
      script: "gradlew.bat",
      args: "bootRun",
      interpreter: "none",
      env: {
        JAVA_HOME: process.env.JAVA_HOME || "D:\\dev\\jdk\\zulu25.34.17-ca-jdk25.0.3-win_x64",
      },
    },
    {
      name: "order-backend",
      cwd: "../simple-order-service",
      script: "gradlew.bat",
      args: "bootRun",
      interpreter: "none",
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
      script: "docker",
      args: "compose up -d",
      interpreter: "none",
      autorestart: false,
      max_restarts: 2,
    },
  ],
}
