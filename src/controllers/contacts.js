import createError from 'http-errors';
import {
  createContact,
  removeContact,
  patchContact,
  listContacts,
  getContactById as getContactByIdService,
} from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  try {
    const result = await listContacts(req.user.id, req.query);

    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
    });
  }
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await getContactByIdService(contactId, req.user.id);
  if (!contact) throw createError(404, 'Contact not found');
  res.json({
    status: 200,
    message: 'Successfully found contact!',
    data: contact,
  });
};

export const addContact = async (req, res, next) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);

    let photoUrl = null;

    if (req.file) {
      photoUrl = req.file.path;
    }

    const contactData = {
      ...req.body,
      photo: photoUrl,
    };

    const newContact = await createContact(contactData, req.user.id);

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: newContact,
    });
  } catch (error) {
    console.error('❌ addContact error:', error.message);
    next(createError(500, 'Failed to create contact'));
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    let photoUrl = null;

    if (req.file) {
      photoUrl = req.file.path;
    }

    const updateData = {
      ...req.body,
    };

    if (photoUrl) {
      updateData.photo = photoUrl;
    }

    const updatedContact = await patchContact(
      contactId,
      updateData,
      req.user.id
    );
    if (!updatedContact) throw createError(404, 'Contact not found');

    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: updatedContact,
    });
  } catch (error) {
    console.error('❌ updateContact error:', error.message);
    next(createError(500, 'Failed to update contact'));
  }
};

export const deleteContact = async (req, res) => {
  const deleted = await removeContact(req.params.contactId, req.user.id);
  if (!deleted) throw createError(404, 'Contact not found');
  res.status(204).send();
};
