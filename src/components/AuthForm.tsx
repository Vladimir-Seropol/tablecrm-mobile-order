import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthForm: React.FC = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const { setToken: setAuthToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Введите токен');
      return;
    }
    
    setAuthToken(token);
    navigate('/order');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            TableCRM
          </Typography>
          <Typography variant="subtitle1" gutterBottom align="center" color="textSecondary">
            Мобильная форма оформления заказа
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Токен авторизации"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setError('');
              }}
              margin="normal"
              required
              helperText="Введите токен для доступа к кассе"
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              size="large"
            >
              Войти
            </Button>
            
            <Typography variant="body2" color="textSecondary" align="center">
              Для получения токена обратитесь к администратору TableCRM
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthForm;