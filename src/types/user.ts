export interface Patient {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    dob?: string;
    blood_type?: string;
    allergies?: string;
    conditions?: string;
    medications?: string;
    created_at: string;
  }
  
  export interface Lab {
    id: number;
    lab_name: string;
    email: string;
    phone?: string;
    address?: string;
    license_number: string;
    description?: string;
    created_at: string;
  }
  
  export type UserType = Patient | Lab;