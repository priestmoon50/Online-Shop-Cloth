import IAnswer from "../interfaces/IAnswer";
import IDriverAccount from "../interfaces/IDriverAccount";
import IKitchenDisplayAccount from "../interfaces/kds/IKitchenDisplayAccount";

// انواع مشخص برای Body و Headers
type RequestBody = Record<string, unknown> | null;
type RequestHeaders = Record<string, string>;

export default class ApiController {
  constructor(private account: IKitchenDisplayAccount & IDriverAccount) {}

  async defaultHeader(authorization = true): Promise<RequestHeaders> {
    return {
      companyId: this.getCompanyId(),
      "client-agent": this.account.clientAgent,
      ...(authorization ? { Authorization: "Bearer " + this.account.token } : {}),
    };
  }

  async fetchRequest(
    url: string,
    method: string,
    body: RequestBody = null,
    headers: RequestHeaders = {},
    authorization = true,
    timeout = 15000
  ): Promise<IAnswer> {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const defaultHeaders = await this.defaultHeader(authorization);

    const fetchOptions: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...defaultHeaders,
        ...headers,
      },
      signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);

      const data = await response.json();

      return response.ok
        ? this.fetchSuccess(data)
        : this.fetchError(data, response.statusText);
    } catch (error) {
      clearTimeout(timeoutId);
      const err = error as { message?: string };
      return this.fetchError(err, "Network Error");
    }
  }

  fetchSuccess(response: unknown): IAnswer {
    if (typeof response === "object" && response !== null && "success" in response && (response as IAnswer).success) {
      return response as IAnswer;
    }

    return {
      success: false,
      data: null,
      message: "Unknown error",
      exception: "Unknown error",
    };
  }

  fetchError(error: unknown, message = "Unknown Error"): IAnswer {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : message;

    return {
      success: false,
      data: null,
      message: errorMessage,
      exception: errorMessage,
    };
  }

  postWithAuth = async (
    url: string,
    body: RequestBody = {},
    headers: RequestHeaders = {}
  ): Promise<IAnswer> => this.fetchRequest(url, "POST", body, headers, true);

  putWithAuth = async (
    url: string,
    body: RequestBody,
    headers: RequestHeaders = {}
  ): Promise<IAnswer> => this.fetchRequest(url, "PUT", body, headers, true);

  getWithAuth = async (
    url: string,
    headers: RequestHeaders = {}
  ): Promise<IAnswer> => this.fetchRequest(url, "GET", null, headers, true);

  get = async (
    url: string,
    headers: RequestHeaders = {}
  ): Promise<IAnswer> => this.fetchRequest(url, "GET", null, headers, false);

  deleteWithAuth = async (
    url: string,
    headers: RequestHeaders = {}
  ): Promise<IAnswer> => this.fetchRequest(url, "DELETE", null, headers, true);

  private getCompanyId = (): string => {
    if (this.account?.companyId) return this.account.companyId + "";
    return this.account.company.id + "";
  };
}
