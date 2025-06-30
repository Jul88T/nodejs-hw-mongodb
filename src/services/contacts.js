import Contact from '../models/contact.js';

export const listContacts = async (userId, query) => {
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

  const filter = { userId };
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

export const getContactById = async (id, userId) => {
  return Contact.findOne({ _id: id, userId });
};

export const createContact = async (contactData, userId) => {
  return await Contact.create({ ...contactData, userId });
};

export const patchContact = async (id, data, userId) => {
  return await Contact.findOneAndUpdate({ _id: id, userId }, data, {
    new: true,
  });
};

export const removeContact = async (id, userId) => {
  return await Contact.findOneAndDelete({ _id: id, userId });
};
