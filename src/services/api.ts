import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "https://app.tablecrm.com/api/v1";

class ApiService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get params() {
    return {
      token: this.token,
    };
  }

  private handleResponse(response: any) {
    return response.data?.result || response.data?.data || [];
  }

  async searchCustomers(phone: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/contragents/`, {
        params: { ...this.params, phone },
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка поиска клиента");
      throw error;
    }
  }

  async getUserByToken() {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/`, {
        params: this.params,
      });

      const userData = response.data?.result || response.data;

      console.log("User data from API:", userData); // Для отладки
      return userData;
    } catch (error: any) {
      console.error("Error fetching user data:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Токен недействителен");
        throw new Error("Invalid token");
      }

      toast.error("Ошибка загрузки данных пользователя");
      throw error;
    }
  }

  async getWarehouses() {
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouses/`, {
        params: this.params,
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка загрузки складов");
      throw error;
    }
  }

  async getCustomers(page: number = 1, limit: number = 50) {
    try {
      const offset = (page - 1) * limit;
      const response = await axios.get(`${API_BASE_URL}/contragents/`, {
        params: { ...this.params, limit, offset },
      });

      return {
        data: this.handleResponse(response),
        total: response.data?.count || 0,
        page,
        limit,
        hasMore: (response.data?.count || 0) > page * limit,
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Ошибка загрузки клиентов");
      return { data: [], total: 0, page: 1, limit, hasMore: false };
    }
  }

  async getPayboxes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/payboxes/`, {
        params: this.params,
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка загрузки счетов");
      throw error;
    }
  }

  async getOrganizations() {
    try {
      const response = await axios.get(`${API_BASE_URL}/organizations/`, {
        params: this.params,
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка загрузки организаций");
      throw error;
    }
  }

  async getPriceTypes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/price_types/`, {
        params: this.params,
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка загрузки типов цен");
      throw error;
    }
  }

  async getNomenclature() {
    try {
      const response = await axios.get(`${API_BASE_URL}/nomenclature/`, {
        params: this.params,
      });
      return this.handleResponse(response);
    } catch (error) {
      toast.error("Ошибка загрузки товаров");
      throw error;
    }
  }


  async createSale(payload: any, conduct: boolean = false) {
    try {
      const dated = Math.floor(Date.now() / 1000);

      const salesData = [
        {
          priority: 0,
          dated: dated,
          operation: "Заказ",
          tax_included: true,
          tax_active: true,
          goods: payload.items.map((item: any) => ({
            price: Number(item.price) || 0,
            quantity: item.quantity,
            unit: 116,
            discount: 0,
            sum_discounted: 0,
            nomenclature: item.product_id,
          })),
          settings: {},
          warehouse: payload.warehouse_id,
          contragent: payload.customer_id,
          paybox: payload.paybox_id,
          organization: payload.organization_id,
          status: conduct, 
          paid_rubles: payload.items
            .reduce(
              (sum: number, item: any) =>
                sum + (Number(item.price) || 0) * item.quantity,
              0
            )
            .toFixed(2),
          paid_lt: 0,
        },
      ];

      const response = await axios.post(
        `${API_BASE_URL}/docs_sales/`,
        salesData,
        {
          params: this.params,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Ошибка создания продажи:", error);
      console.error("Детали ошибки:", error.response?.data);

      throw error;
    }
  }
}
export default ApiService;
