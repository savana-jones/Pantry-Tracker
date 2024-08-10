'use client';
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, query, onSnapshot, deleteDoc } from "firebase/firestore"; 
import { db } from './firebase';
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Box, CssBaseline } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
const AnalyticsComponent = dynamic(() => import('./AnalyticsComponent'), { ssr: false });

export default function Home() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: '' });
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const capitalizeWords = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  //add item to db

  const addItem = async (e) => {
    e.preventDefault();
    if (newItem.name !== '' && newItem.quantity !== '') {
      const itemName = capitalizeWords(newItem.name.trim().toLowerCase());
      
      // Check if the item already exists
      const existingItem = items.find(item => item.name.toLowerCase() === itemName.toLowerCase());
      if (existingItem) {
        // Increment quantity
        const itemRef = doc(db, 'items', existingItem.id);
        await updateDoc(itemRef, {
          quantity: parseInt(existingItem.quantity) + parseInt(newItem.quantity)
        });
      } else {
        // Add new item
        await addDoc(collection(db, 'items'), {
          name: itemName,
          quantity: newItem.quantity
        });
      }
      
      setNewItem({name:'', quantity:''});
    }
  };
  

  useEffect(() => {
    const q = query(collection(db, 'items'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let itemsArr = [];
      querySnapshot.forEach((doc) => {
        itemsArr.push({ ...doc.data(), id: doc.id });
      });
      setItems(itemsArr);
      const calculateTotal = () => {
        const totalQuantity = itemsArr.reduce((sum, item) => sum + parseFloat(item.quantity), 0);
        setTotal(totalQuantity);
      };
      calculateTotal();
    });
    return () => unsubscribe();
  }, []);

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Container sx={{ bgcolor: 'black', color: 'white', minHeight: '100vh', py: 4,  height: '100vh',width: '100vw', boxShadow: '0 0 0 100px black' }}>
        <Typography variant="h3" align="center" gutterBottom>Pantry Tracker</Typography>
        <Box component="form" onSubmit={addItem} sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            label="Enter Item"
            variant="outlined"
            fullWidth
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white', borderColor: 'white', backgroundColor: '#424242' } }} // Darker grey
            sx={{ '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
          />
          <TextField
            value={newItem.quantity}
            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            label="Enter Quantity"
            type="number"
            variant="outlined"
            fullWidth
            InputLabelProps={{ style: { color: 'white' } }}
            InputProps={{ style: { color: 'white', borderColor: 'white', backgroundColor: '#424242' } }} // Darker grey
            sx={{ '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ bgcolor: 'black', border: '1px solid white', '&:hover': { bgcolor: 'grey' } }}
          >
            +
          </Button>
        </Box>
        <TextField
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          label="Search items"
          variant="outlined"
          fullWidth
          InputLabelProps={{ style: { color: 'white' } }}
          InputProps={{ style: { color: 'white', borderColor: 'white', backgroundColor: '#424242' } }} // Darker grey
          sx={{ mb: 4, '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
        />
        <List>
          {filteredItems.map((item, id) => (
            <ListItem key={id} sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'grey.900', mb: 2 }}>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ color: 'white', flex: 3 }}>{item.name}</span>
                    <span style={{ color: 'white', flex: 1 }}>{item.quantity}</span>
                  </Box>
                } 
              />
              <IconButton edge="end" aria-label="delete" onClick={() => deleteItem(item.id)}>
                <DeleteIcon style={{ color: 'white' }} />
              </IconButton>
            </ListItem>
          ))}
        </List>
        {filteredItems.length < 1 ? null : (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3 }}>
            <Typography style={{ color: 'white', flex: 3 }}>Total</Typography>
            <Typography style={{ color: 'white', flex: 1 }}>{total}</Typography>
          </Box>
        )}
        <AnalyticsComponent />
      </Container>
    </>
  );
}
