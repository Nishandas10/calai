require("dotenv").config();
import { setupDatabase } from "../lib/models/schema";

const initializeDatabase = async () => {
  try {
    console.log("Starting database initialization...");

    const success = await setupDatabase();

    if (success) {
      console.log("Database initialization completed successfully!");
      process.exit(0);
    } else {
      console.error("Database initialization failed.");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error during database initialization:", error);
    process.exit(1);
  }
};

initializeDatabase();
