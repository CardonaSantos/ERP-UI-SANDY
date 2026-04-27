import { erp } from "@/API/erpApi";
import { erpEndpoints } from "@/API/routes/endpoints";
import { usersQkeys } from "./Qk";
import { UsersSelectResponse } from "@/Types/users/users-types";

export function useGetUsersSelect() {
  return erp.useQueryApi<Array<UsersSelectResponse>>(
    usersQkeys.all,
    erpEndpoints.users.get_users_select,
  );
}
