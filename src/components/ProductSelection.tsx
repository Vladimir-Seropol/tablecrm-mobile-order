import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  List,
  ListItem,
  Divider,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useAuth } from "../contexts/AuthContext";
import { useOrder } from "../contexts/OrderContext";
import ApiService from "../services/api";

const ProductSelection: React.FC = () => {
  const { token } = useAuth();
  const { items, addItem, updateItemQuantity, removeItem } = useOrder();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [apiService, setApiService] = useState<ApiService | null>(null);
  const [loading, setLoading] = useState(false);
  const productsContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (token) {
      setApiService(new ApiService(token));
    }
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!apiService) return;

      setLoading(true);
      try {
        const productsData = await apiService.getNomenclature();
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiService]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.article?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleQuantityChange = (productId: number, delta: number) => {
    const currentItem = items.find((item) => item.product.id === productId);
    if (currentItem) {
      const newQuantity = currentItem.quantity + delta;
      if (newQuantity > 0) {
        updateItemQuantity(productId, newQuantity);
      } else {
        removeItem(productId);
      }
    }
  };

  const getProductQuantity = (productId: number) => {
    const item = items.find((item) => item.product.id === productId);
    return item ? item.quantity : 0;
  };


  const getProductPrice = (product: any): number => {
    if (!product || product.price === undefined || product.price === null) {
      return 0;
    }
    const price = Number(product.price);
    return isNaN(price) ? 0 : price;
  };


  const formatPrice = (price: any): string => {
    const numericPrice = getProductPrice({ price });
    return numericPrice === 0 ? "0 ₽" : `${numericPrice} ₽`;
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * getProductPrice(item.product),
    0
  );

  const calculateContainerHeight = () => {
    return 250 * 2 + 32;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Выбор товаров
      </Typography>

      {items.length > 0 && (
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 2,
              position: "relative",
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1 }} />
            <Typography
              variant="subtitle1"
              sx={{
                position: "absolute",
                left: 5,
                top: -15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {items.length}
            </Typography>
          </Box>

          <List dense>
            {items.map((item) => {
              const itemPrice = getProductPrice(item.product);
              const itemTotal = item.quantity * itemPrice;

              return (
                <React.Fragment key={item.product.id}>
                  <ListItem sx={{ py: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        justifyContent: "space-between",
                        width: "100%",
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          maxWidth: { sm: "60%", md: "70%" },
                        }}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            mb: 0.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.product.article &&
                            `Арт: ${item.product.article} • `}
                          {formatPrice(item.product.price)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: {
                            xs: "space-between",
                            sm: "flex-end",
                          },
                          gap: { xs: 0.5, sm: 2 },
                          width: { xs: "100%", sm: "auto" },
                          flexShrink: 0,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.paper",
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item.product.id, -1)
                            }
                            sx={{
                              p: { xs: 0.25, sm: 0.5 },
                              "& .MuiSvgIcon-root": {
                                fontSize: { xs: 14, sm: "small" },
                              },
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>

                          <Typography
                            sx={{
                              minWidth: { xs: 24, sm: 32 },
                              textAlign: "center",
                              fontWeight: 500,
                              px: { xs: 0.5, sm: 1 },
                              fontSize: { xs: "0.85rem", sm: "1rem" },
                            }}
                          >
                            {item.quantity}
                          </Typography>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleQuantityChange(item.product.id, 1)
                            }
                            sx={{
                              p: { xs: 0.25, sm: 0.5 },
                              "& .MuiSvgIcon-root": {
                                fontSize: { xs: 14, sm: "small" },
                              },
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            minWidth: { xs: 60, sm: 80 },
                            textAlign: "right",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                            ml: { xs: 0, sm: 0 },
                          }}
                        >
                          {itemTotal} ₽
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.product.id)}
                          sx={{
                            color: "error.main",
                            p: { xs: 0.25, sm: 0.5 },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 16, sm: 20 },
                            },
                            "&:hover": { bgcolor: "error.light" },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>

          <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
            <Typography variant="h6" align="right">
              Итого: {totalAmount} ₽
            </Typography>
          </Box>
        </Paper>
      )}

      <TextField
        fullWidth
        placeholder="Поиск товаров по названию или артикулу..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading ? (
        <Typography textAlign="center" sx={{ py: 4 }}>
          Загрузка товаров...
        </Typography>
      ) : filteredProducts.length === 0 ? (
        <Typography textAlign="center" sx={{ py: 4 }}>
          Товары не найдены
        </Typography>
      ) : (
        <Box
          ref={productsContainerRef}
          sx={{
            height: calculateContainerHeight(),
            overflowY: "auto",
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
              "&:hover": {
                background: "#555",
              },
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 2,
              pb: 2,
            }}
          >
            {filteredProducts.map((product) => {
              const quantity = getProductQuantity(product.id);

              return (
                <Box key={product.id}>
                  <Card
                    sx={{
                      height: "240px",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      border:
                        quantity > 0
                          ? "2px solid #1976d2"
                          : "1px solid #e0e0e0",
                    }}
                  >
                    {quantity > 0 && (
                      <Chip
                        label={`В корзине: ${quantity}`}
                        color="primary"
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 1,
                        }}
                      />
                    )}

                    <CardContent
                      sx={{
                        flexGrow: 1,
                        overflow: "hidden",
                        pb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          height: "2.8em",
                          lineHeight: "1.4em",
                        }}
                      >
                        {product.name}
                      </Typography>

                      {product.article && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                          noWrap
                        >
                          Арт: {product.article}
                        </Typography>
                      )}

                      {product.unit && (
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          gutterBottom
                        >
                          Ед. изм.: {product.unit}
                        </Typography>
                      )}

                      {product.quantity !== undefined && (
                        <Typography variant="body2" color="textSecondary">
                          В наличии: {product.quantity}
                        </Typography>
                      )}

                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{
                          mt: "auto",
                          pt: 1,
                        }}
                      >
                        {formatPrice(product.price)}
                      </Typography>
                    </CardContent>

                    <Box sx={{ p: 2, pt: 0 }}>
                      {quantity > 0 ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, -1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography sx={{ flex: 1, textAlign: "center" }}>
                            {quantity} шт.
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(product.id, 1)}
                            disabled={
                              product.quantity !== undefined &&
                              quantity >= product.quantity
                            }
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => addItem(product)}
                          disabled={
                            product.quantity !== undefined &&
                            product.quantity <= 0
                          }
                          size="small"
                        >
                          Добавить
                        </Button>
                      )}
                    </Box>
                  </Card>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {filteredProducts.length > 0 && (
        <Typography
          variant="caption"
          color="textSecondary"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 1,
            fontStyle: "italic",
          }}
        >
          Показано {filteredProducts.length} товаров. Используйте прокрутку для
          просмотра всех товаров.
        </Typography>
      )}
    </Box>
  );
};

export default ProductSelection;
