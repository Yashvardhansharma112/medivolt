import axios from 'axios';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

// Define the record interface
export interface MedicalRecord {
  id: number;
  title: string;
  date: string;
  provider?: string;
  doctor?: string;
  type?: string;
  category?: string;
  notes?: string;
  file_name?: string;
  file_size?: number;
  fileData?: File | null; // Store the actual file object
  created_at: string;
  // Add owner field to track if it's a user or pathlab record
  owner: 'user' | 'pathlab';
  // Add patient ID for pathlab records
  patient_id: string;
  // Add lab ID for pathlab records
  lab_id?: number;
}

const API_BASE_URL = API_URL;

// Define the context type
interface RecordsContextType {
  records: MedicalRecord[];
  addRecord: (record: Omit<MedicalRecord, 'id' | 'created_at'>) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  getUserRecords: (patientId: string) => Promise<MedicalRecord[]>;
  getPathlabRecords: (labId: number) => Promise<MedicalRecord[]>;
  getPatientRecords: (patientId: string) => Promise<MedicalRecord[]>;
  getRecordById: (id: number) => Promise<MedicalRecord | undefined>;
  getCurrentUserRecords: () => Promise<MedicalRecord[]>;
  loading: boolean;
  error: string | null;
  refreshRecords: (patientId?: string, labId?: number) => Promise<void>;
}

// Create the context
export const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

// Create a hook to use the context
export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};

// Create the provider component
interface RecordsProviderProps {
  children: ReactNode;
}

// Helper function to transform database records to match our interface
const transformRecord = (record: any): MedicalRecord => ({
  id: record.id,
  title: record.title,
  date: record.date,
  provider: record.provider,
  doctor: record.doctor,
  type: record.type,
  category: record.category,
  notes: record.notes,
  file_name: record.file_name,
  file_size: record.file_size,
  created_at: record.created_at,
  owner: record.owner,
  patient_id: record.patient_id,
  lab_id: record.lab_id
});

export const RecordsProvider: React.FC<RecordsProviderProps> = ({ children }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
   // Function to refresh records from the API
   const refreshRecords = async (patientId?: string, labId?: number) => {
    setLoading(true);
    try {
      let response;
      
      // If patientId is provided, get records for that patient
      if (patientId) {
        response = await axios.get(`${API_BASE_URL}/records/patient/${patientId}`);
      } 
      // If labId is provided, get records for that lab
      else if (labId) {
        console.log('Lab ID being sent:', labId);
        response = await axios.get(`${API_BASE_URL}/records/lab/${labId}`);
      } 
      // Otherwise, get all records
      else {
        response = await axios.get(`${API_BASE_URL}/records`);
      }
      
      setRecords(response.data.map(transformRecord));
      setError(null);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserRecords = async (): Promise<MedicalRecord[]> => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const userRole = currentUser.role;
      const labId = currentUser.id;
      const patientId = currentUser.patient_id;

      const response = await axios.get(`${API_BASE_URL}/records`, {
        params: {
          userRole,
          labId: userRole === 'pathlab' ? labId : undefined,
          patientId: userRole === 'patient' ? patientId : undefined,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  };

  // Add a new record
  const addRecord = async (record: Omit<MedicalRecord, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      // Format data for API
      const recordData = {
        title: record.title,
        date: record.date,
        provider: record.provider,
        doctor: record.doctor,
        type: record.type,
        category: record.category,
        notes: record.notes,
        fileName: record.file_name,
        fileSize: record.file_size,
        owner: record.owner,
        patientId: record.patient_id,
        labId: record.lab_id
      };
      
      const response = await axios.post(`${API_BASE_URL}/records`, recordData);
      
      // Add the new record to the state
      setRecords(prevRecords => [transformRecord(response.data), ...prevRecords]);
    } catch (err) {
      console.error('Error adding record:', err);
      setError('Failed to add record. Please try again later.');
      throw new Error('Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  // Delete a record by ID
  const deleteRecord = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/records/${id}`);
      
      // Remove the record from state
      setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    } catch (err) {
      console.error('Error deleting record:', err);
      setError('Failed to delete record. Please try again later.');
      throw new Error('Failed to delete record');
    }
  };

  // Get user records by patient ID
  const getUserRecords = async (patientId: string): Promise<MedicalRecord[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/patient/${patientId}`);
      return response.data.map(transformRecord);
    } catch (err) {
      console.error('Error fetching user records:', err);
      throw new Error('Failed to fetch user records');
    }
  };

  // Get pathlab records by lab ID
  const getPathlabRecords = async (labId: number): Promise<MedicalRecord[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/lab/${labId}`);
      return response.data.map(transformRecord);
    } catch (err) {
      console.error('Error fetching pathlab records:', err);
      throw new Error('Failed to fetch pathlab records');
    }
  };
  
  // Get records by patient ID (for pathlab sharing)
  const getPatientRecords = async (patientId: string): Promise<MedicalRecord[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/patient/${patientId}`);
      const transformedRecords = response.data.map(transformRecord);
      return transformedRecords;    
    } catch (err) {
      console.error('Error fetching patient records:', err);
      throw new Error('Failed to fetch patient records');
    }
  };
    
  // Get a specific record by ID
  const getRecordById = async (id: number): Promise<MedicalRecord | undefined> => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/records/${id}`);
      setLoading(false);
      return transformRecord(response.data);
    } catch (err) {
      console.error(`Error fetching record with ID ${id}:`, err);
      setError(`Failed to fetch record with ID ${id}`);
      setLoading(false);
      return undefined;
    }
  };
  // Initial load of records
  useEffect(() => {
    const loadInitialRecords = async () => {
      try {
        await refreshRecords();
      } catch (err) {
        console.error("Error loading initial records:", err);
      }
    };
    
    loadInitialRecords();
  }, []);

  return (
    <RecordsContext.Provider value={{ 
      records, 
      addRecord, 
      deleteRecord,
      getUserRecords, 
      getPathlabRecords,
      getPatientRecords,
      getRecordById,
      getCurrentUserRecords,
      loading,
      error,
      refreshRecords
    }}>
      {children}
    </RecordsContext.Provider>
  );
};
