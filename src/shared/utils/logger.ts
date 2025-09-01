export class LoggerService {
  private context: string = "";

  setContext(context: string) {
    this.context = context;
  }

  error(exception: any, requestId?: string) {
    console.error(`[${this.context}] ${requestId ? `[${requestId}]` : ""}`, {
      message: exception?.message,
      stack: exception?.stack,
      cause: exception?.cause,
      name: exception?.name,
      timestamp: new Date().toISOString(),
    });
  }

  warn(message: string, data?: any) {
    console.warn(`[${this.context}]`, message, data);
  }

  log(message: string, data?: any) {
    console.log(`[${this.context}]`, message, data);
  }
}
