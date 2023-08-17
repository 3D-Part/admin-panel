import { LoginResponseData } from "../types";

const addJwtToken = (data: LoginResponseData) => {
  document.cookie = `jwtToken=${data.auth}; path=/; secure; samesite=strict`;

  // document.cookie = `jwtToken=${data.auth}; expires=${new Date(
  //   Date.now() + 7 * 24 * 60 * 60 * 1000
  // ).toUTCString()}; path=/; secure; samesite=strict`;
};

const deleteJwtToken = () => {
  // Postavite ime kolačića na ime JWT tokena koji koristite
  const jwtCookieName = "jwtToken";

  // Postavite datum isteka kolačića na prethodni trenutak (01.01.1970)
  const expirationDate = new Date(0);

  // Postavljanje kolačića sa istekom na prethodni datum
  document.cookie = `${jwtCookieName}=;expires=${expirationDate.toUTCString()}; path=/; secure; samesite=strict`;
};

const JWT = {
  addJwtToken,
  deleteJwtToken,
};

export default JWT;
