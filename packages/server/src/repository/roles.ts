import { v4 as uuidv4 } from "uuid";
import database from "../database";

// assign '@everyone' role
export const assignEveryoneRoleQuery = async (userId: string) =>
  await database.transaction(async (trx) => {
    const getRole = await trx
      .select<{ id: string }>("id")
      .from("roles")
      .where({
        name: "@everyone",
        is_system: 1,
      })
      .first();

    await trx
      .insert({
        id: uuidv4(),
        role_id: getRole.id,
        user_id: userId,
      })
      .into("roles_users");
  });
