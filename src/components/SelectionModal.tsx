import React, { useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SelectionModalProps {
  title: string;
  items: any[];
  selectedItem: any;
  onSelect: (item: any) => void;
  displayKey: string;
  searchable?: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({
  title,
  items,
  selectedItem,
  onSelect,
  displayKey,
  searchable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
  };

  const handleSelect = (item: any) => {
    onSelect(item);
    handleClose();
  };

  const filteredItems = searchable
    ? items.filter(item =>
        item[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  const getSecondaryText = (item: any) => {
    switch (title) {
      case 'Счета':
        return item.balance !== undefined ? `Баланс: ${item.balance} руб.` : '';
      case 'Организации':
        return item.type ? `Тип: ${item.type}` : '';
      case 'Типы цен':
        return item.tags?.length > 0 ? `Теги: ${item.tags.join(', ')}` : '';
      case 'Склады':
        return item.address || '';
      default:
        return item.description || '';
    }
  };

  const getAdditionalInfo = (item: any) => {
    switch (title) {
      case 'Счета':
        return item.currency ? `Валюта: ${item.currency}` : '';
      case 'Организации':
        return item.inn ? `ИНН: ${item.inn}` : '';
      case 'Склады':
        return '';
      default:
        return '';
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        fullWidth
        onClick={handleOpen}
        sx={{
          mb: 2,
          justifyContent: 'space-between',
          textTransform: 'none',
          height: 'auto',
          minHeight: 56,
          py: 1.5,
        }}
      >
        <Box sx={{ textAlign: 'left', flex: 1 }}>
          <Typography variant="body1">
            {title}
          </Typography>
          {selectedItem ? (
            <Box>
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 'bold' }}
              >
                {selectedItem[displayKey]}
              </Typography>
              {getSecondaryText(selectedItem) && (
                <Typography variant="caption" color="textSecondary">
                  {getSecondaryText(selectedItem)}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Не выбрано
            </Typography>
          )}
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
          ▼
        </Typography>
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pt: 4,
        }}
      >
        <Paper
          sx={{
            width: '95%',
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0',
              bgcolor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}
          >
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {searchable && (
            <Box sx={{ p: 2, pb: 1, bgcolor: 'background.paper' }}>
              <TextField
                fullWidth
                placeholder="Поиск..."
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
          )}

          <List sx={{ overflow: 'auto', flex: 1 }}>
            {filteredItems.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Ничего не найдено"
                  sx={{ textAlign: 'center', py: 2 }}
                />
              </ListItem>
            ) : (
              filteredItems.map((item) => (
                <React.Fragment key={item.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleSelect(item)}
                      sx={{
                        py: 2,
                        px: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: selectedItem?.id === item.id ? 'bold' : 'normal' }}>
                          {item[displayKey] || 'Без названия'}
                        </Typography>
                        {selectedItem?.id === item.id && (
                          <CheckCircleIcon color="primary" />
                        )}
                      </Box>
                      
                      {getSecondaryText(item) && (
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                          {getSecondaryText(item)}
                        </Typography>
                      )}
                      
                      {getAdditionalInfo(item) && (
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                          {getAdditionalInfo(item)}
                        </Typography>
                      )}
                      
                      {/* Для счетов показываем ID если одинаковые названия */}
                      {title === 'Счета' && filteredItems.filter(i => i.name === item.name).length > 1 && (
                        <Typography variant="caption" color="textSecondary">
                          ID: {item.id}
                        </Typography>
                      )}
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Modal>
    </>
  );
};

export default SelectionModal;