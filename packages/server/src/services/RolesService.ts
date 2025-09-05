import database from "../database";
import { Role } from "../ee/controllers/v1/roles/getOne";

const DEFAULT_ROLE = "member";

export class RoleService {
  static async deleteRole(roleId: string): Promise<{ code: number; message: string }> {
    const role: Role | null = await database.role.findUnique({ where: { id: roleId } });
    if (!role) return { code: 404, message: "Role not found" };

    if (role.slug === DEFAULT_ROLE) {
      return { code: 400, message: "Default role cannot be deleted" };
    }

    const defaultRole = await database.role.findUnique({ where: { slug: DEFAULT_ROLE } });
    if (!defaultRole) {
      return { code: 500, message: "Default role not found" };
    }

    await database.user.updateMany({
      where: { roleId },
      data: { roleId: defaultRole.id },
    });

    await database.role.update({
      where: { id: roleId },
      data: { deletedAt: new Date() },
    });

    return { code: 200, message: "Role deleted and users reassigned to default role" };
  }
}
