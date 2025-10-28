// src/types/profile.ts
export interface UserProfile {
    id: string;
    created_at: string;
    updated_at: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    date_of_birth: string | null;
    fitness_goal: string | null;
    preferred_class_types: string[] | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
}

export interface ProfileFormData {
    full_name: string;
    phone: string;
    date_of_birth: string;
    fitness_goal: string;
    preferred_class_types: string[];
    emergency_contact_name: string;
    emergency_contact_phone: string;
}