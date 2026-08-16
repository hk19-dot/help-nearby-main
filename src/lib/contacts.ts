// Emergency contacts — backed by real MongoDB API
import { api, ContactData } from './api';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

const mapContact = (c: ContactData): EmergencyContact => ({
  id: c._id,
  name: c.name,
  phone: c.phone,
  relationship: c.relationship,
});

export const getContacts = async (): Promise<EmergencyContact[]> => {
  const res = await api.contacts.list();
  return res.contacts.map(mapContact);
};

export const addContact = async (
  contact: Omit<EmergencyContact, 'id'>
): Promise<EmergencyContact> => {
  const res = await api.contacts.create(contact);
  return mapContact(res.contact);
};

export const updateContact = async (
  id: string,
  updates: Partial<Omit<EmergencyContact, 'id'>>
): Promise<EmergencyContact> => {
  const res = await api.contacts.update(id, updates);
  return mapContact(res.contact);
};

export const deleteContact = async (id: string): Promise<void> => {
  await api.contacts.delete(id);
};
