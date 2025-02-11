// import IAccount from "../interfaces/IAccount";
import IAnswer from "../interfaces/IAnswer";
import IDriverAccount from "../interfaces/IDriverAccount";
import IKitchenDisplayAccount from "../interfaces/kds/IKitchenDisplayAccount";


export default class ApiController {

    constructor(private account: IKitchenDisplayAccount & IDriverAccount) {
    }

    async defaultHeader(authorization: boolean = true) {
        return {
            companyId: this.getCompanyId(),
            "client-agent": this.account.clientAgent,
            // deviceIdentifier: this.account.deviceIdentifier,
            ...(authorization ? { Authorization: "Bearer " + this.account.token } : {})
        };
    }

    async fetchRequest(
        url: string,
        method: string,
        body: any = null,
        headers: object = {},
        authorization: boolean = true,
        timeout: number = 15000
    ): Promise<IAnswer> {
        const controller = new AbortController();
        const signal = controller.signal;

        // Set timeout for the request
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const defaultHeaders = await this.defaultHeader(authorization);

        const fetchOptions: RequestInit = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...defaultHeaders,
                ...headers
            },
            signal: signal
        };

        if (body) {
            fetchOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, fetchOptions);
            clearTimeout(timeoutId);

            const data = await response.json();

            if (response.ok) {
                return this.fetchSuccess(data);
            } else {
                return this.fetchError(data, response.statusText);
            }
        } catch (error: any) {
            clearTimeout(timeoutId);
            return this.fetchError(error, "Network Error");
        }
    }

    fetchSuccess(response: any): IAnswer {
        if (response.success) {
            return response;
        }
        return {
            ...response,
            data: null
        };
    }

    fetchError(error: any, message: string = "Unknown Error"): IAnswer {
        return {
            success: false,
            data: null,
            exception: error?.message || message,
            message: error?.message || message
        };
    }

    postWithAuth = async (url: string, body: any = {}, headers: any = {}): Promise<IAnswer> => this.fetchRequest(url, "POST", body, headers, true);

    putWithAuth = async (url: string, body: any, headers: any = {}): Promise<IAnswer> => this.fetchRequest(url, "PUT", body, headers, true);

    getWithAuth = async (url: string, headers: any = {}): Promise<IAnswer> => this.fetchRequest(url, "GET", null, headers, true);

    get = async (url: string, headers: any = {}): Promise<IAnswer> => this.fetchRequest(url, "GET", null, headers, false);

    deleteWithAuth = async (url: string, headers: any = {}): Promise<IAnswer> => this.fetchRequest(url, "DELETE", null, headers, true);

    private getCompanyId = (): string => {
        if (this.account?.companyId)
            return this.account.companyId + "";
        return this.account.company.id + "";
    };
}