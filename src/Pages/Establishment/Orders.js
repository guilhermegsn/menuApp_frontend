import React from 'react'
import { auth, db } from '../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Orders() {

  const getOrdersByUser = async () => {
    const q = query(
      collection(db, "Order"),
      where("user", "==", auth.currentUser.uid),
      where("establishment", "==", "C1sOox4WzFxuDJ1fkxK5")
    );
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data());
    });
    return items;
  }

 
 
  return (
    <div>Orders</div>
  )
}
