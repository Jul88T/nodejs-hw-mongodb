import Contact from '../models/contact.js';

export const removeContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};

export const patchContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, { new: true });
};

export const createContact = async (contactData) => {
  return await Contact.create(contactData);
};

export const getAllContacts = async () => {
  return Contact.find({});
};

export const getContactById = async (id) => {
  return Contact.findById(id);
};
