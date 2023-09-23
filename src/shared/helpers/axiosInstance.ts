import axios from "axios";
import { toast } from "react-toastify";
import { ErrorCodeEnum, ErrorsEnum, URLPartsEnum } from "../enums";

const API_BASE_URL = process.env.API_KEY;

type ErrorType = {
  message: string;
};

// Kreiramo Axios instancu
const axiosInstance = axios.create({
  // Konfigurišemo bazu API URL-a i druge opcije po potrebi
  baseURL: API_BASE_URL,
  // timeout: 5000, // na primer, postavljamo timeout na 5 sekundi
});

// Dodajemo interceptor za logovanje svakog zahteva pre slanja
axiosInstance.interceptors.request.use(
  (config) => {
    // Ovde možemo ovde dodati dodatne konfiguracije pre slanja zahteva, ako je potrebno

    return config;
  },
  (error) => {
    // Ukoliko dođe do greške pri formiranju zahteva (npr. u slučaju mrežne greške), ovde će biti uhvaćena
    console.error("Error occurred:", error);
    return Promise.reject(error);
  }
);

// Dodajemo interceptor za uhvatanje grešaka u odgovorima
axiosInstance.interceptors.response.use(
  (response) => {
    // Ako je zahtev uspešan, samo proširujemo odgovor bez promena
    return response;
  },
  (error) => {
    // Ako se desi greška, ovde ćemo je uhvatiti\
    console.error("Error occurred:", error);

    const _errorResponse = error.response;
    const _errors: ErrorType[] = _errorResponse.data.errors as ErrorType[];
    let activeErrorMessage = "tttt";

    if (_errors.length > 0 && _errors[0].message) {
      activeErrorMessage = _errors[0].message;
    } else if (error.response.data.message) {
      activeErrorMessage = error.response.data.message;
    } else {
      activeErrorMessage = error.message;
    }

    toast(activeErrorMessage, {
      hideProgressBar: true,
      autoClose: 2000,
      type: "error",
    });

    if (
      _errorResponse.status === ErrorCodeEnum.Unauthorized &&
      _errorResponse.data.key === ErrorsEnum.Unauthorized
    ) {
      setTimeout(() => {
        window.location.href = URLPartsEnum.Login;
      }, 1000);
    }
    // Nemojte zaboraviti da ponovo odbacite grešku kako bi komponente koje koriste Axios mogle nastaviti dalje rukovanje greškom ako je potrebno
    return Promise.reject(error);
  }
);

export default axiosInstance;
