import { API } from "@/shared/helpers";
import JWT from "@/shared/helpers/jwtToken";
import { LoginData, LoginResponseData } from "@/shared/types";

const API_BASE_URL = process.env.API_KEY;

const login = async (body: LoginData): Promise<LoginResponseData | null> => {
  try {
    const data: LoginResponseData = await API.post(
      `${API_BASE_URL}/shop/login/`,
      body
    );

    if (data.auth) {
      // Save the JWT token in an HTTP cookie
      // document.cookie = `jwtToken=${data.auth}; path=/; secure; samesite=strict; httpOnly`;
      JWT.addJwtToken(data);
    }
    return data;
  } catch (error) {
    return null;
  }
};

const loginAPI = {
  login,
};

export default loginAPI;
