import type { ApiResult } from "../http/apiTypes";
import type { ChangePasswordInput } from "../../types/auth";

export interface UserGateway {
  changePassword(
    input: ChangePasswordInput,
    accessToken: string,
  ): Promise<ApiResult<null>>;
}
