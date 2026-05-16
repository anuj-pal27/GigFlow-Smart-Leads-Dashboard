import app from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

const bootstrap = async (): Promise<void> => {
  try {
    await connectDatabase();
    app.listen(env.PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Backend running on port ${env.PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

void bootstrap();
