import pino from "pino";

const isProduction = process.env.NEXT_RUNTIME === "production";

const logger = !isProduction
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      },
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    })
  : pino({ level: "info" });

export default logger;
