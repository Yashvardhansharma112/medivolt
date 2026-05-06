import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Lab, Patient } from '../types/user';
import { API_URL } from '@/lib/api';

export function useUserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const id = userRole === 'patient' ? currentUser.id : currentUser.id;

    async function fetchUserData() {
      setLoading(true);
      try {
        if (userRole === 'patient') {
          const res = await axios.get(`${API_URL}/patients/${id}`);
          setUserData(res.data);
        } else if (userRole === 'pathlab') {
          const res = await axios.get(`${API_URL}/labs/${id}`);
          setUserData(res.data);
        }
      } catch (err) {
        setUserData(null);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchUserData();
  }, []);

  const updateUserData = async (id, updates) => {
    const userRole = localStorage.getItem('userRole');
    try {
      let response;
      if (userRole === 'patient') {
        response = await axios.put(`${API_URL}/patients/${id}`, updates);
      } else if (userRole === 'pathlab') {
        response = await axios.put(`${API_URL}/labs/${id}`, updates);
      }
      return response.data;
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  return { userData, loading, updateUserData };
}