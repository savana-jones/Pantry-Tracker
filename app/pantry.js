'use client'
import React,{useState,useEffect} from 'react';
import { collection, addDoc, doc , getDoc, querySnapshot,updateDoc, query, onSnapshot, deleteDoc } from "firebase/firestore"; 
import {db} from './firebase'
//WITHOUT Material UI
export default function Home() {
const [items,setItems]=useState([
  //{name:'Cereal',quantity:50},
  //{name:'Pasta',quantity:80},
  //{name:'noodles',quantity:100},
]);
const [newItem,setNewItem]=useState({name:'',quantity:''})
const [total,setTotal]=useState(0)
const [searchQuery, setSearchQuery] = useState('');

//Add item to db
const addItem = async (e) => {
  e.preventDefault();
  if (newItem.name !== '' && newItem.quantity !== '') {
    const itemName = newItem.name.trim().toLowerCase();
    
    // Check if the item already exists
    const existingItem = items.find(item => item.name.toLowerCase() === itemName);
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

//Read from db
useEffect(()=>{
  const q=query(collection(db,'items'));
  const unsubscribe = onSnapshot(q,(querySnapshot)=>{
    let itemsArr=[];

    querySnapshot.forEach((doc)=>{
      itemsArr.push({...doc.data(), id: doc.id})
    });
    setItems(itemsArr);


    //read total from itemsArr
    const calculateTotal =() =>{
      const totalQuantity =itemsArr.reduce((sum,item) => sum+ parseFloat(item.quantity),0)
      setTotal(totalQuantity)
    }
    calculateTotal()
    return () => unsubscribe();
  });
}, []);

//delete from db
const deleteItem = async (id) =>{
  await deleteDoc(doc(db, 'items',id));
};

// Filter items based on search query
const filteredItems = items.filter(item =>
  item.name.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <main className="flex min-h-screen flex-col items-center justify-between sm:p-24 p-4 bg-black text-white" >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h3 className="text-4xl p-4 text-center text-white">Pantry Tracker</h3>
        <div className="bg-slate-800 p-4 rounded-lg">
          <form className="grid grid-cols-6 items-center text-black">
            <input value={newItem.name} onChange={(e)=>setNewItem({...newItem,name:e.target.value})} className="col-span-3 p-3 border" type="text" placeholder="Enter Item" />
            <input value={newItem.quantity} onChange={(e)=>setNewItem({...newItem,quantity:e.target.value})} className="col-span-2 p-3 border mx-3" type="number" placeholder="Enter Quantity" />
            <button onClick={addItem} className="text-white bg-slate-950 hover:bg-slate-900 p-3 text-xl" type="submit">+</button>
          </form>
          <div className="my-4">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-3 border text-black"
              type="text" 
              placeholder="Search items"
            />
          </div>
          <ul>
            {filteredItems.map((item,id)=>(
              <li key={id} className='my-4 w-full flex justify-between bg-slate-950'>
                <div className='p-4 w-full flex justify-between'>
                  <span className='capitalize'>{item.name}</span>
                  <span>{item.quantity}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900 w-16'>
                  X
                </button>
              </li>
          ))}
          </ul>
          {filteredItems.length <1 ?('') :(
            <div className='flex justify-between p-3'>
              <span>Total</span>
              <span>{total}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
