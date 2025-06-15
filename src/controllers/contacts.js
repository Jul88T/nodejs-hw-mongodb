import createError from 'http-errors';
import {
  createContact,
  removeContact,
  patchContact,
} from '../services/contacts.js';
import Contact from '../models/contact.js';

export const getAllContacts = async (req, res) => {
  const contacts = await Contact.find();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully found contact!',
    data: contact,
  });
};

export const addContact = async (req, res) => {
  const newContact = await createContact(req.body);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updatedContact = await patchContact(contactId, req.body);
  if (!updatedContact) throw createError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: 'Successfully updated contact!',
    data: updatedContact,
  });
};

export const deleteContact = async (req, res) => {
  const deleted = await removeContact(req.params.contactId);
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};
