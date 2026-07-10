import { pgTable, text, timestamp, boolean, index } from "drizzle-orm/pg-core";
import { schema } from "./auth-schema";

// Note: Whenever we create schema through drizzle we have to do 2 things must
//    1: Generate migration from schema
//    2: Run the generated migration (then the table will be created in the database)   

export const thread = pgTable("thread", {
  id: text("id").primaryKey(),
  title: text("text").notNull(),
  userId: text("user_id").notNull().references(()=> schema.user.id, {onDelete: "cascade"}), //OnDelete: cascade means if user is deleted it's threads delete also
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// () => {
//     //todo: create an index here - this is for optimisation
// }