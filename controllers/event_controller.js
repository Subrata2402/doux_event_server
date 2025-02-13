const Event = require("../models/event_model");

const createEvent = async (req, res) => {
  try {
    const event = new Event({
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
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

const eventList = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).send({ success: true, data: events });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to fetch events", error: error });
  }
}

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).send({ success: false, message: "Event not found" });
    }
    res.status(200).send({ success: true, event: event });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to fetch event", error: error });
  }
}

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
    await event.save();
    res.status(200).send({ success: true, message: "Event updated successfully" });
  } catch (error) {
    res.status(400).send({ success: false, message: "Failed to update event", error: error });
  }
}

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