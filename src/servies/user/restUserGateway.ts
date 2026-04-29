import type { ApiClient, ApiResult } from "../http/apiTypes";
import type { ChangePasswordInput } from "../../types/auth";
import type { UserGateway } from "./userGateway";

export class RestUserGateway implements UserGateway {
  constructor(private readonly apiClient: ApiClient) {}

  changePassword(
    input: ChangePasswordInput,
    accessToken: string,
  ): Promise<ApiResult<null>> {
    return this.apiClient.request<null>({
      method: "PATCH",
      path: "/users/change-password",
      accessToken,
      body: {
        old_password: input.oldPassword,
        new_password: input.newPassword,
        confirm_password: input.confirmPassword,
      },
    });
  }
}
