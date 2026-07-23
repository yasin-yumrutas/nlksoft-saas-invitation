"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface TenantContextType {
  tenant: any;
  isEditMode: boolean;
  onUpdateConfig: (key: string, value: any) => Promise<void>;
  handleEdit: (key: string, currentValue: string, promptText: string) => void;
  handleEditArray: (key: string, array: any[], index: number, field: string, promptText: string) => void;
  handleAddArrayItem: (key: string, array: any[], newItem: any) => void;
  handleRemoveArrayItem: (key: string, array: any[], index: number) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ 
  children, 
  tenant, 
  isEditMode, 
  onUpdateConfig 
}: { 
  children: ReactNode; 
  tenant: any; 
  isEditMode: boolean; 
  onUpdateConfig: (key: string, value: any) => Promise<void>;
}) {
  
  const handleEdit = (key: string, currentValue: string, promptText: string) => {
    if (!isEditMode) return;
    const newValue = window.prompt(promptText, currentValue);
    if (newValue !== null && newValue !== currentValue) {
      onUpdateConfig(key, newValue);
    }
  };

  const handleEditArray = (key: string, array: any[], index: number, field: string, promptText: string) => {
    if (!isEditMode) return;
    const currentValue = array[index][field];
    const newValue = window.prompt(promptText, currentValue);
    if (newValue !== null && newValue !== currentValue) {
      const newArray = [...array];
      newArray[index] = { ...newArray[index], [field]: newValue };
      onUpdateConfig(key, newArray);
    }
  };

  const handleAddArrayItem = (key: string, array: any[], newItem: any) => {
    if (!isEditMode) return;
    const newArray = [...array, newItem];
    onUpdateConfig(key, newArray);
  };

  const handleRemoveArrayItem = (key: string, array: any[], index: number) => {
    if (!isEditMode) return;
    if (window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      const newArray = array.filter((_, i) => i !== index);
      onUpdateConfig(key, newArray);
    }
  };

  return (
    <TenantContext.Provider value={{ tenant, isEditMode, onUpdateConfig, handleEdit, handleEditArray, handleAddArrayItem, handleRemoveArrayItem }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
