import Contact from '../models/contact.js';

export const listContacts = async (userId, query) => {
  console.log('USER ID:', userId);
  const {
    page = 1,
    perPage = 10,
    sortBy,
    sortOrder = 'asc',
    type,
    isFavourite,
  } = query;

  const skip = (page - 1) * perPage;
  const sortOptions = {};

  if (sortBy) {
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  }

  const filter = {};

  if (type) filter.contactType = type;
  if (typeof isFavourite !== 'undefined')
    filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);
  const contacts = await Contact.find(filter)
    .sort(sortOptions)
    .skip(skip)
    .limit(Number(perPage))
    .lean();

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data: contacts,
    page: Number(page),
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: Number(page) > 1,
    hasNextPage: Number(page) < totalPages,
  };
};

export const getContactById = async (id) => {
  return Contact.findById(id);
};

export const createContact = async (contactData) => {
  return await Contact.create(contactData);
};

export const patchContact = async (id, data) => {
  return await Contact.findByIdAndUpdate(id, data, { new: true });
};

export const removeContact = async (id) => {
  return await Contact.findByIdAndDelete(id);
};
