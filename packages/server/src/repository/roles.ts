import { v4 as uuidv4 } from "uuid";
import database from "../database";

// assign '@everyone' role
export async function assignEveryoneRoleQuery(userId: string) {
  const getRole = await database
    .select<{ id: string }>("id")
    .from("roles")
    .where({
      name: "@everyone",
      is_system: 1,
    })
    .first();

  await database
    .insert({
      id: uuidv4(),
      role_id: getRole.id,
      user_id: userId,
    })
    .into("roles_users");
}
