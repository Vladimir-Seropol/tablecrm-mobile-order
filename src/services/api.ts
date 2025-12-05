import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://app.tablecrm.com/api/v1';

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
      toast.error('Ошибка поиска клиента');
      throw error;
    }
  }

  async getUserByToken() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/`, {
      params: this.params,
    });
    
    const userData = response.data?.result || response.data;
    
    return userData;
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      toast.error('Токен недействителен');
      throw new Error('Invalid token');
    }
    
    toast.error('Ошибка загрузки данных пользователя');
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
      toast.error('Ошибка загрузки складов');
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
      hasMore: (response.data?.count || 0) > page * limit
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    toast.error('Ошибка загрузки клиентов');
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
      toast.error('Ошибка загрузки счетов');
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
      toast.error('Ошибка загрузки организаций');
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
      toast.error('Ошибка загрузки типов цен');
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
      toast.error('Ошибка загрузки товаров');
      throw error;
    }
  }

 async createSale(payload: any, conduct: boolean = false) {
  try {
    console.log("Отправка данных на сервер:", payload);
    
    // Подготовка данных
    const requestData = {
      customer_id: payload.customer_id,
      warehouse_id: payload.warehouse_id,
      paybox_id: payload.paybox_id,
      organization_id: payload.organization_id,
      price_type_id: payload.price_type_id,
      items: payload.items,
      conduct: conduct
    };

    console.log("Данные для отправки:", requestData);

    const response = await axios.post(
      `${API_BASE_URL}/docs_sales/`,
      requestData,
      { 
        params: this.params,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log("Ответ сервера:", response.data);
    
    toast.success('Продажа успешно создана');
    return response.data;
  } catch (error: any) {
    // Обработка ошибок...
  }
}
}

export default ApiService;