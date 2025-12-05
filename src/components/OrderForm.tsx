import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useOrder } from "../contexts/OrderContext";
import ApiService from "../services/api";
import CustomerSearch from "./CustomerSearch";
import SelectionModal from "./SelectionModal";
import ProductSelection from "./ProductSelection";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Warehouse, Paybox, Organization, PriceType } from "../types";

const steps = ["Клиент", "Параметры", "Товары", "Подтверждение"];

const OrderForm: React.FC = () => {
  const { token, clearToken } = useAuth();
  const navigate = useNavigate();
  const {
    customer,
    warehouse,
    paybox,
    organization,
    priceType,
    items,
    clearOrder,
    setWarehouse,
    setPaybox,
    setOrganization,
    setPriceType,
  } = useOrder();

  const [activeStep, setActiveStep] = useState(0);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [payboxes, setPayboxes] = useState<Paybox[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [priceTypes, setPriceTypes] = useState<PriceType[]>([]);
  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"create" | "create_conduct">("create");
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (token) {
      const service = new ApiService(token);
      setApiService(service);
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const checkTokenAndLoadData = async () => {
      if (!apiService) return;

      setLoading(true);
      setLoadingError("");

      try {
        const warehousesData = await apiService.getWarehouses();
        setTokenValid(true);
        setWarehouses(warehousesData);

        const [payboxesData, organizationsData, priceTypesData] =
          await Promise.all([
            apiService.getPayboxes(),
            apiService.getOrganizations(),
            apiService.getPriceTypes(),
          ]);

        setPayboxes(payboxesData);
        setOrganizations(organizationsData);
        setPriceTypes(priceTypesData);
        
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setTokenValid(false);

        if (error.response?.status === 401 || error.response?.status === 403) {
          setLoadingError(
            "Токен недействителен. Пожалуйста, войдите с действительным токеном"
          );
        } else if (error.message === "Network Error") {
          setLoadingError(
            "Ошибка подключения к серверу. Проверьте интернет-соединение"
          );
        } else {
          setLoadingError(
            "Ошибка загрузки данных. Пожалуйста, попробуйте позже"
          );
        }

        setWarehouses([]);
        setPayboxes([]);
        setOrganizations([]);
        setPriceTypes([]);
      } finally {
        setLoading(false);
      }
    };

    if (apiService) {
      checkTokenAndLoadData();
    }
  }, [apiService]);

  const handleNext = () => {
    if (!tokenValid && activeStep === 0) {
      toast.error("Токен недействителен. Нельзя перейти к следующему шагу");
      return;
    }

    if (activeStep === 0) {
      if (!customer) {
        toast.error("Выберите или введите данные клиента");
        return;
      }
    }

    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleLogout = () => {
    clearToken();
    clearOrder();
    navigate("/");
  };

  const handleCreateSale = useCallback(async (conduct: boolean) => {

    if (isProcessingRef.current) {
      console.warn("Продажа уже обрабатывается");
      return;
    }

    if (
      !apiService ||
      !customer ||
      !warehouse ||
      !paybox ||
      !organization ||
      !priceType ||
      items.length === 0
    ) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);

    const payload = {
    customer_id: customer.id,
    warehouse_id: warehouse.id,
    paybox_id: paybox.id,
    organization_id: organization.id,
    price_type_id: priceType.id, 
    items: items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price || 0,
    })),
  };

    try {

    await apiService.createSale(payload, conduct);
    clearOrder();
    setActiveStep(0);
    toast.success(`Продажа успешно ${conduct ? 'создана и проведена' : 'создана'}!`);
  } catch (error: any) {
    console.error("Error creating sale:", error);
    
    let errorMessage = "Ошибка создания продажи";

    if (error.response?.data?.detail) {
      const errorDetails = error.response.data.detail;
      
      errorMessage += ": ";
      const errors = errorDetails.map((detail: any, index: number) => {
        let msg = detail.msg;
        if (detail.loc && detail.loc.length > 0) {
          const fieldPath = detail.loc.join(".");
          msg += ` (поле: ${fieldPath})`;
        }
        return `${index + 1}. ${msg}`;
      });

      errorMessage += errors.join("; ");
    } else if (error.response?.data?.message) {
      errorMessage += `: ${error.response.data.message}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    } else {
      errorMessage += ": Неизвестная ошибка";
    }
    
    toast.error(errorMessage);
  } finally {
    setIsProcessing(false);
    isProcessingRef.current = false;
    setConfirmDialogOpen(false);
  }
}, [apiService, customer, warehouse, paybox, organization, priceType, items, clearOrder]);

  const handleCreateButtonClick = (conduct: boolean) => {
    setPendingAction(conduct ? "create_conduct" : "create");
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = () => {
    const conduct = pendingAction === "create_conduct";
    handleCreateSale(conduct);
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : !tokenValid ? (
              <Box sx={{ mt: 2 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {loadingError}
                </Alert>
                <Button variant="contained" onClick={handleLogout} fullWidth>
                  Войти с другим токеном
                </Button>
              </Box>
            ) : (
              <CustomerSearch />
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Выберите параметры
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <SelectionModal
                  title="Склады"
                  items={warehouses}
                  selectedItem={warehouse}
                  onSelect={setWarehouse}
                  displayKey="name"
                />

                <SelectionModal
                  title="Счета"
                  items={payboxes}
                  selectedItem={paybox}
                  onSelect={setPaybox}
                  displayKey="name"
                />

                <SelectionModal
                  title="Организации"
                  items={organizations}
                  selectedItem={organization}
                  onSelect={setOrganization}
                  displayKey="work_name"
                />

                <SelectionModal
                  title="Типы цен"
                  items={priceTypes}
                  selectedItem={priceType}
                  onSelect={setPriceType}
                  displayKey="name"
                />
              </>
            )}
          </Box>
        );
      case 2:
        return <ProductSelection />;
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Подтверждение заказа
            </Typography>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Клиент: {customer?.name || "Не указан"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Телефон: {customer?.phone || "Не указан"}
              </Typography>
              {customer?.email && (
                <Typography variant="body2" color="textSecondary">
                  Email: {customer.email}
                </Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Параметры
              </Typography>
              <Typography variant="body2">
                Склад: {warehouse?.name || "Не выбран"}
              </Typography>
              <Typography variant="body2">
                Счет: {paybox?.name || "Не выбран"}
              </Typography>
              <Typography variant="body2">
                Организация: {organization?.name || "Не выбрана"}
              </Typography>
              <Typography variant="body2">
                Тип цены: {priceType?.name || "Не выбран"}
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Товары ({items.length})
              </Typography>
              {items.length === 0 ? (
                <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                  Товары не добавлены
                </Typography>
              ) : (
                <>
                  <List>
                    {items.map((item) => (
                      <ListItem
                        key={item.product.id}
                        secondaryAction={
                          <Typography variant="body1">
                            {item.quantity} × {item.product.price || 0} ={" "}
                            {item.quantity * (item.product.price || 0)} руб.
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={item.product.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="textSecondary"
                              >
                                {item.product.article &&
                                  `Арт: ${item.product.article}`}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" align="right">
                    Итого:{" "}
                    {items.reduce(
                      (sum, item) =>
                        sum + item.quantity * (item.product.price || 0),
                      0
                    )}{" "}
                    руб.
                  </Typography>
                </>
              )}
            </Paper>
          </Box>
        );
      default:
        return "Unknown step";
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" component="h1">
            Создание продажи
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Выйти
          </Button>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {getStepContent(activeStep)}
        </Paper>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Назад
          </Button>

          {activeStep === steps.length - 1 ? (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleCreateButtonClick(false)}
                disabled={
                  isProcessing ||
                  !customer ||
                  !warehouse ||
                  !paybox ||
                  !organization ||
                  !priceType ||
                  items.length === 0
                }
              >
                {isProcessing && pendingAction === "create" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Создать продажу"
                )}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleCreateButtonClick(true)}
                disabled={
                  isProcessing ||
                  !customer ||
                  !warehouse ||
                  !paybox ||
                  !organization ||
                  !priceType ||
                  items.length === 0
                }
              >
                {isProcessing && pendingAction === "create_conduct" ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Создать и провести"
                )}
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                (activeStep === 0 && (!tokenValid || loading || !customer)) ||
                (activeStep === 1 && (!warehouse || !paybox || !organization || !priceType)) ||
                (activeStep === 2 && items.length === 0)
              }
            >
              Далее
            </Button>
          )}
        </Box>
      </Box>

      {/* Диалог подтверждения */}
      <Dialog open={confirmDialogOpen} onClose={handleCloseConfirmDialog}>
        <DialogTitle>Подтверждение</DialogTitle>
        <DialogContent>
          <Typography>
            {pendingAction === "create_conduct" 
              ? "Вы уверены, что хотите создать и провести продажу?" 
              : "Вы уверены, что хотите создать продажу?"}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            После подтверждения будет создана продажа{ pendingAction === "create_conduct" && " и проведена" }.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} disabled={isProcessing}>
            Отмена
          </Button>
          <Button 
            onClick={handleConfirmAction} 
            variant="contained" 
            disabled={isProcessing}
            color={pendingAction === "create_conduct" ? "secondary" : "primary"}
          >
            {isProcessing ? (
              <CircularProgress size={24} color="inherit" />
            ) : pendingAction === "create_conduct" ? (
              "Создать и провести"
            ) : (
              "Создать"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderForm;