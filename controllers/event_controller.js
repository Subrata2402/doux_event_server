const Event = require("../models/event_model");

/**
 * Creates a new event.
 *
 * @async
 * @function createEvent
 * @param {Object} req - The request object.
 * @param {Object} req.body - The body of the request.
 * @param {string} req.body.name - The name of the event.
 * @param {string} req.body.description - The description of the event.
 * @param {string} req.body.date - The date of the event.
 * @param {string} req.body.time - The time of the event.
 * @param {string} req.body.category - The category of the event.
 * @param {Object} req.file - The file object.
 * @param {string} req.file.filename - The filename of the uploaded image.
 * @param {string} req.body.location - The location of the event.
 * @param {Object} req.user - The user object.
 * @param {string} req.user._id - The ID of the user creating the event.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the event is created.
 */
const createEvent = async (req, res) => {
  try {
    const event = new Event({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      category: req.body.category,
      image: req.file.filename || "",
      location: req.body.location,
      organizer: req.user._id
    });
    await event.save();
    res.status(201).send({ success: true, message: "Event created successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Event creation failed", error: error });
  }
}

/**
 * Controller to handle joining an event.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} req.params - Request parameters.
 * @param {string} req.params.id - ID of the event to join.
 * @param {Object} req.user - Authenticated user object.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} - Sends a response indicating the result of the join operation.
 * 
 * @throws {Error} - Sends a 400 status with an error message if the operation fails.
 */
const joinEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    if (event.attendees.includes(req.user._id)) {
      return res.status(400).send({ success: false, message: "You have already joined this event" });
    }
    event.attendees.push(req.user._id);
    await event.save();

    res.status(200).send({ success: true, message: "You have joined the event", data: event });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to join event", error: error });
  }
}

/**
 * Allows a user to leave an event.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the event to leave.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user._id - The ID of the authenticated user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    if (!event.attendees.includes(req.user._id)) {
      return res.status(400).send({ success: false, message: "You have not joined this event" });
    }
    event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.user._id.toString());
    await event.save();
    res.status(200).send({ success: true, message: "You have left the event", data: event });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to leave event", error: error });
  }
}

/**
 * Retrieves a list of events from the database.
 *
 * @async
 * @function eventList
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves to sending the response with the list of events.
 * @throws {Error} - If there is an error fetching the events, sends a 400 status with an error message.
 */
const eventList = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).send({ success: true, data: events });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to fetch events", error: error });
  }
}

/**
 * Retrieves an event by its ID.
 *
 * @async
 * @function getEvent
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.id - The ID of the event to retrieve.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} Sends the event data if found, otherwise sends an error message.
 */
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email").populate("attendees", "name");
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    res.status(200).send({ success: true, message: "Event retrieved successfully", data: event });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to fetch event", error: error });
  }
}

/**
 * Updates an existing event.
 *
 * @async
 * @function updateEvent
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the event to update.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user._id - The ID of the authenticated user.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.title - The new title of the event.
 * @param {string} req.body.description - The new description of the event.
 * @param {string} req.body.date - The new date of the event.
 * @param {string} req.body.time - The new time of the event.
 * @param {Object} req.file - The uploaded file object.
 * @param {string} req.file.filename - The filename of the uploaded image.
 * @param {string} req.body.location - The new location of the event.
 * @param {string} req.body.category - The new category of the event.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the event is updated.
 */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, organizer: req.user._id });
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    event.title = req.body.title;
    event.description = req.body.description;
    event.date = req.body.date;
    event.time = req.body.time;
    event.image = req.file.filename || event.image;
    event.location = req.body.location;
    event.category = req.body.category;
    await event.save();
    res.status(200).send({ success: true, message: "Event updated successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to update event", error: error });
  }
}

/**
 * Deletes an event based on the provided event ID and the organizer's user ID.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the event to delete.
 * @param {Object} req.user - The authenticated user object.
 * @param {string} req.user._id - The ID of the user making the request.
 * @param {Object} res - The response object.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {Error} - If there is an error during the deletion process.
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, organizer: req.user._id });
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    res.status(200).send({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to delete event", error: error });
  }
}

module.exports = { createEvent, eventList, getEvent, updateEvent, deleteEvent, joinEvent, leaveEvent };