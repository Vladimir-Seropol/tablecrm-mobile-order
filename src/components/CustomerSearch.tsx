import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Button,
  Modal,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useOrder } from "../contexts/OrderContext";
import { useAuth } from "../contexts/AuthContext";
import ApiService from "../services/api";

const CustomerSearch: React.FC = () => {
  const { token } = useAuth();
  const { customer, setCustomer } = useOrder();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isValidPhone, setIsValidPhone] = useState(false);
  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(false);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [showAllCustomers, setShowAllCustomers] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const limit = 20;

  useEffect(() => {
    if (token) {
      setApiService(new ApiService(token));
    }
  }, [token]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!apiService) return;

      setLoading(true);
      try {
        const customersResponse = await apiService.getCustomers(1, limit);
        setCustomersList(customersResponse.data);
        setFilteredCustomers(customersResponse.data);
        setTotalCustomers(customersResponse.total);
        setHasMore(customersResponse.hasMore);

      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (apiService) {
      fetchCustomers();
    }
  }, [apiService]);

  const loadMoreCustomers = async () => {
    if (!apiService || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const customersResponse = await apiService.getCustomers(nextPage, limit);

      setCustomersList((prev) => [...prev, ...customersResponse.data]);
      setFilteredCustomers((prev) => [...prev, ...customersResponse.data]);
      setCurrentPage(nextPage);
      setHasMore(customersResponse.hasMore);
    } catch (error) {
      console.error("Error loading more customers:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customersList);
      return;
    }

    const filtered = customersList.filter(
      (cust) =>
        cust.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cust.phone?.includes(searchTerm) ||
        cust.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customersList]);

  useEffect(() => {
    if (!phone.trim()) {
      setPhoneError("");
      setIsValidPhone(false);
      return;
    }

    const isValid = validatePhone(phone);
    setIsValidPhone(isValid);

    if (!isValid) {
      setPhoneError("Введите корректный номер телефона");
    } else {
      setPhoneError("");
    }
  }, [phone]);

  useEffect(() => {
    if (isValidPhone && phone.trim()) {
      const formattedPhone = formatPhone(phone);

      const existingCustomer = customersList.find(
        (cust) => cust.phone && cust.phone.includes(phone.replace(/\D/g, ""))
      );

      if (existingCustomer) {
        setCustomer(existingCustomer);
      } else {
        const tempCustomer = {
          id: Date.now(),
          name: `Клиент ${formattedPhone}`,
          phone: formattedPhone,
        };
        setCustomer(tempCustomer);
      }
    } else if (!phone.trim() && customer && customer.id > 1000000) {
      setCustomer(null);
    }
  }, [isValidPhone, phone, customersList, customer, setCustomer]);

  const validatePhone = (phoneNumber: string): boolean => {
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    if (
      cleaned.startsWith("+7") ||
      cleaned.startsWith("7") ||
      cleaned.startsWith("8")
    ) {
      const digitsOnly = cleaned.replace(/[^\d]/g, "");
      if (digitsOnly.startsWith("7") || digitsOnly.startsWith("8")) {
        return digitsOnly.length === 11;
      }
    }

    if (cleaned.startsWith("+")) {
      const digitsOnly = cleaned.substring(1).replace(/[^\d]/g, "");
      return digitsOnly.length >= 10 && digitsOnly.length <= 15;
    }

    return false;
  };

  const formatPhone = (phoneNumber: string): string => {
    const cleaned = phoneNumber.replace(/[^\d]/g, "");

    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+7 (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
      }
    }

    return phoneNumber;
  };

  const handleClear = () => {
    setCustomer(null);
    setPhone("");
    setPhoneError("");
    setIsValidPhone(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleSelectCustomer = (selectedCustomer: any) => {
    setCustomer(selectedCustomer);
    if (selectedCustomer.phone) {
      setPhone(selectedCustomer.phone);
    }
    setModalOpen(false);
    setSearchTerm("");
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSearchTerm("");
  };

  const displayedCustomers = showAllCustomers
    ? filteredCustomers.slice(0, 10)
    : filteredCustomers.slice(0, 3);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Клиент
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {customer ? (
            <Paper
              sx={{
                p: 2,
                mb: 2,
                position: "relative",
                bgcolor: "background.default",
              }}
            >
              <IconButton
                size="small"
                onClick={handleClear}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {customer.name}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Телефон: {customer.phone || "Не указан"}
              </Typography>
              {customer.email && (
                <Typography variant="body2" color="textSecondary">
                  Email: {customer.email}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ display: "block", mt: 1 }}
              >
                {customer.id > 1000000 ? "Новый клиент" : "Клиент из базы"}
              </Typography>
            </Paper>
          ) : null}

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Введите или найдите телефон клиента"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+79991234567"
              error={!!phoneError}
              helperText={phoneError || "Формат: +7XXXXXXXXXX"}
              InputProps={{
                endAdornment: phone && isValidPhone && (
                  <InputAdornment position="end">
                    <CheckCircleIcon color="success" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={handleOpenModal}
            startIcon={<PersonIcon />}
            sx={{ mb: 2 }}
          >
            Выбрать из {totalCustomers} клиентов
          </Button>

          {displayedCustomers.length > 0 && !customer && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography
                variant="subtitle2"
                gutterBottom
                color="textSecondary"
              >
                Быстрый выбор клиента:
              </Typography>
              <List dense>
                {displayedCustomers.map((cust) => (
                  <ListItem key={cust.id} disablePadding>
                    <ListItemButton onClick={() => handleSelectCustomer(cust)}>
                      <ListItemText
                        primary={cust.name}
                        secondary={
                          <React.Fragment>
                            {" "}
                            {cust.phone && <span>📞 {cust.phone}</span>}
                            {cust.email && <span> • ✉️ {cust.email}</span>}
                          </React.Fragment>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
              {filteredCustomers.length > 3 && !showAllCustomers && (
                <Button
                  size="small"
                  onClick={() => setShowAllCustomers(true)}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Показать еще {Math.min(filteredCustomers.length - 3, 7)}{" "}
                  клиентов
                </Button>
              )}
              {showAllCustomers && filteredCustomers.length > 10 && (
                <Button
                  size="small"
                  onClick={handleOpenModal}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Показать всех {totalCustomers} клиентов
                </Button>
              )}
              {showAllCustomers && filteredCustomers.length <= 10 && (
                <Button
                  size="small"
                  onClick={() => setShowAllCustomers(false)}
                  sx={{ mt: 1 }}
                  fullWidth
                >
                  Свернуть
                </Button>
              )}
            </Paper>
          )}

          <Modal
            open={modalOpen}
            onClose={handleCloseModal}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: 4,
            }}
          >
            <Paper
              sx={{
                width: "95%",
                maxWidth: 600,
                maxHeight: "80vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <Typography variant="h6">
                  Выберите клиента ({totalCustomers})
                </Typography>
                <IconButton onClick={handleCloseModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box sx={{ p: 2, pb: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Поиск по имени, телефону или email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <List sx={{ overflow: "auto", flex: 1 }}>
                {filteredCustomers.length === 0 ? (
                  <ListItem>
                    <ListItemText
                      primary="Клиенты не найдены"
                      secondary="Попробуйте изменить поисковый запрос"
                      sx={{ textAlign: "center", py: 2 }}
                    />
                  </ListItem>
                ) : (
                  <>
                    {filteredCustomers.map((cust) => (
                      <React.Fragment key={cust.id}>
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={() => handleSelectCustomer(cust)}
                            selected={customer?.id === cust.id}
                            sx={{
                              py: 2,
                              px: 3,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight:
                                      customer?.id === cust.id
                                        ? "bold"
                                        : "normal",
                                  }}
                                >
                                  {cust.name}
                                </Typography>
                              }
                              secondary={
                                <React.Fragment>
                                  {" "}
                                  {cust.phone && (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      📞 {cust.phone}
                                    </Typography>
                                  )}
                                  {cust.email && (
                                    <Typography
                                      variant="body2"
                                      color="textSecondary"
                                    >
                                      ✉️ {cust.email}
                                    </Typography>
                                  )}
                                </React.Fragment>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}

                    {hasMore && !searchTerm && (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Button
                          variant="outlined"
                          onClick={loadMoreCustomers}
                          disabled={loadingMore}
                          startIcon={
                            loadingMore ? (
                              <CircularProgress size={20} />
                            ) : (
                              <ArrowForwardIcon />
                            )
                          }
                        >
                          {loadingMore ? "Загрузка..." : "Загрузить еще"}
                        </Button>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          sx={{ display: "block", mt: 1 }}
                        >
                          Показано {customersList.length} из {totalCustomers}{" "}
                          клиентов
                        </Typography>
                      </Box>
                    )}

                    {!hasMore && customersList.length > 0 && (
                      <Box sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="caption" color="textSecondary">
                          Показаны все {customersList.length} клиентов
                        </Typography>
                      </Box>
                    )}
                  </>
                )}
              </List>
            </Paper>
          </Modal>
        </>
      )}
    </Box>
  );
};

export default CustomerSearch;
